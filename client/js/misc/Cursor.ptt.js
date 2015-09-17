/**
 * 
 */
function Cursor() {
	this.$cursors = $('<div class="cursors" />');
	$("body").append(this.$cursors);
	
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
	
	BroadcastType.CURSOR = BroadcastType.index++;
	main.server.broadcasts[BroadcastType.CURSOR] = function(resp) {
		if (resp.data.remove) self.remove.apply(self, [ resp.userId ]);
		else self.move.apply(self, [ resp.userId, resp.data.x, resp.data.y ]);
	};
	main.server.disconnects.push(function(userId) {
		self.remove.apply(self, [ userId ]);
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
		if (main.server.names && main.server.names[cursorId]) {
			this.cursors[cursorId].$label.text(main.server.names[cursorId]);
		} else {
			this.cursors[cursorId].$label.text(cursorId);
		}
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
			$label: $label,
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
		main.server.broadcast(BroadcastType.CURSOR, {
			x: event.pageX,
			y: event.pageY
		});
	}
};

/**
 * 
 */
Cursor.prototype.broadcastAway = function(event) {
	main.server.broadcast(BroadcastType.CURSOR, {
		remove: true
	});
};

main.miscs.cursor = new Cursor();