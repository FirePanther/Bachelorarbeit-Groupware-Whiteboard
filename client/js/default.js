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

/**
 * Corrects the leaving to and entering from the edges of the screen. Drawing to and from the edges is without margins.
 * @param {Object} event - The event of the mouse.
 * @returns {Object} The corrected version of the event where the offset from where the mouse is coming is exactly on
 *			the edge (e.g. from left => offsetX = 0).
 */
function correctByDirection(event) {
	var isLeft = event.offsetX,
		isTop = event.offsetY,
		isRight = event.currentTarget.clientWidth - event.offsetX,
		isBottom = event.currentTarget.clientHeight - event.offsetY;
	
	// check 
	if (isLeft <= isTop && isLeft <= isRight && isLeft <= isBottom) {
		// left
		event.offsetX = 0;
	} else if (isTop <= isLeft && isTop <= isRight && isTop <= isBottom) {
		// top
		event.offsetY = 0;
	} else if (isRight <= isLeft && isRight <= isTop && isRight <= isBottom) {
		// right
		event.offsetX = event.currentTarget.clientWidth;
	} else if (isBottom <= isLeft && isBottom <= isRight && isBottom <= isTop) {
		// bottom
		event.offsetY = event.currentTarget.clientHeight;
	}
	return event;
};

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