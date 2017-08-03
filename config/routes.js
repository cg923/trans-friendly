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

// STATICS
router.route('/')
	.get(staticsController.home);

// USERS
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

// PLACES
router.route('/api/google')
	// This is POST because we need to pass data.
	.post(placesController.getPlaceFromGoogle);

router.route('/api/places/search')
	.post(placesController.getPlaceFromDb);

module.exports = router;