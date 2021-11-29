const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs');

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
    validate: [validator.isEmail, "Please provide a valid email"],
    lowercase: true
  },

  photo: {
    type: String,
    default: '/public/img/default-profile.jpg'
  },

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },

  password: {
    type: String,
    required: [true, "Please provide your password"],
    minlength: [8, "A user password musth have more or equal than 8 character"],
    select: false
  },
  
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      // so when we update password then we should also call save
      validator: function(el) {
        return el === this.password;
      },
      message: "Password are not same!"
    }
  },

  changePasswordAt: Date,
})


userSchema.pre('save', async function(next) {
  // only run this function if password was actually modified
  if(!this.isModified('password')){
    return next();
  }

  // hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete the password confirm field
  this.confirmPassword = undefined;

  next();
})


// instance method:  all document available from current collection
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {

  // this.password can not access because of password-field{select: false} in here

  return await bcrypt.compare(candidatePassword, userPassword)
}

// 
userSchema.methods.changePasswordAfter = function(JWTTimeStamp){

  if(this.changePasswordAt){
    //timeStamp.getTime() // return milliseconds
    const changedTimeStamp = this.changePasswordAt.getTime() / 1000;

    return JWTTimeStamp < changedTimeStamp;
  }

  // FALSE means NOT changed.
  return false;
}

const User = mongoose.model('User', userSchema)

module.exports = User;