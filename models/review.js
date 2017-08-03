const mongoose = require('mongoose');

var Review = mongoose.Schema({
	author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	friendliness: Number,
	genderNeutralBathrooms: Boolean,
	lgbtOwned: Boolean,
	advertises: Boolean,
	text: String
});

module.exports = mongoose.model('Review', Review);