const {promisify} = require('util')
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
    confirmPassword: req.body.confirmPassword,
    changePasswordAt: req.body.changePasswordAt,
    role: req.body.role,
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

exports.protect = catchAsync(async (req, res, next)=> {
  // 1) Getting token and check of it's there
  let token;
  if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
    token = req.headers.authorization.split(' ')[1];
  }

  if(!token){
    return next(new AppError('Your are not logged in!. Please login to get access.'));
  }

  
  // 2) Verification Token // if some one manipulate the token
  // callback function call after complete the verification.
   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //  console.log(decoded);
  

  // 3) Check if user still exist // user deleted after login
  const freshUser = await User.findById({_id: decoded.id});
  if(!freshUser){
    return next(new AppError("The user belonging to this token dose no longer exist."))
  }

  
  // 4) Check if user change password after the token  was issued.
  // error password change after login.
  if(freshUser.changePasswordAfter(decoded.iat)){
    return next(new AppError("User recently changed password! Please login again.", 401));
  }

  //GRANT ACCESS TO PROTECTED ROUTE.
  req.user = freshUser;
  next();
}) 

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles an array. ['admin', 'lead-guide']

    if(!roles.includes(req.user.role)){
      return next(new AppError('You do not have permission to perform action', 403))
    }

    next();
  }
}