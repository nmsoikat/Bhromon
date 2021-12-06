const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/usersRoutes')

const AppError = require('./utils/appError');
const AppErrorHandler = require('./controller/appErrorController');


const app = express();

// 1) GLOBAL MIDDLEWARE
// Set Security HTTP headers
app.use(helmet())

// Development Logging
if (process.env.NODE_ENV = 'development') {
  app.use(morgan('dev'))
}

// Limit request from same API
const limiter = rateLimit({
  max: 100, 
  windowMs: 60 * 60 *1000,
  message: 'Too many request from this IP, please try again in an hour!'
});
app.use('/api', limiter);

/*
note: all route start with  /api
max: 100 request for this one IP // depend on project
windowMS: after 1hour reset the limit
*/

// Body parser, reading data from body into req.body
app.use(express.json({limit: '10kb'})) // maximum 10kb data accepted

// Input Data Sanitization against NoSQL Query Injection
app.use(mongoSanitize())

// Input Data Sanitization against XSS
app.use(xss())

// Protect against HTTP Parameter Pollution attacks
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}))

// Serving static files
app.use(express.static(`${__dirname}/public`))


// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
})


// app.get('/api/v1/tours', getTour)

// app.post('/api/v1/tours', setTour);


app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter);


// app.all('*', (req, res, next) => {
//   const err = new Error('Page not found on '+ req.originalUrl);
//   err.statusCode = 404;
//   err.status = "fail"

//   next(err);
// });


// app.use((err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message
//   })
// })


app.all('*', (req, res, next) => {
  next(new AppError(`Page not found on ${req.originalUrl}`, 404));
});

app.use(AppErrorHandler);

module.exports = app;