var map;
var openInfoWindows = [];
var makers = [];
var radius;

$(document).ready(function() {
	$('#search-form').submit(function(event) {
		event.preventDefault();
		populateMap($('#search-box').val(), map.getCenter());
	});
});

function populateMap(searchTerm, location) {
  // Calculate an appropriate search radius.
  // TO DO - This should be an equation.
  switch (map.getZoom()) {
    case 20:
      radius = 50;
      break;
    case 19:
      radius = 75;
      break;
    case 18:
      radius = 100;
      break;
    case 17:
      radius = 250;
      break;
    case 16:
      radius = 500;
      break;
    case 15:
      radius = 750;
      break;
    case 14:
      radius = 3250;
      break;
    case 13:
      radius = 5500;
      break;
    case 12:
      radius = 7750;
      break;
    default:
      radius = 10000;
      break;
  }

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
    	console.log('yay!');
    	console.log(results);
      /*
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
            infoWindow.open(map, marker);
          });
        });
      });*/
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