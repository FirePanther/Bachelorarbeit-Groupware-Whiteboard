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

/**
 * 
 */
function hash(obj) {
	var string = JSON.stringify(obj);
	
	// source: http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
	var hash = 0, i, chr, len;
	for (i = 0, len = string.length; i < len; i++) {
		chr = string.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0;
	}
	return hash;
};