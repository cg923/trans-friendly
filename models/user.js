const mongoose = require('mongoose');
const bcrypt 	= require('bcrypt-nodejs');

var User = mongoose.Schema({
	local: {
		email: String,
		passowrd: String
	}
});

User.methods.hash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

module.exports = mongoose.model('User', User);