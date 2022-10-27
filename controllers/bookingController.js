const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
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
			}/my-bookings?alert=booking`,
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
						`${req.protocol}://${
							process.env.NODE_ENV === 'production'
								? req.get('host')
								: '127.0.0.1:3000'
						}/img/tours/${tour.imageCover}`
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

const createBookingCheckout = async (session) => {
	const tour = session.client_reference_id;
	const user = (await User.findOne({ email: session.customer_email }))._id;
	const price = session.amount_total / 100;
	let currencyConverter = new CC({
		from: 'INR',
		to: 'USD',
		amount: tour.price
		// isDecimalComma: true
	});

	let payableINRToUSD = await currencyConverter.convert();
	await Booking.create({ tour, user, payableINRToUSD });
};

exports.webhookCheckout = (req, res, next) => {
	const signature = req.headers['stripe-signature'];

	let event;
	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET
		);
	} catch (err) {
		return res.status(400).send(`Webhook error: ${err.message}`);
	}

	if (event.type === 'checkout.session.completed')
		createBookingCheckout(event.data.object);

	res.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
