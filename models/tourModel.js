const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			unique: true,
			trim: true,
			maxlength: [40, 'A tour name must not exceed 40 characters!'],
			minlength: [
				10,
				'A tour name should at least be 10 characters long!'
			]
		},
		slug: String,
		duration: {
			type: Number,
			required: [true, 'A tour must have a duration']
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour must have a group size']
		},
		difficulty: {
			type: String,
			required: [true, 'A tour must have a difficulty'],
			enum: {
				values: ['easy', 'medium', 'difficult'], //custom validation values
				message:
					'Difficulty should either be easy, medium and difficult '
			}
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, 'Ratings should be either 1 or greater than 1.'],
			max: [5, 'Ratings should be either 5 or less than 5'],
			set: (val) => Math.round(val * 10) / 10 // ex: 4.6666667*10 = 46.66667 => Rounded Value => 47.66667/10 = 4.7
		},
		ratingsQuantity: {
			type: Number,
			default: 0
		},
		price: {
			type: Number,
			required: [true, 'Price is required']
		},
		priceDiscount: {
			type: Number,
			validate: {
				validator: function (val) {
					return val < this.price; // 'this' keyword points to current doc on NEW document creations only
				},
				message:
					'Discount is lesser than actual price of service/product'
			}
		},
		summary: {
			type: String,
			trim: true,
			required: [true, 'A tour must have a description']
		},
		description: {
			type: String,
			trim: true
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have a cover images']
		},
		images: {
			type: [String]
		},
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false
		},
		startDates: {
			type: [Date]
		},
		secretTour: {
			type: Boolean,
			default: false
		},
		startLocation: {
			//GeoJSON
			type: {
				type: String,
				default: 'Point',
				enum: ['Point']
			},
			coordinates: [Number],
			address: String,
			description: String
		},
		locations: [
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point']
				},
				coordinates: [Number],
				address: String,
				description: String,
				day: Number
			}
		],
		guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);
tourSchema.index({
	price: 1, // 1, stands for ascending order
	ratingsAverage: -1 // -1, stands for descending order
});
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.virtual('durationWeeks').get(function () {
	return this.duration / 7; // virtual attribute - meaning that this attribute isn't stored in database but calculated based on some other attribute in the database
});

//VIRTUAL POPULATE
tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour', // reference to tour field in Review model
	localField: '_id' // reference to _id field in current model
});
/* 
Types of Middleware in Mongoose
1. Document - Process currently executing document
2. Query
3. Aggregate
4. Model
*/
//DOCUMENT MIDDLEWARE:  will run before .save() and .create() events
tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

tourSchema.pre(/^find/, function (next) {
	this.find({ secretTour: { $ne: true } });
	this.start = Date.now();
	next();
});
tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'guides', // fill the referenced data at time of querying the DB
		select: '-__v -passwordChangedAt'
	});
	next();
});

const Tour = mongoose.model('Tour', tourSchema); // create a model from tour schema created above
module.exports = Tour;
