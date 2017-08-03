
// POST /api/google
function newPlace(request, response, next) {
	console.log('yo!');
	response.json({message: 'Got here!'});
}

module.exports = {
	newPlace: newPlace
};