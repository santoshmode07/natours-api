const Tour = require('../models/tourModel');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const User = require('../models/userModel');
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

  //2)Buid template

  //3)Render template using the data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Login into your Account',
  });
});

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'create your account!',
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
