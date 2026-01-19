const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');

const app = express();

// 1)MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  app.use(express.json());
}
app.use(morgan('dev'));
app.use(express.json());

app.use(express.static(`${__dirname}/public`));

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

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// 4)START SERVER

module.exports = app;
