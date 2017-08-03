const request 		= require('request');
const bodyParser 	= require('body-parser');
const env 			= require('../env.js');
const db 			= require('../models');

// POST /api/google
function getPlaceFromGoogle(req, res, next) {
	// construct URL based on user input.
	var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' + 
				'&keyword=' + req.body.search + 
				'&location=' + req.body.location.lat + ',' + req.body.location.lng + 
				'&radius=' + req.body.radius + 
				'&key=' + env.key;

	console.log(url);

	// Call Google Places API
	request(url, function(error, response, body) {
		if (error) throw error;
		if (typeof(body) === 'string') { body = JSON.parse(body); }

		// Send results!
		res.json(body.results);
	});
}

// POST /api/places
function getPlaceFromDb(req, res, next) {
	if (typeof(req.body) === 'string') req.body = JSON.parse(req.body);
	db.Place.findOne({ 'name': req.body.search, 'location.lat': req.body.location.lat, 'location.lng': req.body.location.lng })
	.exec(function(err, place) {
		if (err) throw err;

		// No place was found so we should create an entry
		if (!place) {
			var newPlace = new db.Place({
				name: 					req.body.search,
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

module.exports = {
	getPlaceFromGoogle: getPlaceFromGoogle,
	getPlaceFromDb: getPlaceFromDb
};