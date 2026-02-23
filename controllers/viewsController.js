const Tour = require('../models/tourModel');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert =
      "Your Booking was Sucessfull! Please check your email for a  confirmation. If Your booking doesn't show up here immediately,please come back later ";
  }
  next();
};

const getSafeReturnTo = (value) => {
  if (typeof value !== 'string') return '/';
  if (!value.startsWith('/')) return '/';
  if (value.startsWith('//')) return '/';
  if (value.startsWith('/api')) return '/';
  return value;
};

exports.getOverview = catchAsync(async (req, res) => {
  //1)Get Tour data from collection
  const tours = await Tour.find();
  //2)Build Template

  //3)Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1)Get the data,for the requested tour(including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // Check if user is logged in and has booked this tour
  let hasBooked = false;
  if (res.locals.user) {
    const booking = await Booking.findOne({
      user: res.locals.user.id,
      tour: tour.id,
    });
    if (booking) hasBooked = true;
  }

  //2)Buid template

  //3)Render template using the data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    hasBooked,
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  const returnTo = getSafeReturnTo(req.query.returnTo);

  res.status(200).render('login', {
    title: 'Login into your Account',
    returnTo,
  });
});

exports.getSignupForm = (req, res) => {
  const returnTo = getSafeReturnTo(req.query.returnTo);
  res.status(200).render('signup', {
    title: 'create your account!',
    returnTo,
  });
};

exports.getForgotPasswordForm = (req, res) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot your password',
  });
};

exports.getResetPasswordForm = (req, res) => {
  res.status(200).render('resetPassword', {
    title: 'Reset your password',
    token: req.params.token,
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'your account!',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('myBookings', {
    title: 'My Bookings',
    tours,
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  // 1) Find all reviews by the current user
  const reviews = await Review.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name slug imageCover',
  });

  res.status(200).render('myReviews', {
    title: 'My Reviews',
    reviews,
  });
});

exports.getReviewForm = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  res.status(200).render('reviewForm', {
    title: `Review ${tour.name}`,
    tour,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).render('account', {
    title: 'your account!',
    user: updatedUser,
  });
});
