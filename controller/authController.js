const crypto = require('crypto')
const { promisify } = require('util')
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)

    // set HTTP Only Cookie
    const cookieOptions = {
      expire: new Date( Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true
    }
    if(process.env.NODE_ENV === 'production'){
      cookieOptions.secure = true // it is work only for https;
    }
    res.cookie('jwt', token, cookieOptions);


    // Remove the password from the output
    user.password = undefined;

    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    })
}

exports.signupUser = catchAsync(async (req, res, next) => {

  const newUser = await User.create(req.body)

  // after create an new account auto login
  createSendToken(newUser, 201, res)

})

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check email and password
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400))
  }

  // 2) match email and password with db
  const user = await User.findOne({ email }).select('+password') // + for we deselect manually on model

  // console.log(user);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  
  // 3) everything is ok. send response to client.
  createSendToken(user, 200, res)
})

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Your are not logged in!. Please login to get access.'));
  }


  // 2) Verification Token // if some one manipulate the token
  // callback function call after complete the verification.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //  console.log(decoded);


  // 3) Check if user still exist // user deleted after login
  const freshUser = await User.findById({ _id: decoded.id });
  if (!freshUser) {
    return next(new AppError("The user belonging to this token dose no longer exist."))
  }


  // 4) Check if user change password after the token  was issued.
  // error password change after login.
  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError("User recently changed password! Please login again.", 401));
  }

  //GRANT ACCESS TO PROTECTED ROUTE.
  req.user = freshUser;
  next();
})

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles an array. ['admin', 'lead-guide']

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform action', 403))
    }

    next();
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTs email.
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no email with email address.', 404));
  }

  // 2) Generate the random reset token.
  const resetToken = user.createPasswordResetToken();
  // we need to off the validate for all field. we save only password token related fields.
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email.
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new-password and passwordConfirm to: ${resetURL} \n 
  If you did not forget your password please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    })

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    })

  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }

})

exports.resetPassword = catchAsync(async(req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
  const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpire: {$gt: Date.now()}});

  // 2) If token has not expired, and there is user, set the new password.
  if(!user){
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password
  user.confirmPassword = req.body.confirmPassword
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  // 3) Update changePasswordAt property for the user.
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async(req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, Update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res)
})