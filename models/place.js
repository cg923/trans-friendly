const mongoose = require('mongoose');

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
	advertises: Boolean,
	reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}]
});

module.exports = mongoose.model('Place', Place);