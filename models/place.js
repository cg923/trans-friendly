const mongoose = require('mongoose');

var Review = mongoose.Schema({
	author: String,
	friendliness: Number,
	genderNeutralBathrooms: Boolean,
	lgbtOwned: Boolean,
	advertises: Boolean,
	text: String
});

var Place = mongoose.Schema({
	name: String,
	location: {
		lat: Number,
		lng: Number
	},
	friendliness: Number,
	friendlinessTotal: Number,
	genderNeutralBathrooms: Boolean,
	lgbtOwned: Boolean,
	// Advertises as LGBT friendly.
	advertises: Boolean,
	reviews: [Review]
});

module.exports.Place = mongoose.model('Place', Place);
module.exports.Review = mongoose.model('Review', Review);