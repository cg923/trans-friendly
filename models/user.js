const mongoose = require('mongoose');
const bcrypt 	= require('bcrypt-nodejs');

var User = mongoose.Schema({
	local: {
		email: String,
		password: String
	},
	reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}]

});

User.methods.hash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

User.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', User);