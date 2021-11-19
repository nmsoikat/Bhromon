const mongoose = require('mongoose');
const slugify = require('slugify')
// const validator = require('validator');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    minlength: [10, 'A tour name must have more or equal than 10 characters'],
    maxlength: [40, 'A tour name must have less or equal than 40 characters'],
    //validate: [validator.isAlpha, "only a-z"] // external lib for validation
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a diagram'],
    // enum: ['easy', 'difficult', 'medium'],
    enum: {
      values: ['easy', 'difficult', 'medium'],
      message: 'Difficulty is either: easy, difficult, medium'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'A rating must be above 1.0'],
    max: [5, 'A rating must be below 5.0']
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  // priceDiscount: {
  //   type:Number,
  //   validate: function(val){
  //     return val < this.price
  //   }
  // },
  priceDiscount: {
    type:Number,
    validate: {
      validator: function(val){
        // this only point on current document on NEW document creation.
        return val < this.price
      },
      message: "Discount price ({VALUE}) should be below regular price"
    }
  },
  summary: {
    type: String,
    required: [true, 'A tour must have a description'],
    trim: true,
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },
  images:[String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: Boolean,
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
})

tourSchema.virtual('durationWeek').get(function() {
  return this.duration / 7;
})

// DOCUMENT MIDDLEWARE: runs before only the .save() and .create() // but not for update
// .this point to current document
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {lower: true});
  
  next();
})

// QUERY MIDDLEWARE: .this point to current query
tourSchema.pre(/^find/, function(next){ // if start with find (find, findOne, findOneAndUpdate.....)
// tourSchema.pre('find', function(next){
  this.find({secretTour: {$ne: true}})
  this.start = Date.now();

  next();
})

tourSchema.post(/^find/, function(docs, next) {
  console.log('find query takes:', Date.now() - this.start, "milliseconds");
  next();
})

//AGGREGATE MIDDLEWARE // .this point to aggregate
tourSchema.pre('aggregate', function(next){
  // console.log(this.pipeline()); //pipeline array

  // set another $match in pipeline.
  this.pipeline().unshift({$match: { secretTour: {$ne: true}}});

  next();
})


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;