const express 			= require('express');
const router 			= express.Router();
const bodyParser 		= require('body-parser');
const methodOverride 	= require('method-override');
const passport			= require('passport');
const usersController	= require('../controllers/users');
const placesController	= require('../controllers/places');
const staticsController	= require('../controllers/statics');

function authenticatedUser(req, res, next) {
	if(req.isAuthenticated()) return next();

	res.redirect('/');
}

// STATICS
router.route('/')
	.get(staticsController.home);

// USERS
router.route('/user')
	.get(usersController.getUser);
	
router.route('/signup')
	.get(usersController.getSignup)
	.post(usersController.postSignup);

router.route('/login')
	.get(usersController.getLogin)
	.post(usersController.postLogin);

router.route('/logout')
	.get(usersController.getLogout);

// GOOGLE APIS
// get/create
router.route('/api/google')
	// This is POST because we need to pass data.
	.post(placesController.getPlaceFromGoogle);

// get/create by location
router.route('/api/google/location')
	.get(placesController.getLocationByAddressFromGoogle);

// PLACES
// index
router.route('/api/places/')
	.get(placesController.getAllPlacesFromDb);

// create
router.route('/api/places/')
	.post(placesController.createOrGetPlaceFromDb);

// search
router.route('/api/places/search')
	.get(placesController.searchForPlaceInDb);

// custom search (because places often have names with URI invalid characters)
router.route('/api/places/customsearch')
	.post(placesController.customSearchForPlaceInDb);

// show
router.route('/api/places/:id')
	.get(placesController.getPlaceFromDb);

// delete
router.route('/api/places/:id')
	.delete(authenticatedUser, placesController.removePlaceFromDb);

// update
router.route('/api/places/:id')
	.put(authenticatedUser, placesController.addReview);

// REVIEWS
// show
router.route('/api/places/:place_id/reviews/:review_id')
	.get(placesController.getReview);

// update
router.route('/api/places/:place_id/reviews/:review_id')
	.put(authenticatedUser, placesController.updateReview);

// delete
router.route('/api/places/:place_id/reviews/:review_id')
	.delete(authenticatedUser, placesController.removeReview);

module.exports = router;