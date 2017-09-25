const passport = require('passport');

// GET /user
/* 	This function sends the logged in user's email address,
	indicating that a user is logged in, because that information
	is not easily accessible from the front end. */
function getUser(request, response) {
	if (request.user) { response.send(request.user.local.email); }
	else { response.send(""); }
}

// GET /signup
// Signup page
function getSignup(request, response) {
	response.render('signup.ejs', { message: request.flash('signupMessage') });
}

// POST /signup
// Signup function
function postSignup(request, response, next) {
	var signupStrategy = passport.authenticate('local-signup', {
		successRedirect: '/',
		failureRedirect: '/signup',
		failureFlash: true
	});

	return signupStrategy(request, response, next);
}

// GET /login
// Login page
function getLogin(request, response) {
	response.render('login.ejs', { message: request.flash('loginMessage') });
}

// POST /login
// Login function
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

module.exports = {
	getUser:    getUser,
	getLogin: 	getLogin,
	postLogin: 	postLogin,
	getSignup: 	getSignup,
	postSignup: postSignup,
	getLogout: 	getLogout
};