// any middleware call next() with an any values then error middleware get call automatically
//// when next() with value it is assume it is an error value.

const AppError = require("../utils/appError");


const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400)
}

const handleDuplicateFieldDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate Field Value: ${value}. Please use another value`;

  return new AppError(message, 400);
}

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid Input Data${errors.join(". ")}`
  return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).send({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  })

}


const sendErrorProd = (err, res) => {
  //operational, trusted error: send message to client
  if(err.isOperational) {
    res.status(err.statusCode).send({
      status: err.status,
      message: err.message
    })

  // Programming or other unknown error: don't leak error detail
  } else {
    // 1) log error
    console.error(`Error: ${err}`);

    //2) send generic message
    res.status(500).json({
      status: 'error',
      message: "Something went very wrong!"
    })
  }

}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500,
  err.status = err.status || 'error'

  if(process.env.NODE_ENV === 'development-'){
    console.log(err);
    sendErrorDev(err, res);

  } else if(process.env.NODE_ENV === 'development') {

    let error = {...err};


    if(error.name === "CastError") 
      error =  handleCastErrorDB(error);
    // console.log('cast error');
    
    if(error.code === 11000)
      error = handleDuplicateFieldDB(error);

    if(err.name === "ValidationError")
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
}


