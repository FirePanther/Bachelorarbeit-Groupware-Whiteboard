/**
 * Returns the string with the first char as lower case.
 * @param {string} string
 */
function lcfirst(string) {
	string += "";
	var first = string.charAt(0).toLowerCase();
	return first + string.substr(1);
}

/**
 * Returns the string with the first char as upper case.
 * @param {string} string
 */
function ucfirst(string) {
	string += "";
	var first = string.charAt(0).toUpperCase();
	return first + string.substr(1);
}

/**
 * Creates a unique hash of an object.
 * @param {Object} obj
 * @returns {int}
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