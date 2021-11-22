const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");

//middleware
exports.cheapTour = (req, res, next) => {
  // ?limit=5&sort=-ratingsAverage,price&fields=name,price
  req.query.limit = "5";
  req.query.sort = "price,-ratingsAverage";
  req.query.fields = "name,price";

  next();
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save();

    const newTour = await Tour.create(req.body);

    res.status(201).send({
      status: "success",
      body: {
        newTour,
      },
    });
  } catch (err) {
    res.status(400).send({
      status: "failed",
      message: err.message,
    });
  }
};

exports.getAllTour = async (req, res) => {
  try {
    // Way-1
    // const tours = await Tour.find({});
    // const tours = await Tour.find({difficulty: 'easy'});
    // const tours = await Tour.find(req.query) // pass hole query object

    // Way-2
    /*const tours = await Tour.find()
                            .where('difficulty')
                            .equals('easy')
                            .where('duration')
                            .gte(5);
     */

    // MAKE BETTER
    /*
      if we pass req.query for filtering and also for pagination values.
      then we should not use query-object directly.
     */

    console.log(req.query);
    //BUILD QUERY
    // 1A) Filtering
    const queryObj = { ...req.query };
    const excludeField = ["sort", "fields", "page", "limit"];
    excludeField.map((el) => delete queryObj[el]);

    // 1B) Advance Filtering // ?difficulty=easy&duration[gte]=5
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lt|lte|gt|gte)\b/g, (match) => `$${match}`);

    // { difficulty: 'easy', duration: { gte: '5' } }
    // to
    // { difficulty: 'easy', duration: { $gte: '5' } }

    let query = Tour.find(JSON.parse(queryStr)); // return query instance //that we can chain more method.

    // 2) SORTING // ?sort=-price
    if (req.query.sort) {
      // query.sort(req.query.sort); //sort('price') //sort('-price') -for descending

      //sort by multiple field //sort('price ratingAverage')
      // { sort: 'price,ratingAverage' }
      // to
      // { sort: 'price ratingAverage' }

      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // 3) Fields Filtering // ?fields=name,price
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v"); //__v creat by mongo we can exclude by default.
    }

    // 4) Pagination // ?page=2&limit20
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit; // previous-page * limit

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numOfDoc = await Tour.countDocuments();
      if (skip >= numOfDoc) throw new Error("This page dose not exits");
    }

    //EXECUTE QUERY
    const tours = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      result: tours.length,
      body: {
        data: tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  res.status(200).json({
    status: "success",
    body: {
      data: tour,
    },
  });
});

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    /*
    new:true // return updated document rather than old doc.
    runValidators: true // re run validator for updating time
    */

    res.status(200).json({
      status: "success",
      body: {
        data: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteTour = catchAsync(async (req, res, next) => {
  
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      body: {
        data: null,
      },
    });
});
