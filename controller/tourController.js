const Tour = require("../models/tourModel");
const APIFeature = require("../utils/apiFeature");
const AppError = require("../utils/appError");
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
    const features = new APIFeature(Tour.find(), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();

    //EXECUTE QUERY
    const tours = await features.queryInstance;

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
    if(!tour){
      return next(new AppError("No tour found", 404))
    }
    res.status(200).json({
      status: "success",
      body: {
        data: tour,
      },
    });
});

exports.getTourStar = async (req, res) => {
  try {
    const tours = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          numOfTour: { $sum: 1 },
          totalRatings: { $sum: "$ratingsQuantity" },
          averageRating: { $avg: "$ratingsAverage" },
          averagePrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { averagePrice: -1 }
      },
      {
        $match: { _id: { $ne: "EASY" } }
      }
    ]);

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

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year  = req.params.year * 1; //2021
    const query = Tour.aggregate([
      {
        $unwind: "$startDates"
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {$month: "$startDates"},
          numOfTourStart: {$sum: 1},
          tour: {$push: "$name"}
        }
      },
      {
        $addFields: {month: "$_id"}
      },
      {
        $project: {_id: 0}
      },
      {
        $sort: {numOfTourStart: -1}
      },
      // {
      //   $limit: 3
      // }
    ])

    const tours = await query;

    res.status(200).send({
      status:"success",
      body:{
        data: tours
      }
    })

  } catch (err) {
    res.status(400).send({
      status: "fail",
      message: err.message
    })
  }
}

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
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

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      body: {
        data: null,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
