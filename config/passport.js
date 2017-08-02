var LocalStrategy	= require('passport-local').Strategy;
var User			= require('../models/user');

module.exports = function(passport) {
	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, function(req, email, password, callback) {
		// Find a user with this email
		User.findOne({ 'local.email' : email }, function(err, user) {
			if(err) return callback(err);

			// User found
			if (user) {
				return callback(null, false, req.flash('signupMessage', "This e-mail is already in use."));
			} else {
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