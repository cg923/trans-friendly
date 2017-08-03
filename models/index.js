const mongoose = require('mongoose');
mongoose.connect( process.env.MONGODB_URI ||
				  process.env.MONGOLAB_URI ||
				  process.env.MONGOHQ_URL ||
				  "mongodb://localhost/transplaces");

module.exports.Review 	= require('./review');
module.exports.User		= require('./user');
module.exports.Place 	= require('./place');
