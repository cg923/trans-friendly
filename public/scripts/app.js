var map;
var openInfoWindows = [];
var markers = [];

$(document).ready(function() {
	$('#search-form').submit(function(event) {
		event.preventDefault();
		populateMap($('#search-box').val(), map.getCenter());
	});

	$('#add-review-form').submit(function(event) {
		event.preventDefault();

		let reviewText = $('#review-text').val();

		let genderNeutralBathrooms;
		if ($('input[name=gendNeutBath]:checked', '#add-review-form').val() === 'yes') {
			genderNeutralBathrooms = true;
		} else { 
			genderNeutralBathrooms = false; 
		}

		let lgbtOwned;
		if ($('input[name=lgbtOwned]:checked', '#add-review-form').val() === 'yes') {
			lgbtOwned = true;
		} else { 
			lgbtOwned = false; 
		}

		let advertises;
		if ($('input[name=advertises]:checked', '#add-review-form').val() === 'yes') {
			advertises = true;
		} else { 
			advertises = false; 
		}

		let friendliness = parseInt($('#friendliness').val());
		let url = '/api/places/' + $('#review-modal').data('place-id');

		console.log($('#review-modal').data('place-id'));
		$.ajax({
			method: "PUT",
			url: url,
			data: {
				'friendliness': friendliness,
				'genderNeutralBathrooms': genderNeutralBathrooms,
				'lgbtOwned': lgbtOwned,
				'advertises': advertises,
				'text': reviewText
			},
			success: function(result) {
				$('#review-modal').modal('toggle');
			}
		});
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
			let friendliness;
			if (result.reviews.length === 0) { friendliness = 0; }
			else { friendliness = Math.floor(result.friendliness / result.reviews.length) };
			switch (friendliness) {
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
			          throw console.log('invalid friendliness rating: ' + result.friendliness);
      		}

      		var infoWindow = new google.maps.InfoWindow({
				content: "<b>" + place.name + "</b><br>" + 
	                place.vicinity + "<br><br>" + 
	                "<center>" + friendImgSrc + "</center><br>" +
	                "<center>" + result.reviews.length + " reviews</center><br>" +  
	                "<table>" +
	                "<tr><td width=200>Gender Neutral Bathrooms:</td><td><img src='" + genNeutBath + "'></td></tr>" +
	                "<tr><td width=200>LGBT Owned:</td><td><img src='" + lgbtOwned + "'></td></tr>" +
	                "<tr><td width=200>Advertises as LGBT Friendly:</td><td><img src='" + advertises + "'></td></tr></table><br>" +
	                "<center><button class='btn btn-default add-review'>Write a review</button></center>"
			});

      		google.maps.event.addListener(infoWindow, 'domready', function() {
      			$('.add-review').click(function() {
      				$('#review-modal').data('place-id', result._id);
      				$('#modal-form-title').html('What do you think of ' + place.name + '?');
      				$('#review-modal').modal();
      			});
      		});

			openInfoWindows.push(infoWindow);
			callback(infoWindow, result);
		}
	});
}

function closeOpenInfoWindows() {
	// Hide reviews
	$('#reviews').addClass('hidden');

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

function populateReviewList(place) {
	// Clear existing reviews.
	var reviewList = $('#review-list');
	reviewList.html('');

	// Make reviews visible
	$('#reviews').removeClass('hidden');

	// Create bootstrap panel to represent review
	place.reviews.forEach(function(element, index) {

	    var row = $('<div></div>');
	    row.addClass("row");

	    var outerDiv = $('<div></div>');
	    outerDiv.addClass("panel");
	    outerDiv.addClass("panel-default");
	    outerDiv.addClass("col-lg-10");
	    outerDiv.addClass("col-lg-offset-1")

	    var innerDiv = $('<div></div>');
	    innerDiv.addClass("panel-body");
	    innerDiv.html(place.reviews[index].text);

	    if(index % 2 === 0) { 
	      	innerDiv.addClass('pink'); 
	      	outerDiv.addClass('pink');
	    }
	    else { 
	      	innerDiv.addClass('blue');
	      	outerDiv.addClass('blue')
	    }

	    outerDiv.append(innerDiv);
	    row.append(outerDiv);
	    reviewList.append(row);
  	});
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
		            	populateReviewList(results);
		       			createInfoWindow(element);
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

	// Hide default business icons to prevent duplicates on map.
	var styles = {
        hide: [
          	{
            	featureType: 'poi',
            	stylers: [{visibility: 'off'}]
          	}
        ]
    };
	map.setOptions({styles: styles['hide']});

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