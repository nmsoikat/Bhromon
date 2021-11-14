const express = require('express');
const { createTour, getAllTour, getTour,updateTour, deleteTour } = require('../controller/tourController')

const router = express.Router();

// router.param('id', (req, res, next, val) => {
//   console.log(val);
// })


router
  .route('/')
  .get(getAllTour)
  .post(createTour)

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour)

module.exports = router;