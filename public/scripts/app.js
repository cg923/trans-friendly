
// Global variables.
let map;
let openInfoWindows;
let markers = [];
let currentPlaceId = "";
let username;

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
		populateMap($('#search-box').val(), map.getCenter());
	});

	// Submit review.
	$('#add-review-form').submit(function(event) {
		event.preventDefault();
		// Form is not filled out completely.
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
	switch (friendliness) {
	case 0:
		return "No ratings";
    case 1:
        return "<img src='img/1star.png'>";
    case 2:
        return "<img src='img/2star.png'>";
    case 3:
        return "<img src='img/3star.png'>";
    case 4:
        return "<img src='img/4star.png'>";
    case 5:
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
	else { friendliness = Math.floor(place.friendliness / place.reviews.length); }
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
			console.log(openInfoWindows);
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

	// Clear existing reviews.
	var reviewList = $('#review-list');
	var thisUserReviewList = $('#this-user-review-list');
	reviewList.html('');
	thisUserReviewList.html('');

	$.ajax({
		method: 'GET',
		url: '/api/places/search?name=' + placeName,
		success: function(place) {
			// Create bootstrap panel to represent review
			place.reviews.forEach(function(element, index) {
			    var $outerDiv = $('<li></li>');
			    $outerDiv.data('place-id', element.placeId);
			    $outerDiv.data('review-id', element._id);
			    $outerDiv.addClass("panel");
			    $outerDiv.addClass("panel-default");

			    var innerDiv = $("<div class='row'></div>");
			    innerDiv.addClass("panel-body");
			    innerDiv.html("<div class='row'><div class='col-lg-12'><h4>" + place.reviews[index].author + ":</h4></div></div>" +
			    	"<div class='row'><div class='col-lg-4'>" + generateFriendlinessImage(place.reviews[index].friendliness) + "</div>" +
			    	"<div class='col-lg-8'><p class='review-description'>\"" + place.reviews[index].text + "\"</p></div></div>");

			    if(index % 2 === 0) { 
			      	innerDiv.addClass('pink'); 
			      	$outerDiv.addClass('pink');
			    }
			    else { 
			      	innerDiv.addClass('blue');
			      	$outerDiv.addClass('blue');
			    }

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