
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes')

const AppError = require('./utils/appError');
const AppErrorHandler = require('./controller/appErrorController');

const app = express();

if (process.env.NODE_ENV = 'development') {
  app.use(morgan('dev'))
}

app.use(express.json())
app.use(express.static(`${__dirname}/public`))



// app.get('/api/v1/tours', getTour)

// app.post('/api/v1/tours', setTour);


app.use('/api/v1/tours', tourRouter)


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