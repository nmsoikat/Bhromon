const Tour = require('../models/tourModel')

exports.createTour = async (req, res) => {
  try{
    // const newTour = new Tour({})
    // newTour.save();

    const newTour = await Tour.create(req.body);

    res.status(201).send({
      status: "success",
      body: {
        newTour
      }
    })

  }catch(err) {
    res.status(400).send({
      status: 'failed',
      message: err.message
    })
  }
}

exports.getAllTour = async (req, res) => {
  try{
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
    if we pass query for filtering and also for pagination.
    then we should not use query-object directly.
     */
    const tours = await Tour.find(req.query)

    res.status(200).json({
      status: "success",
      body: {
        data: tours
      }
    })
  } catch(err) {
    res.status(400).json({
      status: "fail",
      message: err.message
    })
  }
}

exports.getTour = async (req, res) => {
  try{
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: "success",
      body: {
        data: tour
      }
    })
  } catch(err) {
    res.status(400).json({
      status: "fail",
      message: err.message
    })
  }
}

exports.updateTour = async (req, res) => {
  try{
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    })

    /*
    new:true // return updated document rather than old doc.
    runValidators: true // re run validator for updating time
    */


    res.status(200).json({
      status: "success",
      body: {
        data: tour
      }
    })
  } catch(err) {
    res.status(400).json({
      status: "fail",
      message: err.message
    })
  }
}

exports.deleteTour = async (req, res) => {
  try{
    await Tour.findByIdAndDelete(req.params.id)

    res.status(204).json({
      status: "success",
      body: {
        data: null
      }
    })

  } catch(err){
    res.status(400).json({
      status: "fail",
      message: err.message
    })
  }
}