const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appErrors');
const factory = require('./handlerFactory');
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

//Image uploads for tours
const multerStorage = multer.memoryStorage();

//only allow images to be uploaded
const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) cb(null, true);
	else cb(new AppError('Not an image!, Please upload images only!'), false);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourImages = upload.fields([
	{
		name: 'imageCover',
		maxCount: 1
	},
	{
		name: 'images',
		maxCount: 3
	}
]);
//--------------------------------
exports.resizeTourImages = catchAsync(async (req, res, next) => {
	console.log(req.files);
	if (!req.files.imageCover || !req.files.images) return next();

	req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
	await sharp(req.files.imageCover[0].buffer)
		.resize(2000, 1333)
		.toFormat('jpeg')
		.jpeg({
			quality: 90 // percent
		})
		.toFile(`public/img/tours/${req.body.imageCover}`);

	//process tour images
	req.body.images = [];
	const processedImageArrayPromise = req.files.images.map(
		async (image, index) => {
			const filename = `tour-${req.params.id}-${Date.now()}-${
				index + 1
			}.jpeg`;
			await sharp(req.files.images[index].buffer)
				.resize(2000, 1333)
				.toFormat('jpeg')
				.jpeg({
					quality: 90 // percent
				})
				.toFile(`public/img/tours/${filename}`);
			req.body.images.push(filename);
		}
	);
	await Promise.all(processedImageArrayPromise);
	console.log(req.body.images);
	next();
});

exports.aliasTopTour = (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
};

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getAllTours = factory.getAll(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
	const stats = await Tour.aggregate([
		{
			$match: { ratingsAverage: { $gte: 4.5 } }
		},
		{
			$group: {
				_id: { $toUpper: '$difficulty' }, // group results based on difficulty
				numTours: { $sum: 1 }, //for each tour add 1 to numTours variable i.e count total tours
				numRatings: { $sum: '$ratingsQuantity' }, // total ratings
				avgRating: { $avg: '$ratingsAverage' },
				avgPrice: { $avg: '$price' },
				minPrice: { $min: '$price' },
				maxPrice: { $max: '$price' }
			}
		},
		{
			$sort: { avgPrice: 1 } //1 indicates ascending order sort, and avgPrice is the field we defined above to sort the data, -1 indicates descending order
		}
	]);
	res.status(200).json({
		status: 'success',
		data: {
			stats
		}
	});
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
	const year = +req.params.year;
	const plan = await Tour.aggregate([
		{
			$match: {
				startDates: {
					$gte: new Date(`${year}-01-01`),
					$lte: new Date(`${year}-12-31`)
				}
			}
		},

		{
			$unwind: '$startDates' //Deconstructs an array field from the input documents to output a document for each element
		},
		{
			$group: {
				_id: { $month: '$startDates' },
				numToursStarts: { $sum: 1 },
				tours: { $push: '$name' } // push creates the array, example: multiple tours are present in same month in our case
			}
		},
		{
			$addFields: {
				month: '$_id'
			}
		},
		{
			$project: {
				_id: 0
			}
		},
		{
			$sort: { numToursStarts: -1 }
		},
		{
			$limit: 12
		}
	]);
	res.status(200).json({
		status: 'success',
		data: {
			plan
		}
	});
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
	// route example : /tours-within/233/center/-131654,44651/unit/mi
	const { distance, unit, latlng } = req.params;
	const [lat, lng] = latlng.split(',');
	const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // The floating point numbers represent radius of earth in miles and kilometers respectively.
	if (!lat || !lng)
		return next(
			new AppError(
				'Please provide latitude and longitude in the format lat,lng',
				404
			)
		);
	// console.log(`Distance  ${distance}, Lat  ${lat}, Lng ${lng}, Unit ${unit}`);
	const tours = await Tour.find({
		startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
	});
	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			data: tours
		}
	});
});

exports.getDistances = catchAsync(async (req, res, next) => {
	const { unit, latlng } = req.params;
	const [lat, lng] = latlng.split(',');

	const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

	if (!lat || !lng)
		return next(
			new AppError(
				'Please provide latitude and longitude in the format lat,lng',
				404
			)
		);
	const distances = await Tour.aggregate([
		{
			$geoNear: {
				near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
				distanceField: 'distance',
				distanceMultiplier: multiplier // distance is in metres by default
			}
		},
		{
			$project: { distance: 1, name: 1 }
		}
	]);
	res.status(200).json({
		status: 'success',
		data: {
			data: distances
		}
	});
});
