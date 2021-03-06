/**
 * Creates a selection element to show which element has the focus. The element
 * gets an animated dashed border. It is possible to set the coordinates (x, y, width, height)
 * or to give an element as parameter so the coordinates can be determined automatically.
 * @constructor
 * @param {Object/int} el - The x coordinate or a jQuery element.
 * @param {int} [y] - The y coordinate. Ignored, if first parameter is an element.
 * @param {int} [w] - The width. Ignored, if first parameter is an element.
 * @param {int} [h] - The height. Ignored, if first parameter is an element.
 */
function Selection(el, y, w, h) {
	this.x = this.y = this.w = this.h = 0;
	this.$element = $('<div class="selection click-through"/>');
	this.$element.append('<div class="top"/>');
	this.$element.append('<div class="right"/>');
	this.$element.append('<div class="bottom"/>');
	this.$element.append('<div class="left"/>');
	
	if (el instanceof $) this.el = el;
	
	this.resize(el, y, w, h);
	
	$("body").append(this.$element);
	
	this.deleted = false;
};

/**
 * Resizes and moves the selection element. The parameters are optional.
 * If the @contructor follows an element this determines the new coordinates.
 * @param {Object/int} el - The x coordinate or a jQuery element.
 * @param {int} [y] - The y coordinate. Ignored, if first parameter is an element.
 * @param {int} [w] - The width. Ignored, if first parameter is an element.
 * @param {int} [h] - The height. Ignored, if first parameter is an element.
 */
Selection.prototype.resize = function(el, y, w, h) {
	if (this.deleted) return null;
	
	el = el || null;
	y = y || null;
	w = w || null;
	h = h || null;
	
	if (el === null && y === null && w === null && h === null) el = this.el;
	
	if (el instanceof $) {
		var offset = el.offset();
		this.x = offset.left;
		this.y = offset.top;
		this.w = el.outerWidth();
		this.h = el.outerHeight();
	} else {
		if (el !== null) this.x = el;
		if (y !== null) this.y = y;
		if (w !== null) this.w = w;
		if (h !== null) this.h = h;
	}
	this._reposition();
};

/**
 * A local method to set the determined coordinates.
 */
Selection.prototype._reposition = function() {
	if (this.deleted) return null;
	
	this.$element.css({
		left: this.x + "px",
		top: this.y + "px",
		width: this.w + "px",
		height: this.h + "px"
	});
};

/**
 * Removes the selection element and marks this object as deleted so it can't be
 * used anymore.
 */
Selection.prototype.remove = function() {
	if (this.deleted) return null;
	
	this.$element.remove();
	this.deleted = true;
};
