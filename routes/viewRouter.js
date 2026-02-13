const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview);

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

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);
module.exports = router;
