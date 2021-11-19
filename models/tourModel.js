const mongoose = require('mongoose');
const slugify = require('slugify')

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true
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
    required: [true, 'A tour must have a diagram']
  },
  ratingsAverage: {
    type: Number,
    default: 4.5
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: Number,
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

// DOCUMENT MIDDLEWARE: runs before only the .save() and .create()
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