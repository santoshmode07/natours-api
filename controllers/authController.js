const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const catchAsync = require('../Utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../Utils/appError');
const Email = require('../Utils/email');
const Verify = require('../models/verifyModel');

const sanitizeReturnTo = (value) => {
  if (typeof value !== 'string') return '/';
  if (!value.startsWith('/')) return '/';
  if (value.startsWith('//')) return '/';
  if (value.startsWith('/api')) return '/';
  return value;
};

const isSecureRequest = (req) => {
  const host = req.get('host') || '';
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return false;
  }
  return (
    req.secure ||
    req.protocol === 'https' ||
    req.get('x-forwarded-proto') === 'https'
  );
};

const getCookieOptions = (req, expires) => {
  const secure = isSecureRequest(req);
  return {
    ...(expires ? { expires } : {}),
    httpOnly: true,
    secure: secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
  };
};

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res, redirectTo = '/') => {
  const token = signToken(user._id);
  res.cookie(
    'jwt',
    token,
    getCookieOptions(
      req,
      new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
      ),
    ),
  );

  //Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    redirectTo,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  if (req.body.role) {
    return next(new AppError('Cannot assign role during signup', 400));
  }
  if (await User.findOne({ email: req.body.email })) {
    return next(new AppError('Email already exists. Please login.', 400));
  }
  const redirectTo = sanitizeReturnTo(req.body.returnTo || req.query.returnTo);
  if (req.verify) {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      photo: req.body.photo,
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    // console.log(url);

    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, req, res, redirectTo);
  } else {
    return next(
      new AppError('Email verification failed. Please try again.', 400),
    );
  }
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return next(new AppError('Please provide email and OTP!', 400));
  }
  if (await User.findOne({ email: email })) {
    return next(new AppError('Email already exists. Please login.', 400));
  }
  const verifyRecord = await Verify.findOne({ email: email });

  // if (!verifyRecord) {
  //   return next(new AppError('Please Click the Send OTP.', 404));
  // }

  if (verifyRecord.otp !== otp) {
    return next(new AppError('Invalid OTP. Please try again.', 400));
  }

  req.verify = true;
  await Verify.deleteOne({ email: email });
  next();
});

exports.sendOTP = catchAsync(async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return next(new AppError('Please provide email and name!', 400));
    }
    if (await User.findOne({ email: email })) {
      return next(new AppError('Email already exists. Please login.', 400));
    }
    // console.log(email);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔑 DEVELOPMENT OTP for ${email}: ${otp}`);
    await Verify.deleteOne({ email: email });
    await Verify.create({ email: email, otp: otp });
    const url = `${req.protocol}://${req.get('host')}/api/v1/users/verifyEmail`;
    let emailSent = true;
    try {
      await new Email({ email, otp, name }, url).sendOTP();
    } catch (mailErr) {
      emailSent = false;
      console.warn('⚠️ OTP email delivery failed, but continuing for development:', mailErr.message);
    }
    
    const responseData = {
      status: 'success',
      message: emailSent ? 'OTP sent successfully' : 'OTP sent (using local dev backup)',
    };

    if (!emailSent) {
      responseData.devOtp = otp;
    }

    res.status(200).json(responseData);
  } catch (err) {
    console.error('ERROR SENDING OTP 💥:', err);
    return next(
      new AppError(
        'There was an error sending the OTP. Please try again later.',
        500,
      ),
    );
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const redirectTo = sanitizeReturnTo(req.body.returnTo || req.query.returnTo);

  //1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  //2) Check if user exists && password is correct
  const user = await User.findOne({ email: email }).select('+password');
  if (!user) {
    return next(new AppError('User not Found, Please Create the Account', 401));
  }
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3) If everything ok, send token to client
  createSendToken(user, 200, req, res, redirectTo);
});

exports.logout = (req, res) => {
  const expiredDate = new Date(0);
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.clearCookie('jwt', getCookieOptions(req));
  res.cookie('jwt', 'loggedout', getCookieOptions(req, expiredDate));
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  const handleUnauthenticated = (message) => {
    if (!req.originalUrl.startsWith('/api')) {
      const returnTo = encodeURIComponent(req.originalUrl);
      return res.redirect(`/login?returnTo=${returnTo}`);
    }
    return next(new AppError(message, 401));
  };

  //1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token || token === 'loggedout') {
    return handleUnauthenticated(
      'You are not logged in! Please log in to get access.',
    );
  }
  let decoded;
  try {
    //2)Verfication token
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    return handleUnauthenticated(
      'You are not logged in! Please log in to get access.',
    );
  }

  const freshUser = await User.findById(decoded.id);

  //3)Check if user still exists
  if (!freshUser) {
    return handleUnauthenticated(
      'The user belonging to this token does no longer exist.',
    );
  }
  //4)Check if user changed password after the JWT was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return handleUnauthenticated(
      'User recently changed password! Please log in again.',
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

//Only for rendered pages, no errors;
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1)Verfication token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      const freshUser = await User.findById(decoded.id);

      //2)Check if user still exists
      if (!freshUser) {
        return next();
      }
      //3)Check if user changed password after the JWT was issued
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

//Wrappeing function to have access to roles array and then middleware
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  //2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) Send it to user's email

  try {
    const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent. Please check your inbox.',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3) Update changedPasswordAt property for the user

  //4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2) Check if POSTed current password is correct
  const correct = await user.correctPassword(
    req.body.passwordCurrent,
    user.password,
  );
  if (!correct) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  //3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //User.findByIdAndUpdate will NOT work as intended!
  //4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});
