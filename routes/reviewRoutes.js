const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const express = require('express');

const router = express.Router({ mergeParams: true });
router.use(authController.protect);
router
	.route('/')
	.get(reviewController.getAllReviews)
	.post(
		authController.restrictTo('user'),
		reviewController.setTourUserIds,
		reviewController.checkBooking,
		reviewController.createReview
	);
router
	.route('/:id')
	.get(reviewController.getReview)
	.patch(
		authController.restrictTo('admin', 'user'),
		reviewController.updateReview
	)
	.delete(
		authController.restrictTo('admin', 'user'),
		reviewController.deleteReview
	);
module.exports = router;
