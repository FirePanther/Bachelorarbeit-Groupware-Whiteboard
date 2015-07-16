var debug = new Debug(),
	main = new Main();
$(function() {
	main.init();
});

function lcfirst(string) {
	string += "";
	var first = string.charAt(0).toLowerCase();
	return first + string.substr(1);
}
function ucfirst(string) {
	string += "";
	var first = string.charAt(0).toUpperCase();
	return first + string.substr(1);
}