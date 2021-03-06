
// Global variables.
let map;
let openInfoWindows;
let markers = [];
let currentPlaceId = "";
let username;
let disallowedCharacters = [';', '/', '?', ':', '@', '&', '=', '+', '$', ',', '-'];

$(document).ready(function() {
	$.ajax({
		method: 'GET',
		url: '/user',
		success: function(result) {
			username = result;
		}
	});

	$('#search-form').submit(function(event) {
		event.preventDefault();
		if ($('#location-box').val() !== "") {
			$.ajax({
				method: "GET",
				url: "/api/google/location?address=" + $('#location-box').val(),
				success: function(result) {
					populateMap($('#search-box').val(), result);
				}
			});
		} else {
			populateMap($('#search-box').val(), "NO_LOCATION_SPECIFIED");
		}
	});

	// Submit review.
	$('#add-review-form').submit(function(event) {
		event.preventDefault();

		// If form is not filled out completely...
		if ($('#review-text').val() === "" ||
			$('input[name=gendNeutBath]:checked').length === 0 ||
			$('input[name=lgbtOwned]:checked').length === 0 ||
			$('input[name=advertises]:checked').length === 0 ||
			$('#friendliness').find(":selected").text() === "How would you rate them out of 5?") {
				$('#login-error').removeClass('hidden');
		} else {
			$('#login-error').addClass('hidden');
			if($('#review-modal').data('review-edit') === true) {
				saveReview($('#review-modal').data('place-id'),
						   $('#review-modal').data('review-id'));
			} else {
				addReview();
			}
		}
	});

	// Edit review.
	$('.review-list').on('click', '.edit-review', function(e) {

		// Give modal data for saving.
		clearReviewModal();
		$('#review-modal').data('place-id', $(this).parent().parent().data('place-id'));
		$('#review-modal').data('review-id', $(this).parent().parent().data('review-id'));
		$('#review-modal').data('review-edit', true);

		// Fill in modal with existing review data.
		$.ajax({
			method: "GET",
			url: '/api/places/' + $('#review-modal').data('place-id'),
			success: function(places) {
				$('#modal-form-title').html('What do you think of ' + places[0].name + '?');
				let review;
				places[0].reviews.forEach(function(element) {
					if (element._id === $('#review-modal').data('review-id')) {
						review = element;
					}
				});

				// Fill in form with existing review data.
				$('#review-text').val(review.text);
				if (review.genderNeutralBathrooms) { $('#gendNeutBathYes').prop('checked', true);} 
				else { $('#gendNeutBathNo').prop('checked', true); }
				if (review.lgbtOwned) { $('#lgbtOwnedYes').prop('checked', true);} 
				else { $('#lgbtOwnedNo').prop('checked', true); }
				if (review.advertises) { $('#advertisesYes').prop('checked', true);} 
				else { $('#advertisesNo').prop('checked', true); }
				$('#friendliness').val(review.friendliness);
			}
		});
		$('#review-modal').modal();
	});

	// Delete review.
	$('.review-list').on('click', '.delete-review', function(e) {
		$('#delete-modal').data('place-id', $(this).parent().parent().data('place-id'));
		$('#delete-modal').data('review-id', $(this).parent().parent().data('review-id'));
		$('#delete-modal').modal();
	});

	$('#delete-modal-delete').on('click', function(e) {
		e.preventDefault();
		$.ajax({
			method: "DELETE",
			url: '/api/places/' + $('#delete-modal').data('place-id') + '/reviews/' + $('#delete-modal').data('review-id'),
			success: function(result) {
				populateReviewList(result.name);
				openInfoWindows.setContent(updateInfoWindow(result));
			}
		});
	});
});

function generateFriendlinessImage(friendliness) {
	// TO DO - this is surely not the way to handle this.
	switch (true) {
	case (friendliness === 0):
		return "No ratings";
	case (friendliness >= 0 && friendliness < 25):
		return "<img src='img/0star.png'>";
    case (friendliness >= 25 && friendliness < 50):
    	return "<img src='img/point25star.png'>";
    case (friendliness >= 50 && friendliness < 75):
    	return "<img src='img/point5star.png'>";
    case (friendliness >= 75 && friendliness < 100):
    	return "<img src='img/point75star.png'>";	
    case (friendliness >= 100 && friendliness < 125):
        return "<img src='img/1star.png'>";
    case (friendliness >= 125 && friendliness < 150):
    	return "<img src='img/1point25star.png'>";
    case (friendliness >= 150 && friendliness < 175):
    	return "<img src='img/1point5star.png'>";
    case (friendliness >= 175 && friendliness < 200):
    	return "<img src='img/1point75star.png'>";
    case (friendliness >= 200 && friendliness < 225):
        return "<img src='img/2star.png'>";
    case (friendliness >= 225 && friendliness < 250):
    	return "<img src='img/2point25star.png'>";
    case (friendliness >= 250 && friendliness < 275):
    	return "<img src='img/2point5star.png'>";
    case (friendliness >= 275 && friendliness < 300):
    	return "<img src='img/2point75star.png'>";
    case (friendliness >= 300 && friendliness < 325):
        return "<img src='img/3star.png'>";
    case (friendliness >= 325 && friendliness < 350):
    	return "<img src='img/3point25star.png'>";
    case (friendliness >= 350 && friendliness < 375):
    	return "<img src='img/3point5star.png'>";
    case (friendliness >= 375 && friendliness < 400):
    	return "<img src='img/3point75star.png'>";
    case (friendliness >= 400 && friendliness < 425):
        return "<img src='img/4star.png'>";
    case (friendliness >= 425 && friendliness < 450):
    	return "<img src='img/4point25star.png'>";
    case (friendliness >= 450 && friendliness < 475):
    	return "<img src='img/4point5star.png'>";
    case (friendliness >= 475 && friendliness < 500):
    	return "<img src='img/4point75star.png'>";
    case (friendliness === 500):
        return "<img src='img/5star.png'>";
    default:
        throw console.log('invalid friendliness rating: ' + friendliness);
	}
}

function hasUserReviewed(place) {
	let hasReviewed = false;
	place.reviews.forEach(function(element) {
		if (element.author === username) { 
			hasReviewed = true; 
		}
	});
	return hasReviewed;
}

function updateInfoWindow(place) {
	let friendliness;
	let friendImgSrc = '';
	let genNeutBath = '/img/check_false.png';
	let lgbtOwned = '/img/check_false.png';
	let advertises = '/img/check_false.png';

	if (place.genderNeutralBathrooms) { genNeutBath = 'img/check_true.png'; }
	if (place.lgbtOwned) { lgbtOwned = '/img/check_true.png'; }
	if (place.advertises) { advertises = '/img/check_true.png'; }

	// Set rating image according to friendliness
	if (place.reviews.length === 0) { friendliness = 0; }
	else { friendliness = Math.floor(place.friendliness * 100 / place.reviews.length);}
	friendImgSrc = generateFriendlinessImage(friendliness);

	let content= "<b>" + place.name + "</b><br>" +
		place.address + "<br><br>" +
		"<center>" + friendImgSrc + "</center><br>" +
        "<center>" + place.reviews.length + " reviews</center><br>" +  
        "<table>" +
        "<tr><td width=200>Gender Neutral Bathrooms:</td><td><img src='" + genNeutBath + "'></td></tr>" +
        "<tr><td width=200>LGBT Owned:</td><td><img src='" + lgbtOwned + "'></td></tr>" +
        "<tr><td width=200>Advertises as LGBT Friendly:</td><td><img src='" + advertises + "'></td></tr></table><br>";

    // If user hasn't review yet, add a review button
    if(hasUserReviewed(place) === false) {
		content += "<center><button class='btn btn-default add-review'>Write a review</button></center>";
    }

    return content;
}

function createInfoWindow(place, callback) {

	// Determine a location for our Google Place
	let address;
	if (place.formatted_address) { address = place.formatted_address; }
	else if (place.vicinity) { address = place.vicinity; }
	else { address = "No address specified"; }

	// Check our database to see if we have info about this place.
	$.ajax({
		url: '/api/places/',
		method: "POST",
		data: {
			'search': place.name,
			'location': {
				'lat': place.geometry.location.lat,
				'lng': place.geometry.location.lng
			},
			'address': address
		},
		success: function(result) {
			var infoWindow = new google.maps.InfoWindow({
				content: updateInfoWindow(result)
			});

			// Create this place's info window.
      		google.maps.event.addListener(infoWindow, 'domready', function() {
      			$('.add-review').click(function() {
      				clearReviewModal();
      				$('#review-modal').data('place-id', result._id);
      				$('#modal-form-title').html('What do you think of ' + place.name + '?');
      				$('#review-modal').modal();
      			});
      		});

			callback(infoWindow, result);
		}
	});
}

function closeOpenInfoWindows() {

	// Hide reviews
	$('#reviews').addClass('hidden');

	// Close info windows.
	if (!openInfoWindows) return;

	openInfoWindows.close();
}

function addReview() {
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

	$.ajax({
		method: "PUT",
		url: url,
		data: {
			'placeId': $('#review-modal').data('place-id'),
			'friendliness': friendliness,
			'genderNeutralBathrooms': genderNeutralBathrooms,
			'lgbtOwned': lgbtOwned,
			'advertises': advertises,
			'text': reviewText
		},
		success: function(result) {
			$('#review-modal').modal('toggle');
			populateReviewList(result.name);
			openInfoWindows.setContent(updateInfoWindow(result));
		}
	});
}

function saveReview(placeId, reviewId) {
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

	$.ajax({
		method: "PUT",
		url: '/api/places/' + placeId + '/reviews/' + reviewId,
		data: {
			'friendliness': friendliness,
			'genderNeutralBathrooms': genderNeutralBathrooms,
			'lgbtOwned': lgbtOwned,
			'advertises': advertises,
			'text': reviewText
		},
		success: function(result) {
			$('#review-modal').modal('toggle');
			// Restore modal to it's natural state.
			clearReviewModal();
			populateReviewList(result.name);
			openInfoWindows.setContent(updateInfoWindow(result));
		}
	});
}

function clearReviewModal() {
	$('#review-modal').data('review-edit', false);
	$('#review-modal').data('place-id', '');
	$('#review.modal').data('review-id', '');
	$('#review-text').val('');
	$('#gendNeutBathYes').prop('checked', false);
	$('#gendNeutBathNo').prop('checked', false);
	$('#lgbtOwnedYes').prop('checked', false);
	$('#lgbtOwnedNo').prop('checked', false);
	$('#advertisesYes').prop('checked', false); 
	$('#advertisesNo').prop('checked', false);
	$('#friendliness').val(0);
}

function populateReviewList(placeName) {

	/*
	let placeArray = placeName.split(' ');
	let newPlaceName = "";
	for(let i = 0; i < placeArray.length; i++) {
		if (placeArray[i] === '&') {
			newPlaceName += '%26';
		} else if (i === placeArray.length - 1) {
			newPlaceName += placeArray[i];
		} else {
			newPlaceName += placeArray[i] + " ";
		}
	}

	console.log(newPlaceName);
	*/

	// Clear existing reviews.
	var reviewList = $('#review-list');
	$('#this-user-reviews').addClass('hidden');
	$('#reviews').addClass('hidden');
	var thisUserReviewList = $('#this-user-review-list');
	reviewList.html('');
	thisUserReviewList.html('');

	$.ajax({
		method: 'POST',
		url: '/api/places/customsearch',
		data: {
			name: placeName
		},
		success: function(place) {

			// Create bootstrap panel to represent review
			place.reviews.forEach(function(element, index) {
			    var $outerDiv = $("<li class='review'></li>");
			    $outerDiv.data('place-id', element.placeId);
			    $outerDiv.data('review-id', element._id);
			    $outerDiv.addClass("panel");
			    $outerDiv.addClass("panel-default");

			    var innerDiv = $("<div></div>");
			    innerDiv.addClass("panel-body");
			    innerDiv.html("<div><div><h4>" + place.reviews[index].author + ":</h4></div></div>" +
			    	"<div><div>" + generateFriendlinessImage(100 * place.reviews[index].friendliness) + "</div>" +
			    	"<div><p class='review-description'>\"" + place.reviews[index].text + "\"</p></div></div>");

			    innerDiv.addClass('blue');
			    $outerDiv.addClass('blue');

			    $outerDiv.append(innerDiv);

	    		if (username && place.reviews[index].author === username) {
	    			innerDiv.html(innerDiv.html() + 
	    				"<br><button class='btn btn-default edit-review'>Edit</button>" + 
	    				"<button class='btn btn-danger delete-review'>Delete</button>");
			    	thisUserReviewList.append($outerDiv);
			    	$('#this-user-reviews').removeClass('hidden');
			    } else {
			    	reviewList.append($outerDiv);
			    	$('#reviews').removeClass('hidden');
			    }
		  	});
		}
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
  
    let radius = calculateSearchRadius();

    let data = {
    	search: searchTerm,
    	radius: radius
    };

    if (location == "NO_LOCATION_SPECIFIED") {
    	data.location = {
    		lat: map.getCenter().lat(),
    		lng: map.getCenter().lng()
    	};
    } else {
    	data.location = {
    		lat: location.lat,
    		lng: location.lng
    	};
    }

    $.ajax({
	    url: '/api/google',
	    method: "POST",
	    data: data,
	    success: function(results) {
	      
	        // Remove active markers from the map.
	        markers.forEach(function(element) {
	        	element.setMap(null);
	        });
	        markers = [];

	        // Recenter the map
	        map.setCenter({lat: results[0].geometry.location.lat,
	        			   lng: results[0].geometry.location.lng});

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
		            	populateReviewList(element.name);
		            	infoWindow.open(map, marker);
		            	openInfoWindows = infoWindow;
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