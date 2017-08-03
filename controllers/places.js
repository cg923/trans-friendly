const request 		= require('request');
const bodyParser 	= require('body-parser');
const env 			= require('../env.js');

// POST /api/google
function newPlace(req, res, next) {
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

module.exports = {
	newPlace: newPlace
};