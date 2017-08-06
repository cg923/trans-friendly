const request 		= require('request');
const bodyParser 	= require('body-parser');
const env 			= require('../env.js');
const db 			= require('../models');
const passport		= require('passport');

// POST /api/google
function getPlaceFromGoogle(req, res, next) {
	// construct URL based on user input.
	var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' + 
				'&keyword=' + req.body.search + 
				'&location=' + req.body.location.lat + ',' + req.body.location.lng + 
				'&radius=' + req.body.radius + 
				'&key=' + env.key;

	// Call Google Places API
	request(url, function(error, response, body) {
		if (error) throw error;
		if (typeof(body) === 'string') { body = JSON.parse(body); }

		// Send results!
		res.json(body.results);
	});
}

// GET /api/places/
function getAllPlacesFromDb(req, res) {
	db.Place.Place.find({}, function(err, places) {
		if (err) throw err;
		res.json(places);
	});
}

// POST /api/places/
function createOrGetPlaceFromDb(req, res, next) {
	if (typeof(req.body) === 'string') req.body = JSON.parse(req.body);
	db.Place.Place.findOne({ 'name': req.body.search, 
							 'location.lat': req.body.location.lat, 
							 'location.lng': req.body.location.lng })
	.exec(function(err, place) {
		if (err) throw err;

		// No place was found so we should create an entry
		if (!place) {
			var newPlace = new db.Place.Place({
				name: 					req.body.search,
				address:  				req.body.address,
				friendliness: 			0,
				friendlinessTotal: 		0,
				genderNeutralBathrooms: false,
				lgbtOwned: 				false,
				advertises:  			false,
				reviews:  				[],
				location: {
					lat: req.body.location.lat,
					lng: req.body.location.lng
				}
			});

			newPlace.save(function(err, pl) {
				if (err) throw err;
				res.json(pl);
			});
		} else {
			// We found a matching place in our DB
			res.json(place);
		}
	});
}

// SEARCH /api/places/search
function searchForPlaceInDb(req, res) {
	db.Place.Place.findOne({name: req.query.name}, function(err, place) {
		if (err) throw err;
		res.json(place);
	});
}

// GET /api/places/:id
function getPlaceFromDb(req, res) {
	db.Place.Place.find({_id: req.params.id}, function(err, place) {
		if (err) throw err;
		res.json(place);
	});
}

// DELETE /api/places/:id
function removePlaceFromDb(req, res) {
	db.Place.Place.findOneAndRemove({_id: req.params.id}, function(err, place) {
		if (err) throw err;
		res.json(place);
	});
}

// PUT /api/places/:id
function addReview(req, res, next) {
	db.Place.Place.findOne({_id: req.params.id}, function(err, place) {
		if(typeof(req.body) === 'string') req.body = JSON.parse(req.body);

		place.reviews.push({
			placeId: req.body.placeId,
			author: req.user.local.email,
			friendliness: req.body.friendliness,
			genderNeutralBathrooms: req.body.genderNeutralBathrooms,
			lgbtOwned: req.body.lgbtOwned,
			advertises: req.body.advertises,
			text: req.body.text
		});

		if(req.body.genderNeutralBathrooms) {
			place.genderNeutralBathrooms = req.body.genderNeutralBathrooms;
		}
		if(req.body.lgbtOwned) { 
			place.lgbtOwned = req.body.lgbtOwned; 
		}
		if(req.body.advertises) { 
			place.advertises = req.body.advertises; 
		}

		// Calculate new friendliness score.
		place.friendliness = parseInt(place.friendliness) + parseInt(req.body.friendliness);

		place.save(function(err, place) {
			res.json(place);
		});
	});
}

// GET /api/places/:place_id/reviews/:review_id
function getReview(req, res) {
	db.Place.Place.findOne({_id: req.params.place_id}, function(err, place) {
		if (err) throw err;
		place.reviews.forEach(function(element) {
			if (element._id == req.params.review_id) {
				res.json(element);
			}
		});
	});
}

// PUT /api/places/:place_id/review/:review_id
function updateReview(req, res) {

	db.Place.Place.findOne({_id: req.params.place_id}, function(err, place) {
		if(typeof(req.body) === 'string') req.body = JSON.parse(req.body);

		// update review
		place.reviews.forEach(function(element) {
			if (element._id == req.params.review_id) {
				// subtract previous friendliness score
				place.friendliness -= parseInt(element.friendliness);

				// update
				element.friendliness = req.body.friendliness;
				element.genderNeutralBathrooms = req.body.genderNeutralBathrooms;
				element.lgbtOwned = req.body.lgbtOwned;
				element.advertises = req.body.advertises;
				element.text = req.body.text;
			}
		});

		if(req.body.genderNeutralBathrooms) {
			place.genderNeutralBathrooms = req.body.genderNeutralBathrooms;
		}
		if(req.body.lgbtOwned) { 
			place.lgbtOwned = req.body.lgbtOwned; 
		}
		if(req.body.advertisesLgbtFriendly) { 
			place.advertisesLgbtFriendly = req.body.advertisesLgbtFriendly; 
		}

		// Calculate new friendliness score.
		place.friendliness = parseInt(place.friendliness) + parseInt(req.body.friendliness);

		place.save(function(err, place) {
			res.json(place);
		});
	});
}

// DELETE /api/places/:place_id/reviews/:review_id
function removeReview(req, res) {
	db.Place.Place.findOne({_id: req.params.place_id}, function(err, place) {
		if (typeof(req.body) === 'string') req.body = JSON.parse(req.body);

		place.reviews.forEach(function(element, index) {
			if (element._id == req.params.review_id) {
				place.friendliness -= parseInt(element.friendliness);
				place.reviews.splice(index, 1);
			}
		});

		place.save(function(err, place) {
			res.json(place);
		});
	});
}

module.exports = {
	getPlaceFromGoogle 		: 	getPlaceFromGoogle,
	getAllPlacesFromDb 		: 	getAllPlacesFromDb,
	getPlaceFromDb 	   		: 	getPlaceFromDb,
	searchForPlaceInDb      :   searchForPlaceInDb,
	createOrGetPlaceFromDb 	: 	createOrGetPlaceFromDb,
	removePlaceFromDb		:   removePlaceFromDb,
	addReview				: 	addReview,
	getReview				:   getReview,
	updateReview			:   updateReview,
	removeReview			:   removeReview
};