const path = require('path');
const express = require('express');
const morgan = require('morgan');
const dotenv = require("dotenv");
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoute.js');
const userRouter = require('./routes/userRoute.js');
const viewRouter = require('./routes/viewRoute.js');
const cookieParser = require('cookie-parser');
const reviewRouter = require('./routes/reviewRoute.js');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();


//app.use(morgan('dev'));

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));

app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());
// 1) MIDDLEWARES
  // Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);


// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());


// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);


// Reading Data from body to req.body - Body parser

app.use(express.json({limit: '10kb'})); //  think of post request
app.use(cookieParser());

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
// app.all('*',(req, res, next) => {
//   // res.status(404).json({
//   //        status:'fail',
//   //        message : `Can't find ${req.originalUrl} on this server!`
//   // });
//   const err = new Error( `Can't find ${req.originalUrl} on this server!`);
//   err.status = 'fail';
//   error.statusCode = 404;
//   next(err);// This will skip now all middleware and jump immediately to the middleware with err argument for error handling.
// });

// 3) ROUTES + Mounting on the other ROUTES Eg 120.0.0.1:3000/api/v1/tours/getAllTours


app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/users', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);


module.exports = app;

