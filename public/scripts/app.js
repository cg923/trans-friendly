var map;
var openInfoWindows = [];
var markers = [];

$(document).ready(function() {
	$('#search-form').submit(function(event) {
		event.preventDefault();
		populateMap($('#search-box').val(), map.getCenter());
	});
});

function createInfoWindow(place, callback) {
	var reviews = [];
	var friendliness;
	var friendImgSrc = '';
	var genNeutBath = '/img/check_false.png';
	var lgbtOwned = '/img/check_false.png';
	var advertises = '/img/check_false.png';

	// Check our database to see if we have info about this place.
	$.ajax({
		url: '/api/places/search',
		method: "POST",
		data: {
			'search': place.name,
			'location': {
				'lat': place.geometry.location.lat,
				'lng': place.geometry.location.lng
			}
		},
		success: function(result) {
			if (result.genderNeutralBathrooms) { genNeutBath = 'img/check_true.png'; }
			if (result.lgbtOwned) { lgbtOwned = '/img/check_false.png'; }
			if (result.advertises) { advertises = '/img/check_false.png'; }

			// Set rating image according to friendliness
			switch (Math.floor(result.friendliness)) {
				case 0:
          			friendImgSrc = "No ratings";
          			break;
		        case 1:
			          friendImgSrc = "<img src='img/1star.png'>";
			          break;
		        case 2:
			          friendImgSrc = "<img src='img/2star.png'>";
			          break;
		        case 3:
			          friendImgSrc = "<img src='img/3star.png'>";
			          break;
		        case 4:
			          friendImgSrc = "<img src='img/4star.png'>";
			          break;
		        case 5:
			          friendImgSrc = "<img src='img/5star.png'>";
			          break;
		        default:
			          throw console.log('invalid friendliness rating!');
      		}

      		var infoWindow = new google.maps.InfoWindow({
				content: "<b>" + place.name + "</b><br>" + 
	                place.vicinity + "<br><br>" + 
	                friendImgSrc + "<br><br>" + 
	                "<table>" +
	                "<tr><td width=200>Gender Neutral Bathrooms:</td><td><img src='" + genNeutBath + "'></td></tr>" +
	                "<tr><td width=200>LGBT Owned:</td><td><img src='" + lgbtOwned + "'></td></tr>" +
	                "<tr><td width=200>Advertises as LGBT Friendly:</td><td><img src='" + advertises + "'></td></tr></table>" +
	                "<a href='/api/places/review/" + result._id + "'>Write a review</a>"
			});

			openInfoWindows.push(infoWindow);
			callback(infoWindow, result);
		}
	});
}

function closeOpenInfoWindows() {
	// Hide reviews
	//$('#reviews').addClass('hidden');

	// Close info windows.
	if (openInfoWindows.length === 0) return;

	openInfoWindows.forEach(function(element) {
		element.close();
	});
}

function calculateSearchRadius() {
	// Calculate an appropriate search radius.
  	// TO DO - This should be an equation.
	switch (map.getZoom()) {
	    case 20:
		    return 50;
	    case 19:
		    return 75;
	    case 18:
		    return 100;
	    case 17:
		    return 250;
	    case 16:
		    return 500;
	    case 15:
		    return 750;
	    case 14:
		    return 3250;
	    case 13:
		    return 5500;
	    case 12:
		    return 7750;
	    default:
		    return 10000;
	}
}

function populateMap(searchTerm, location) {
  
    var radius = calculateSearchRadius();

    $.ajax({
	    url: '/api/google',
	    method: "POST",
	    data: { 
	        search: searchTerm, 
	        location: {
	        	lat: location.lat(),
	        	lng: location.lng()
	        },
	      	radius: radius
    	},
	    success: function(results) {
	      
	        // Remove active markers from the map.
	        markers.forEach(function(element) {
	        	element.setMap(null);
	        });
	        markers = [];

	        // Create markers for new results.
	        results.forEach(function(element) {
	        	// Create corresponding infoWindows (Google's little popup bubbles)
	        	createInfoWindow(element, function(infoWindow, results) {
		            var marker = new google.maps.Marker({
			            position: {lat: element.geometry.location.lat, lng: element.geometry.location.lng},
			            map: map,
			            title: element.name
			        });
		            markers.push(marker);

		            // When user clicks on a marker, display the corresponding infoWindow.
		            marker.addListener('click', function() {
		            	closeOpenInfoWindows();
		            	//populateReviewList(results);
		            	infoWindow.open(map, marker);
		            });
	        	});
	    	});
    	}
  	});
}

// Sets up map on the screen.
function initMap() {
	// FIX ME - can't select map with jQuery because...?
	map = new google.maps.Map(document.getElementById('map'), {
	    zoom: 15,
	    // Denver is the default location :)
	    center: {lat: 39.7392358, lng: -104.990251}
	});

	// Try to get user's location.
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			map.setCenter(pos);
		});
	}
}