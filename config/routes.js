const express 			= require('express');
const router 			= express.Router();
const bodyParser 		= require('body-parser');
const methodOverride 	= require('method-override');
const passport			= require('passport');
const usersController	= require('../controllers/users');
const placesController	= require('../controllers/places');
const staticsController	= require('../controllers/statics');

function authenticatedUser(req, res, next) {
	if(req.isAuthenticated()) return next;

	res.redirect('/');
}

router.route('/')
	.get(staticsController.home);

router.route('/signup')
	.get(usersController.getSignup)
	.post(usersController.postSignup);

router.route('/login')
	.get(usersController.getLogin)
	.post(usersController.postLogin);

router.route('/logout')
	.get(usersController.getLogout);

router.route('/addreview')
	.get(authenticatedUser, usersController.addReview);

module.exports = router;