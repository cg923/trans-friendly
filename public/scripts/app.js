var map;

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	    zoom: 15,
	    center: {lat: 39.7392358, lng: -104.990251}
	});
}