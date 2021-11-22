// any middleware call next() with an any values then error middleware get call automatically
//// when next() with value it is assume it is an error value.
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500,
  err.status = err.status || 'error'

  res.status(err.statusCode).send({
    status: err.status,
    message: err.message
  })
}