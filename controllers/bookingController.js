const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appErrors');
const factory = require('./handlerFactory');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const CC = require('currency-converter-lt');
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
	// 1. Get tour
	try {
		const tour = await Tour.findById(req.params.tourId);
		let currencyConverter = new CC({
			from: 'USD',
			to: 'INR',
			amount: tour.price
			// isDecimalComma: true
		});
		let payableAmount = await currencyConverter.convert();
		// console.log(`USD amount : ${tour.price} , INR amount: ${payableAmount}`);
		// 2. Create checkout session
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			success_url: `${req.protocol}://${
				process.env.NODE_ENV === 'production'
					? req.get('host')
					: '127.0.0.1:3000'
			}/?tour=${req.params.tourId}&user=${req.user.id}&price=${
				tour.price
			}`,
			cancel_url: `${req.protocol}://${
				process.env.NODE_ENV === 'production'
					? req.get('host')
					: '127.0.0.1:3000'
			}/tour/${tour.slug}`,
			customer_email: req.user.email,
			client_reference_id: req.params.tourId,
			line_items: [
				{
					name: `${tour.name} Tour`,
					description: tour.summary,
					images: [
						`https://www.natours.dev/img/tours/${tour.imageCover}`
					],
					amount: payableAmount * 100,
					currency: 'inr',
					quantity: 1
				}
			]
		});

		// console.log(session);
		//3. Create session as response
		res.status(200).json({
			status: 'success',
			session
		});
	} catch (err) {
		return next(new AppError(err.message, err.status));
	}
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
	// This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
	const { tour, user, price } = req.query;

	if (!(tour && user && price)) return next();
	await Booking.create({ tour, user, price });

	res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
