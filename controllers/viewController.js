const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appErrors');
const User = require('./../models/userModel');
const crypto = require('crypto');

exports.getOverview = catchAsync(async (req, res, next) => {
	// 1. Get tour data from collection
	const tours = await Tour.find();
	// 2. Build template
	// 3. render template
	res.status(200).render('overview', {
		title: 'All Tours',
		tours
	});
});
exports.getTour = catchAsync(async (req, res, next) => {
	const { slug } = req.params;
	const tour = await Tour.findOne({ slug: req.params.slug }).populate({
		path: 'reviews',
		fields: 'review rating user'
	});
	if (!tour) {
		return next(new AppError('No tour with that name exists', 404));
	}
	const booking = await Booking.findOne({
		user: res.locals.user,
		tour: tour
	});
	let commentExist;
	if (res.locals.user) {
		commentExist = tour.reviews.some(
			(review) => review.user.id === res.locals.user.id
		);
	}
	let booked = false;
	if (booking) {
		booked = true;
	}
	res.status(200).render('tour', {
		title: `${tour.name} tour`,
		tour,
		booked,
		commentExist
	});
});

exports.getLoginForm = (req, res) => {
	res.status(200).render('login', {
		title: 'Login'
	});
};

exports.getSignUpForm = (req, res) => {
	res.status(201).render('signup', {
		title: 'Sign Up'
	});
};

exports.getAccount = (req, res) => {
	res.status(200).render('account', {
		title: `${req.user.name}`
	});
};

exports.updateUserData = async (req, res) => {
	// console.log(req.body);
	const updatedUser = await User.findByIdAndUpdate(
		req.user.id,
		{
			name: req.body.name,
			email: req.body.email
		},
		{
			new: true,
			runValidators: true
		}
	);
	res.status(200).render('account', {
		title: `${req.user.name}`,
		user: updatedUser
	});
};

exports.getResetPasswordForm = catchAsync(async (req, res, next) => {
	const hashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');
	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() }
	});

	if (!user)
		return next(new AppError('Token is invalid or has expired', 400));
	res.status(200).render('passwordResetForm', {
		title: 'Reset Password'
	});
});

exports.getForgotPasswordForm = catchAsync(async (req, res, next) => {
	res.status(200).render('passwordForgotForm', {
		title: 'Reset Password'
	});
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
	const bookings = await Booking.find({
		user: req.user.id
	});

	const tourIDs = bookings.map((el) => el.tour);
	const tours = await Tour.find({
		_id: { $in: tourIDs }
	});

	res.status(200).render('overview', {
		title: `My Bookings`,
		tours
	});
});
