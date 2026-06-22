const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');
const catchAsync = require('../Utils/catchAsync');
const Email = require('../Utils/email');
const AppError = require('../Utils/appError');

const getBaseUrl = (req) => {
  const forwardedProto = req.get('x-forwarded-proto');
  const forwardedHost = req.get('x-forwarded-host');
  const protocol = forwardedProto ? forwardedProto.split(',')[0] : req.protocol;
  const host = forwardedHost || req.get('host');
  return `${protocol}://${host}`;
};

const getTourImageUrl = (baseUrl, imageCover) => {
  if (!imageCover) return null;
  if (imageCover.startsWith('http')) return imageCover;
  return `${baseUrl}/img/tours/${imageCover}`;
};

const getTourImageAttachment = (imageCover) => {
  if (!imageCover || imageCover.startsWith('http')) return null;
  const imagePath = path.join(__dirname, '../public/img/tours', imageCover);
  if (!fs.existsSync(imagePath)) return null;

  return {
    filename: imageCover,
    path: imagePath,
    cid: 'natours-tour-image',
  };
};

const getBookingDate = (tour) =>
  tour.startDates?.[0]
    ? new Date(tour.startDates[0]).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'To be announced';

const sendBookingConfirmationEmail = async ({ user, tour, baseUrl, price }) => {
  const bookingData = {
    tourName: tour.name,
    tourSummary: tour.summary,
    tourDuration: tour.duration,
    tourDifficulty: tour.difficulty,
    tourPrice: price,
    bookingDate: getBookingDate(tour),
    tourStartLocation: tour.startLocation?.description || 'TBA',
    tourImage: getTourImageUrl(baseUrl, tour.imageCover),
    tourImageCid: null,
    inlineAttachments: [],
  };

  const tourImageAttachment = getTourImageAttachment(tour.imageCover);
  if (tourImageAttachment) {
    bookingData.tourImageCid = tourImageAttachment.cid;
    bookingData.inlineAttachments.push(tourImageAttachment);
  }

  await new Email(user, `${baseUrl}/my-tours`, bookingData).sendBookingConfirmation();
};

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1)Get the Currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  const baseUrl = getBaseUrl(req);
  //2)Create checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${baseUrl}/my-tours?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    success_url: `${baseUrl}/my-tours?session_id={CHECKOUT_SESSION_ID}&alert=booking`,
    cancel_url: `${baseUrl}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`${baseUrl}/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });
  //3)Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   //This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
//   const { tour, user, price } = req.query;

//   if (!tour || !user || !price) return next();

//   if (req.user && req.user.id !== user) {
//     return next(new AppError('Invalid booking confirmation user.', 400));
//   }

//   const existingBooking = await Booking.findOne({ tour, user });
//   if (!existingBooking) {
//     await Booking.create({ tour, user, price });
//   }

//   // Fetch user manually since req.user is not available on this route
//   const currentUser = await User.findById(user);
//   const bookedTour = await Tour.findById(tour);
//   const baseUrl = getBaseUrl(req);

//   if (currentUser && bookedTour) {
//     const url = `${baseUrl}/my-tours`;
//     const bookingDate = bookedTour.startDates?.[0]
//       ? new Date(bookedTour.startDates[0]).toLocaleDateString('en-US', {
//           day: 'numeric',
//           month: 'long',
//           year: 'numeric',
//         })
//       : 'To be announced';

//     const bookingData = {
//       tourName: bookedTour.name,
//       tourSummary: bookedTour.summary,
//       tourDuration: bookedTour.duration,
//       tourDifficulty: bookedTour.difficulty,
//       tourPrice: bookedTour.price,
//       bookingDate,
//       tourStartLocation: bookedTour.startLocation?.description || 'TBA',
//       tourImage: getTourImageUrl(baseUrl, bookedTour.imageCover),
//     };

//     await new Email(currentUser, url, bookingData).sendBookingConfirmation();
//   }

//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async (session) => {
  const tourId = session.client_reference_id;
  const foundUser = await User.findOne({ email: session.customer_email });
  if (!foundUser || !tourId) return null;
  const foundTour = await Tour.findById(tourId);
  if (!foundTour) return null;

  const user = foundUser.id;
  const price = session.amount_total / 100;
  const existingBooking = await Booking.findOne({ tour: tourId, user });
  if (existingBooking) {
    return {
      booking: existingBooking,
      user: foundUser,
      tour: foundTour,
      price,
      created: false,
    };
  }

  const booking = await Booking.create({ tour: tourId, user, price });
  return { booking, user: foundUser, tour: foundTour, price, created: true };
};

exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingResult = await createBookingCheckout(session);
    if (bookingResult?.created) {
      const baseUrl = getBaseUrl(req);
      try {
        await sendBookingConfirmationEmail({
          user: bookingResult.user,
          tour: bookingResult.tour,
          baseUrl,
          price: bookingResult.price,
        });
      } catch (emailErr) {
        console.error('Booking confirmation email failed:', emailErr.message);
      }
    }
  }

  res.status(200).json({ received: true });
});

exports.createBookingCheckoutFromSuccess = catchAsync(async (req, res, next) => {
  const { session_id: sessionId, alert } = req.query;
  if (!sessionId) return next();

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (
    session.payment_status !== 'paid' ||
    session.mode !== 'payment' ||
    session.customer_email !== req.user.email
  ) {
    return next();
  }

  const bookingResult = await createBookingCheckout(session);
  if (bookingResult?.created) {
    const baseUrl = getBaseUrl(req);
    try {
      await sendBookingConfirmationEmail({
        user: bookingResult.user,
        tour: bookingResult.tour,
        baseUrl,
        price: bookingResult.price,
      });
    } catch (emailErr) {
      console.error('Booking confirmation email failed:', emailErr.message);
    }
  }
  const alertQuery = alert === 'booking' ? '?alert=booking' : '';
  return res.redirect(`/my-tours${alertQuery}`);
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  console.log('--- GET MY BOOKINGS ROUTE HIT ---');
  console.log('User ID:', req.user.id);
  // 1) Find all bookings for logged-in user
  const bookings = await Booking.find({ user: req.user.id });
  console.log('Bookings query success. Count:', bookings.length);

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  console.log('Tour IDs mapping:', tourIDs);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  console.log('Tours query success. Count:', tours.length);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

//Factory functions for CRUD operations on Booking model
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
