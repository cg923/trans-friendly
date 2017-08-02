const passport = require('passport');

// GET /signup
function getSignup(request, response) {
	response.render('signup.ejs', { message: request.flash('signupMessage') });
}

// POST /signup
function postSignup(request, response, next) {
	var signupStrategy = passport.authenticate('local-signup', {
		successRedirect: '/',
		failureRedirect: '/signup',
		failureFlash: true
	});

	return signupStrategy(request, response, next);
}

// GET /login
function getLogin(request, response) {
	response.render('login.ejs', { message: request.flash('loginMessage') });
}

// POIST /login
function postLogin(request, response, next) {
	var loginProperty = passport.authenticate('local-login', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	});

	return loginProperty(request, response, next);
}

// GET /logout
function getLogout(request, response) {
	request.logout();
	response.redirect('/');
}

// GET /addreview
function addReview(request, response) {
	// TO DO
}

module.exports = {
	getLogin: 	getLogin,
	postLogin: 	postLogin,
	getSignup: 	getSignup,
	postSignup: postSignup,
	getLogout: 	getLogout
};