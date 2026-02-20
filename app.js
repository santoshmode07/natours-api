const path = require('path');
const express = require('express');
//HTTP request logger middleware for node.js
const morgan = require('morgan');
//rate limiting middleware is used to limit repeated requests to public APIs and/or endpoints such as password reset
const rateLimit = require('express-rate-limit');
//Helemt helps you secure your Express apps by setting various HTTP headers
const helmet = require('helmet');
//Data sanitization against NoSQL query injection
const mongosanitize = require('express-mongo-sanitize');
//Data Sanitization against XSS
const xss = require('xss-clean');
//Prevent parameter pollution
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const mongoose = require('mongoose');

const AppError = require('./Utils/appError');
const connectDB = require('./Utils/db');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

if (process.env.NODE_ENV === 'production') app.enable('trust proxy');
mongoose.set('bufferCommands', false);

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const bookingRouter = require('./routes/bookingRouter');
const viewRouter = require('./routes/viewRouter');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
const allowedOrigins = [
  'https://natours-api-iota.vercel.app',
  'https://natours-api-eight.vercel.app',
  'https://natours-api-iwxd.onrender.com',
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin);

      if (isAllowed) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

app.options('*', cors());

// Ignore Chrome DevTools noise
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(404).end();
});

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      scriptSrc: [
        "'self'",
        'https://unpkg.com',
        'https://cdn.jsdelivr.net',
        'https://js.stripe.com',
      ],
      styleSrc: ["'self'", 'https://unpkg.com', 'https://fonts.googleapis.com'],
      imgSrc: [
        "'self'",
        'data:',
        'https://*.tile.openstreetmap.org',
        'https://unpkg.com',
      ],
      connectSrc: [
        "'self'",
        'https://*.tile.openstreetmap.org',
        'https://unpkg.com',
        'https://cdn.jsdelivr.net',
        'https://*.vercel.app',
        'https://natours-api-iota.vercel.app',
        'https://natours-api-eight.vercel.app',
        'https://*.stripe.com',
        'ws://127.0.0.1:*',
      ],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      workerSrc: ["'self'", 'blob:'],
    },
  }),
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
  validate: { trustProxy: false },
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data sanitization against NoSQL query injection

app.use(mongosanitize());

//Data Sanitization against XSS

app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use(compression());

// Ensure DB connection exists for serverless environments (e.g. Vercel).
app.use(async (req, res, next) => {
  try {
    await connectDB();
    return next();
  } catch (err) {
    return next(new AppError(`Database connection failed: ${err.message}`, 500));
  }
});

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2)ROUTE HANDLERS

//// Handling GET request ////

// app.get('/api/v1/tours', getAllTours);

// Handling GET request with route parameters by using req.params
// :y? makes y optional
// :id is a route parameter
//find method returns the first element that satisfies the condition
//
// app.get('/api/v1/tours/:id/', getTour);

//// Handling POST request with adding middle ware to parse JSON data with express.json() by accessing req.body////

// app.post('/api/v1/tours', createTour);

// app.patch('/api/v1/tours/:id', updateTour);

// app.delete('/api/v1/tours/:id', deleteTour);

// 3)ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// 4)START SERVER

module.exports = app;
