const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');


const signToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });  
}

exports.signupUser = catchAsync(async (req, res, next) => {

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
  })

  // after create an new account auto login
  const token = signToken(newUser._id)


  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  })
  
})

exports.loginUser = catchAsync(async(req, res, next) => {
  const {email, password} = req.body;

  // 1) check email and password
  if(!email || !password){
    return next(new AppError("Please provide email and password", 400))
  }

  // 2) match email and password with db
  const user = await User.findOne({email}).select('+password') // + for we deselect manually on model
  
  // console.log(user);

  if(!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const token = signToken(user._id);

  // 3) everything is ok. send response to client.
  res.status(200).json({
    status: 'success',
    token
  })

})