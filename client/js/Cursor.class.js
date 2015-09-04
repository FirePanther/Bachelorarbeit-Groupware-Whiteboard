/**
 * 
 */
function Cursor() {
	this.$cursors = $(".cursors");
	this.cursors = {};
	this.focus = true;
	
	this.x = this.y = null;
	
	var self = this;
	$(window).on("mousemove.cursor mouseenter.cursor", function(event) {
		if (self.focus) self.broadcastMove.apply(self, [ event ]);
	}).on("focus.cursor", function() {
		self.focus = true;
	}).on("blur.cursor", function(event) {
		self.focus = false;
	}).on("mouseleave.cursor", function(event) {
		self.broadcastAway.apply(self, [ event ]);
	});
};

/**
 * 
 */
Cursor.prototype.move = function(cursorId, x, y) {
	if (this.cursors[cursorId]) {
		this.cursors[cursorId].x = x;
		this.cursors[cursorId].y = y;
		this.cursors[cursorId].$element.css({
			left: x,
			top: y
		});
	} else {
		// create
		var $div = $('<div class="cursor click-through" id="cursor_' + cursorId + '"/>'),
			$label = $('<div class="cursorLabel" />'),
			$pointer = $('<div class="pointer" />');
		$div.css({
			left: x + "px",
			top: y + "px"
		});
		$label.text(cursorId);
		$div.append($label);
		$div.append($pointer);
		this.$cursors.append($div);
		this.cursors[cursorId] = {
			$element: $div,
			x: x,
			y: y,
			remove: (function(self, cursorId) {
				return function() {
					self.remove(cursorId);
				};
			})(this, cursorId)
		};
	}
};

/**
 * 
 */
Cursor.prototype.remove = function(cursorId) {
	console.log(this);
	if (this.cursors[cursorId]) {
		this.cursors[cursorId].$element.remove();
		delete this.cursors[cursorId];
	}
};

/**
 * 
 */
Cursor.prototype.broadcastMove = function(event) {
	if (this.focus) {
		this.x = event.pageX;
		this.y = event.pageY;
		main.server.broadcast("cursor", {
			x: event.pageX,
			y: event.pageY
		});
	}
};

/**
 * 
 */
Cursor.prototype.broadcastAway = function(event) {
	main.server.broadcast("cursor", {
		remove: true
	});
};
