const express = require('express');
const fs = require('fs');
const router = express.Router();
const tourController = require('../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');
// router.param('id', tourController.checkID) ----> use param to check for parameters and pass appropriate middleware function
router
	.route('/tours-within/:distance/center/:latlng/unit/:unit')
	.get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
	.route('/top-5-cheap')
	.get(tourController.aliasTopTour, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router
	.route('/monthly-plan/:year')
	.get(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide', 'guide'),
		tourController.getMonthlyPlan
	);

router
	.route('/')
	.get(tourController.getAllTours)
	.post(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.createTour
	);
router
	.route('/:id')
	.get(tourController.getTour)
	.patch(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.uploadTourImages,
		tourController.resizeTourImages,
		tourController.updateTour
	)
	.delete(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.deleteTour
	);

router.use('/:tourId/reviews', reviewRouter); // divert to the review router
module.exports = router;
