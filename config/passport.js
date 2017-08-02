var LocalStrategy	= require('passport-local').Strategy;
var User			= require('../models/user.js');

module.exports = function(passport) {

	passport.serializeUser(function(user, callback) {
		callback(null, user.id);
	});

	passport.deserializeUser(function(id, callback) {
		User.findById(id, function(err, user) {
			callback(err, user);
		});
	});

	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, function(req, email, password, callback) {
		// Find a user with this email
		User.findOne({ 'local.email' : email }, function(err, user) {
			console.log('hi');
			if(err) return callback(err);

			// User found
			if (user) {
				console.log('user found');
				return callback(null, false, req.flash('signupMessage', "This e-mail is already in use."));
			} else {
				console.log('user didnt exist');
				// No user yet registered with this e-mail
				var newUser = new User();
				newUser.local.email = email;
				newUser.local.password = newUser.hash(password);

				newUser.save(function(err) {
					if(err) throw err;
					return callback(null, newUser);
				});
			}
		});
	}));
};