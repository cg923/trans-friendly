const express 			= require('express');
const router 			= express.Router();
const bodyParser 		= require('body-parser');
const methodOverride 	= require('method-override');
const passport			= require('passport');
const usersController	= require('../controllers/users');
const placesController	= require('../controllers/places');
const staticsController	= require('../controllers/statics');

// ------------------------------------ //
// ---------- AUTHENTICATION ---------- //
// ------------------------------------ //

/* All controllers which require a user to be logged in should
   be routed through this function. */
function authenticatedUser(req, res, next) {
	if(req.isAuthenticated()) return next();

	res.redirect('/');
}

// ------------------------------------ //
// -------------- Statics ------------- //
// ------------------------------------ //

router.route('/')
	.get(staticsController.home);

// ------------------------------------ //
// -------------- Users --------------- //
// ------------------------------------ //

router.route('/user')
	.get(usersController.getUser);
	
router.route('/signup')
	// GET signup directs to sign up page
	.get(usersController.getSignup)
	// while POST sends sign up info to backend.
	.post(usersController.postSignup);

router.route('/login')
	.get(usersController.getLogin)
	.post(usersController.postLogin);

router.route('/logout')
	.get(usersController.getLogout);

// ------------------------------------ //
// ----------- GOOGLE APIS ------------ //
// ------------------------------------ //

/* In these two routes no data is saved to our DB.
   We are making API calls from the back end
   and then sending info back to the front end
   in order to hide our API keys */
   
router.route('/api/google')
	// This is POST because we need to pass data.
	.post(placesController.getPlaceFromGoogle);

router.route('/api/google/location')
	.get(placesController.getLocationByAddressFromGoogle);

// ------------------------------------ //
// -------------- PLACES -------------- //
// ------------------------------------ //

// INDEX
router.route('/api/places/')
	.get(placesController.getAllPlacesFromDb);

// CREATE
router.route('/api/places/')
	.post(placesController.createOrGetPlaceFromDb);

// SEARCH
router.route('/api/places/search')
	.get(placesController.searchForPlaceInDb);

/*  custom SEARCH (because Google Places data
	can have names with URI invalid characters) */
router.route('/api/places/customsearch')
	.post(placesController.customSearchForPlaceInDb);

// SHOW
router.route('/api/places/:id')
	.get(placesController.getPlaceFromDb);

// DELETE
router.route('/api/places/:id')
	.delete(authenticatedUser, placesController.removePlaceFromDb);

// UPDATE
router.route('/api/places/:id')
	.put(authenticatedUser, placesController.addReview);

// ------------------------------------ //
// ------------- REVIEWS -------------- //
// ------------------------------------ //

// SHOW
router.route('/api/places/:place_id/reviews/:review_id')
	.get(placesController.getReview);

// UPDATE
router.route('/api/places/:place_id/reviews/:review_id')
	.put(authenticatedUser, placesController.updateReview);

// DELETE
router.route('/api/places/:place_id/reviews/:review_id')
	.delete(authenticatedUser, placesController.removeReview);

module.exports = router;