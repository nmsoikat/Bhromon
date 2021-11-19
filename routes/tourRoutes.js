const express = require("express");
const {
  cheapTour,
  createTour,
  getAllTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStar,
  getMonthlyPlan
} = require("../controller/tourController.js");

const router = express.Router();

// router.param('id', (req, res, next, val) => {
//   console.log(val);
// })

router.route("/monthly-plan/:year").get(getMonthlyPlan);
router.route("/tour-star").get(getTourStar);
router.route("/top-5-cheap").get(cheapTour, getAllTour);
router.route("/").get(getAllTour).post(createTour);

router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
