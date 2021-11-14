
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes')

const app = express();

if (process.env.NODE_ENV = 'development') {
  app.use(morgan('dev'))
}

app.use(express.json())
app.use(express.static(`${__dirname}/public`))



// app.get('/api/v1/tours', getTour)

// app.post('/api/v1/tours', setTour);


app.use('/api/v1/tours', tourRouter)

module.exports = app;