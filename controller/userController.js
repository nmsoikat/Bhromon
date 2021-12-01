const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync')

const filterObj = (obj, ...allowedFields) => {
  let newObj = {}
  Object.keys(obj).forEach(key => {
    if(allowedFields.includes(key)){
      newObj[key] = obj[key]
    }
  })

  return newObj;
}

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
    return next(new AppError('This route is not for password update. Please use /update-my-password', 400))
  }

  //2) Update user document

  // filter unwanted fields name that are not allowed to update
  const filteredReqBody = filterObj(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredReqBody, {new: true, runValidators:true})

  // new:true // after update return updated data
  // runValidators: true // validate again

  res.status(200).json({
    status: 'Success',
    data: {
      user: updatedUser
    }
  })
})