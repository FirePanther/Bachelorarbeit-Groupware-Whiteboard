/**
 * 
 */
function Cursor() {
	this.$cursors = $(".cursors");
	this.cursors = {};
	
	main.board.$board.on("mousemove.cursor", this.broadcast);
};

/**
 * 
 */
Cursor.prototype.move = function(cursorId, x, y) {
	if (this.cursors[cursorId]) {
		this.cursors[cursorId].x = x;
		this.cursors[cursorId].y = y;
		this.cursors[cursorId].$element.css({
			left: main.tools.toolbarWidth + x,
			top: y
		});
	} else {
		// create
		var $div = $('<div class="cursor click-through" id="cursor_' + cursorId + '"/>'),
			$label = $('<div class="cursorLabel" />'),
			$pointer = $('<div class="pointer" />');
		$div.css({
			left: (main.tools.toolbarWidth + x) + "px",
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
					self.removeCursor(cursorId);
				};
			})(this, cursorId)
		};
	}
};

/**
 * 
 */
Cursor.prototype.removeCursor = function(cursorId) {
	this.cursors[cursorId].$element.remove();
	delete this.cursors[cursorId];
};

/**
 * 
 */
Cursor.prototype.broadcast = function(event) {
	main.server.broadcast("cursor", {
		x: event.offsetX,
		y: event.offsetY
	});
};
