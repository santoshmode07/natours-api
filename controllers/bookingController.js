const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1)Get the Currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  const baseUrl = getBaseUrl(req);
  //2)Create checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${baseUrl}/my-tours?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
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
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
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

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();

  if (req.user && req.user.id !== user) {
    return next(new AppError('Invalid booking confirmation user.', 400));
  }

  const existingBooking = await Booking.findOne({ tour, user });
  if (!existingBooking) {
    await Booking.create({ tour, user, price });
  }

  // Fetch user manually since req.user is not available on this route
  const currentUser = await User.findById(user);

  if (currentUser) {
    const url = `${getBaseUrl(req)}/my-tours`;
    await new Email(currentUser, url).sendBookingConfirmation();
  }

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
