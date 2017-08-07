const request = require('request');
const expect = require('chai').expect;

describe('Testing Trans-Friendly', function() {
	it('should return 200 from /api/places/', function() {
		request('http://localhost:3000/api/places/', function(error, response, body) {
			expect(response.statusCode).to.equal(200);
		});
	});
	it('should use Google API to convert an address to lat&lng', function() {
		let url = 'http://localhost:3000/api/google/location?address=Denver';
		request(url, function(error, response, body) {
			if(typeof(body) === 'string') { body = JSON.parse(body); }
			expect(body.results[0].geometry.location).to.have.property('lat');
		});
	});
});