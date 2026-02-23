# Natours Application (Full Project Guide)

## 1. Project Overview

Natours is a full-stack tour booking application built with Node.js, Express, MongoDB, and Pug.

It includes:

- REST API for tours, users, reviews, and bookings
- Server-rendered pages with Pug templates
- JWT authentication using HTTP-only cookies
- OTP-based email verification during signup
- Stripe checkout session creation for bookings
- Image upload + processing with Multer and Sharp
- Email workflows for welcome, OTP, password reset, and booking confirmation

## 2. Tech Stack

- Backend: Node.js, Express
- Database: MongoDB + Mongoose
- Auth: JWT + cookies
- Emails: Nodemailer + Pug email templates
- Payments: Stripe Checkout
- Views: Pug
- Security middleware: Helmet, rate limiting, mongo-sanitize, xss-clean, hpp
- Frontend build: Parcel (bundles `public/js/index.js`)

## 3. Project Structure

```text
starter/
  app.js                     # Express app config + middleware + route mounting
  server.js                  # Env loading, DB connection, server startup/shutdown
  config.env                 # Environment variables (local development)
  package.json               # Scripts + dependencies

  controllers/               # Request handlers
    authController.js
    bookingController.js
    errorController.js
    handlerFactory.js
    reviewController.js
    tourController.js
    userController.js
    viewsController.js

  models/                    # Mongoose schemas
    bookingModel.js
    reviewModel.js
    tourModel.js
    userModel.js
    verifyModel.js

  routes/                    # Express routers
    bookingRouter.js
    reviewRouter.js
    tourRouter.js
    userRouter.js
    viewRouter.js

  Utils/                     # Shared utilities
    apiFeatures.js
    appError.js
    catchAsync.js
    email.js

  views/                     # Pug templates for pages + emails
  public/                    # Static assets (css/js/images)
  dev-data/                  # Seed data + import script
```

## 4. Runtime Flow

- `server.js` loads environment from `config.env`.
- MongoDB connection string uses `DATABASE` + `DATABASE_PASSWORD`.
- Express app from `app.js` is started on `PORT` (default 3000).
- Global error handling is done in `controllers/errorController.js`.
- Graceful shutdown handlers exist for:
  - `uncaughtException`
  - `unhandledRejection`
  - `SIGTERM`

## 5. Security Middleware in `app.js`

Applied globally:

- `helmet` with custom CSP for Stripe, OSM tiles, JS/CDN assets
- `express-rate-limit` on `/api` (100 requests/hour/IP)
- `express.json` and `express.urlencoded` body parsing
- `cookie-parser`
- `express-mongo-sanitize`
- `xss-clean`
- `hpp` with whitelist fields for filter/sort use cases

## 6. Environment Variables

These keys are used by the project:

```env
NODE_ENV=
PORT=
DATABASE=
DATABASE_LOCAL=
DATABASE_PASSWORD=
USERNAME=
JWT_SECRET=
JWT_EXPIRES_IN=
JWT_COOKIE_EXPIRES_IN=
EMAIL_USERNAME=
EMAIL_PASSWORD=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_FROM=
PUBLIC_BASE_URL=
EMAIL_LOGO_URL=
BREVO_USERNAME=
BREVO_PASSWORD=
STRIPE_SECRET_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Notes:

- In production mode, email transport uses Brevo (`SendinBlue` service).
- In development mode, email transport uses SMTP host/port/user/pass.
- `PUBLIC_BASE_URL` should be a public URL (for email asset links).
- `EMAIL_LOGO_URL` is optional and can override the logo image URL in emails.
- JWT cookie is `secure` in production.

## 7. Installation and Run

1. Install dependencies:

```bash
npm install
```

2. Configure `config.env`.
3. Start app in development mode:

```bash
npm run start
```

4. Optional production-mode start (still via nodemon):

```bash
npm run start:prod
```

5. Frontend bundle watch:

```bash
npm run watch:js
```

## 8. API Features (Query Options)

For list endpoints using `APIFeatures` (`handlerFactory.getAll`):

- Filtering (including advanced operators `gte`, `gt`, `lte`, `lt`)
- Sorting: `?sort=price,-ratingsAverage`
- Field limiting: `?fields=name,price`
- Pagination: `?page=2&limit=10`

## 9. Authentication and Authorization

### Auth Flow

- Signup requires OTP verification:
  - `POST /api/v1/users/send-otp`
  - `POST /api/v1/users/signup` (with OTP)
- Login:
  - `POST /api/v1/users/login`
- Logout:
  - `GET /api/v1/users/logout`
- Forgot/reset password:
  - `POST /api/v1/users/forgotPassword`
  - `PATCH /api/v1/users/resetPassword/:token`

### Middleware Roles

- `protect`: requires valid JWT (header or cookie)
- `restrictTo(...roles)`: role-based permission check
- Roles in schema: `user`, `guide`, `lead-guide`, `admin`

## 10. Route Map

### View Routes (`/`)

- `GET /` overview page
- `GET /tour/:slug` single tour page
- `GET /login`, `GET /signup`
- `GET /forgotPassword`, `GET /resetPassword/:token`
- `GET /me` account page (protected)
- `GET /my-tours` (protected)
- `GET /my-reviews` (protected)
- `GET /tour/:slug/review` (protected)
- `POST /submit-user-data` (protected)

### Tours API (`/api/v1/tours`)

- `GET /top-5-cheap`
- `GET /tour-stats`
- `GET /monthly-plan/:year` (protected: admin/lead-guide/guide)
- `GET /tours-within/:distance/center/:latlng/unit/:unit`
- `GET /distances/:latlng/unit/:unit`
- `GET /`
- `POST /` (protected: admin/lead-guide)
- `GET /:id`
- `PATCH /:id` (protected: admin/lead-guide, supports image upload)
- `DELETE /:id` (protected: admin/lead-guide)

Nested reviews:

- `GET /api/v1/tours/:tourId/reviews`
- `POST /api/v1/tours/:tourId/reviews`

### Users API (`/api/v1/users`)

Public:

- `POST /send-otp`
- `POST /signup`
- `POST /login`
- `GET /logout`
- `POST /forgotPassword`
- `PATCH /resetPassword/:token`

Protected:

- `PATCH /updateMypassword`
- `GET /me`
- `PATCH /updateMe`
- `DELETE /deleteMe`

Admin-only:

- `GET /`
- `POST /`
- `GET /:id`
- `PATCH /:id`
- `DELETE /:id`

### Reviews API (`/api/v1/reviews`)

All routes are protected.

- `GET /`
- `POST /` (role: user)
- `GET /:id`
- `PATCH /:id` (role: user/admin)
- `DELETE /:id` (role: user/admin)

### Bookings API (`/api/v1/bookings`)

All routes are protected.

- `GET /checkout-session/:tourId`
- Admin/lead-guide only for CRUD:
  - `GET /`
  - `POST /`
  - `GET /:id`
  - `PATCH /:id`
  - `DELETE /:id`

## 11. Data Models

### User

- Fields: name, email, photo, role, password, passwordConfirm, passwordChangedAt, passwordResetToken, passwordResetExpires, active
- Password is hashed with bcrypt pre-save
- Inactive users filtered from queries via `pre(/^find/)`

### Verify (OTP)

- Fields: email, otp, createdAt
- TTL index expiry after 600 seconds (10 minutes)

### Tour

- Core details: name, duration, maxGroupSize, difficulty, price, summary, description
- Media: imageCover, images
- Ratings: ratingsAverage, ratingsQuantity
- Geospatial: startLocation + locations
- Guides reference `User`
- Virtual populate: `reviews`
- Indexes: `{price:1, ratingsAverage:-1}`, `{slug:1}`, `{startLocation:'2dsphere'}`

### Review

- Fields: review, rating, tour ref, user ref
- Unique index on `(tour, user)` to allow one review per user per tour
- Post-save/update hooks recompute `Tour` rating aggregates

### Booking

- Fields: tour ref, user ref, price, createdAt, paid
- Query middleware auto-populates `user` and `tour`

## 12. Image Upload and Processing

- Tour image updates:
  - `uploadTourImages` with `imageCover` (1) and `images` (max 3)
  - Sharp resizes to 2000x1333 and saves to `public/img/tours`
- User photo updates:
  - `uploadUserPhoto` (`photo` field)
  - Sharp resizes to 500x500 and saves to `public/img/users`

## 13. Email Templates and Notifications

Pug templates in `views/email/`:

- `welcome.pug`
- `otp.pug`
- `passwordReset.pug`
- `bookingConfirmation.pug`
- `baseEmail.pug` + `_style.pug`

Triggered by:

- Signup -> welcome email
- Send OTP -> OTP email
- Forgot password -> reset email
- Booking completion flow -> booking confirmation email

## 14. Payments (Stripe)

- Backend creates checkout session: `GET /api/v1/bookings/checkout-session/:tourId`
- Frontend uses Stripe `redirectToCheckout` in `public/js/stripe.js`
- Success URL includes query params used by `createBookingCheckout` middleware to create booking

## 15. Frontend JS Actions

Entry: `public/js/index.js`

- Login/logout
- Signup + OTP send
- Forgot/reset password
- Update profile data + photo
- Update password
- Book tour with Stripe
- Submit reviews
- Render tour map from embedded locations dataset

## 16. Seed Data Script

File: `dev-data/data/import-dev-data.js`

Import:

```bash
node dev-data/data/import-dev-data.js --import
```

Delete:

```bash
node dev-data/data/import-dev-data.js --delete
```

## 17. Known Inconsistencies to Be Aware Of

- User router path is `PATCH /updateMypassword` (lowercase `p` in `password`) while frontend code currently targets `api/v1/users/updateMyPassword` in `public/js/updateSettings.js`.
- `npm run build:js` currently runs `parcel watch` (same as watch script), not a one-time production build.
- `public/js/stripe.js` has a hardcoded publishable key.

## 18. Troubleshooting

### App starts but DB fails

- Verify `DATABASE` format and `DATABASE_PASSWORD` value in `config.env`.

### No emails are sent

- In development: check `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USERNAME`, `EMAIL_PASSWORD`.
- In production: check `BREVO_USERNAME`, `BREVO_PASSWORD`, `EMAIL_FROM`.

### Auth not working in browser

- Ensure cookies are enabled.
- In production behind proxy, `app.enable('trust proxy')` is enabled when `NODE_ENV=production`.

### Stripe checkout fails

- Verify `STRIPE_SECRET_KEY`.
- Ensure frontend Stripe key is valid for your Stripe account.

## 19. Useful Commands

```bash
npm run start
npm run debug
npm run watch:js
npm run build:js
```

## 20. Maintainer Notes

This guide reflects the current code in this repository and is intended as a complete onboarding reference for development, debugging, and extension of the Natours app.
