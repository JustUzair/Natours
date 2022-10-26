const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appErrors');

exports.setTourUserIds = (req, res, next) => {
	//nested routes
	if (!req.body.tour) req.body.tour = req.params.tourId;
	if (!req.body.user) req.body.user = req.user.id;
	next();
};

exports.checkBooking = catchAsync(async (req, res, next) => {
	const bookings = await Booking.find({
		user: req.user.id,
		tour: req.body.tour
	});
	if (bookings.length === 0)
		return next(
			new AppError('You can only review the tours booked by you!', 401)
		);
	next();
});
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
