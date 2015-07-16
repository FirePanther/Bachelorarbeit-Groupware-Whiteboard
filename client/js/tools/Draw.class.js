/**
 * The Drawing Handler. Allows to draw on a board.
 * @constructor
 * @param {jQuery} [$board] - The canvas jQuery element.
 */
function Draw() {
	this.drawing = 0;
	
	this.toolSettings = {
		brush: {
			icon: "<img src=\"img/brush.svg\" alt=\"Brush\" />"
		}
	};
};

/**
 * 
 */
Draw.prototype.init = function() {
	main.history.registerTool(this, "brush");
	main.tools.registerTool(this, "draw", "brush");
};

/**
 * Initializes the mouse events for the board.
 */
Draw.prototype.initEvents = function() {
	var self = this;
	
	main.board.events.push("mousedown", "mousemove", "mouseleave", "mouseenter", "mouseup");
	main.board.$board.on("mousedown", function(event) {
		// start drawing
		self.drawing = 1;
		self.history = [];
		var position = [event.offsetX, event.offsetY];
		
		self.addHistory(position, 0);
		self.draw(position, 0);
	}).on("mousemove", function(event) {
		// still drawing
		if (self.drawing == 1) {
			var position = [event.offsetX, event.offsetY];
			self.addHistory(position, 1);
			self.draw(position, 1);
		}
	}).on("mouseleave", function(event) {
		// pause drawing
		if (self.drawing == 1) {
			self.drawing = 2;
			
			correctedEvent = self.correctByDirection(event);
			
			var position = [correctedEvent.offsetX, correctedEvent.offsetY];
			self.addHistory(position, 2);
			self.draw(position, 2);
			
			main.history.add({
				type: HistoryType.DRAW,
				drawing: self.history
			});
		}
	}).on("mouseenter", function(event) {
		// continue drawing or start drawing
		if (event.buttons == 1) {
			self.drawing = 1;
			self.history = [];

			correctedEvent = self.correctByDirection(event);
			
			var position = [correctedEvent.offsetX, correctedEvent.offsetY];
			self.addHistory(position, 0);
			self.draw(position, 0);
		}
	}).on("mouseup", function(event) {
		// stop drawing
		self.drawing = 0;
		
		var position = [event.offsetX, event.offsetY];
		self.addHistory(position, 2);
		self.draw(position, 2);
		
		main.history.add({
			type: HistoryType.BRUSH,
			drawing: self.history,
			color: main.tools.options.color
		});
	});
};

/**
 * Corrects the leaving to and entering from the edges of the screen. Drawing to and from the edges is without margins.
 * @param {Object} event - The event of the mouse.
 * @returns {Object} The corrected version of the event where the offset from where the mouse is coming is exactly on
 *			the edge (e.g. from left => offsetX = 0).
 */
Draw.prototype.correctByDirection = function(event) {
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
 * A local history just for the "current" drawing (from mousedown to mouseup)
 * @param {Object} position - The current position of the mouse.
 * @param {number} position.0 - The x position of the mouse.
 * @param {number} position.1 - The x position of the mouse.
 * @param {integer} state - The state of the mouse.
 * @param {integer} state.0 - mouse is down
 * @param {integer} state.1 - mouse was moved
 * @param {integer} state.2 - mouse is up
 */
Draw.prototype.addHistory = function(position, state) {
	this.history.push({
		position: position,
		state: state
	});
};

/**
 * Draws the "current" drawing line for line.
 * @param {Object} position - The current position of the mouse.
 * @param {number} position.0 - The x position of the mouse.
 * @param {number} position.1 - The x position of the mouse.
 * @param {integer} state - The state of the mouse.
 * @param {integer} state.0 - mouse is down
 * @param {integer} state.1 - mouse was moved
 * @param {integer} state.2 - mouse is up
 */
Draw.prototype.draw = function(position, state, color, close) {
	close = close || 0;
	switch (state) {
		// mouse down
		case 0:
			main.board.context.strokeStyle = main.tools.getColor(color);
			
			// bevel (eckig), miter (spitz), round (rund)
			main.board.context.lineJoin = "round";
			main.board.context.lineCap = "round";
			this.startPosition = position;
			break;
		// mouse move
		case 1:
			if (this.startPosition) {
				main.board.context.beginPath();
				main.board.context.moveTo(this.startPosition[0], this.startPosition[1]);
				this.startPosition = null;
			}
			main.board.context.lineTo(position[0], position[1]);
			main.board.context.stroke();
			break;
		// mouse up
		case 2:
			if (this.startPosition === null) {
				main.board.context.lineTo(position[0], position[1]);
				if (close) {
					main.board.context.closePath();
				}
				main.board.context.stroke();
			}
			break;
	}
};

/**
 * Draws the whole "current" drawing (from mousedown to mouseup), called by the
 * board class.
 * @param {Object} history - Contains the whole "current" drawing.
 */
Draw.prototype.redraw = function(history, toolName) {
	debug.log("+ redraw: " + toolName);
	var d = history.drawing;
	for (var i in d) {
		this.draw(d[i].position, d[i].state, history.color);
	}
};

// register tool in main
main.registerTool("draw");
