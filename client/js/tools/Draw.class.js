/**
 * The Drawing Handler. Allows to draw on a board.
 * @constructor
 * @param {jQuery} [$board] - The canvas jQuery element.
 */
function Draw() {
	this.drawing = 0;
	this.initEvents();
};

/**
 * Initializes the mouse events for the board.
 */
Draw.prototype.initEvents = function() {
	var self = this;
	main.board.$board.on("mousedown", function(event) {
		// start drawing
		self.drawing = 1;
		self.history = [];
		var position = [event.pageX - this.offsetLeft, event.pageY - this.offsetTop];
		
		// will be removed
		main.board.context.strokeStyle = "#df4b26";
		main.board.context.lineJoin = "round";
		main.board.context.lineWidth = 5;
		
		self.addHistory(position, 0);
		self.draw(position, 0);
	}).on("mousemove", function(event) {
		// still drawing
		if (self.drawing == 1) {
			var position = [event.pageX - this.offsetLeft, event.pageY - this.offsetTop];
			self.addHistory(position, 1);
			self.draw(position, 1);
		}
	}).on("mouseup", function(event) {
		// stop drawing
		self.drawing = 0;
		
		var position = [event.pageX - this.offsetLeft, event.pageY - this.offsetTop];
		self.addHistory(position, 2);
		self.draw(position, 2);
		
		main.history.add({
			type: HistoryType.DRAW,
			drawing: this.history
		});
	});
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
Draw.prototype.draw = function(position, state) {
	switch (state) {
		// mouse down
		case 0:
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
			main.board.context.lineTo(position[0], position[1]);
			//main.board.context.closePath();
			main.board.context.stroke();
			break;
	}
};

/**
 * Draws the whole "current" drawing (from mousedown to mouseup), called by the
 * board class.
 * @param {Object} history - Contains the whole "current" drawing.
 */
Draw.prototype.redraw = function(history) {
	
};