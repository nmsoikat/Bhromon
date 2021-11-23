const mongoose = require('mongoose');
const validator = require('validator')

// name, email, photo, password, confirmPassword
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Please tell you name!"],
    minlength: [3, "A user name must have more or equal than 3 character"],
    maxlength: [50, "A user name must have less or equal than 50 character"]
  },

  email: {
    type: String,
    trim: true,
    required: [true, "Please provide your email address"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email"]
  },

  photo: {
    type: String,
    default: '/public/img/default-profile.jpg'
  },

  password: {
    type: String,
    required: [true, "Please provide your password"],
    minlength: [8, "A user password musth have more or equal than 8 character"]
  },

  confirmPassword: {
    type: String,
    required: [true, 'Please confirm password']
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User;