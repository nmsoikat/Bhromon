const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync')

exports.getAllUser = catchAsync(async(req, res, next) => {

  const users = await User.find({});

  res.status(200).json({  
    status: 'success',
    result: users.length,
    body: {
      data: users
    }
  })
})


exports.updateMe = catchAsync(async(req, res, next) => {

  //1) Create error if user POSTs password data.
  if(req.body.password || req.body.confirmPassword){
    return next(new AppError('This route is not for password update. Please use /updatePassword.'))
  }

  //2) Update user document
})