const mongoose = require('mongoose');
const bcrypt 	= require('bcrypt-nodejs');

var User = mongoose.Schema({
	local: {
		email: String,
		password: String
	},
	// TO DO - This currently does nothing.  In the future
	// it would be good to have User keep track of their reviews.
	reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}]

});

User.methods.hash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

User.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', User);