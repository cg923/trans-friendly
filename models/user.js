const mongoose = require('mongoose');
const bcrypt 	= require('bcrypt-nodejs');

var User = mongoose.Schema({
	local: {
		email: String,
		passowrd: String
	}
});

module.exports = mongoose.model('User', User);