const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get(
  '/',
  authController.isLoggedIn,
  bookingController.createBookingCheckout,
  viewsController.getOverview,
);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
// /login
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get(
  '/forgotPassword',
  authController.isLoggedIn,
  viewsController.getForgotPasswordForm,
);
router.get(
  '/resetPassword/:token',
  authController.isLoggedIn,
  viewsController.getResetPasswordForm,
);
router.get('/me', authController.protect, viewsController.getAccount);
router.get(
  '/my-tours',
  authController.protect,
  bookingController.createBookingCheckout,
  viewsController.getMyTours,
);
router.get('/my-reviews', authController.protect, viewsController.getMyReviews);
router.get(
  '/tour/:slug/review',
  authController.protect,
  viewsController.getReviewForm,
);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);
module.exports = router;
