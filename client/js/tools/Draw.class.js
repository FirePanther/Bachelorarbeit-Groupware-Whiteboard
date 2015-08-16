/**
 * The Drawing Handler. Allows to draw on a board.
 * @constructor
 * @param {jQuery} [$board] - The canvas jQuery element.
 */
function Draw() {
	this.drawing = 0;
	
	this.toolSettings = {
		pencil: {
			icon: '<img src="img/pencil.svg" alt="Pencil" />'
		},
		brush: {
			icon: '<img src="img/brush.svg" alt="Brush" />',
			settings: {
				type: ToolSettingType.BUTTONS,
				thin: {},
				medium: {},
				thick: {}
			}
		}
	};
};

/**
 * Initializes the mouse events for the board.
 */
Draw.prototype.initEvents = function(toolName) {
	this.toolName = toolName;
	main.board.events.push("mousedown", "mousemove", "mouseleave", "mouseenter", "mouseup");
	
	var self = this;
	main.board.$board.on("mousedown", function(event) {
		// start drawing
		self.drawAction(event, true);
	}).on("mousemove", function(event) {
		// still drawing
		if (self.drawing == 1) self.drawAction(event, false, false, 1);
	}).on("mouseleave", function(event) {
		// pause drawing
		if (self.drawing == 1) {
			self.drawAction(event, false, true, 2);
			self.drawing = 2;
		}
	}).on("mouseenter", function(event) {
		// continue drawing
		if (self.drawing == 2 && event.buttons == 1) self.drawAction(event, true, true);
	}).on("mouseup", function(event) {
		// stop drawing
		if (self.drawing) {
			self.drawAction(event, false, false, 2);
			self.drawing = 0;
		}
	});
};

/**
 * Saves the whole "draw" action.
 * @param {Object} event - The mouse event.
 * @param {boolean} [begin=false] - Is this the beginning of the drawing? (e.g. for mousedown and mouseenter)
 * @oaram {boolean} [doCorrectByDirection=false] - Should the event offset be corrected? (e.g. for mouseenter and mouseleave)
 * @param {integer} [setState=0] - The state of the mouse (see state@"Draw::addHistory" or state@"Draw::draw").
 */
Draw.prototype.drawAction = function(event, begin, doCorrectByDirection, setState) {
	begin = begin || false;
	doCorrectByDirection = doCorrectByDirection || false;
	setState = setState || 0;
	
	this.drawing = 1;
	if (begin) {
		this.tmpHistory = [];
	}
	
	if (doCorrectByDirection) event = correctByDirection(event);
	var position = [event.offsetX, event.offsetY];
	
	this.addHistory(this.toolName, position, setState);
	this.draw(this.toolName, position, setState);
	
	if (setState == 2) {
		// finished the current drawing
		var history = main.history.add({
			type: HistoryType[this.toolName.toUpperCase()],
			drawing: this.tmpHistory,
			color: main.tools.options.color
		});
		main.server.broadcast("board", history);
	}
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
Draw.prototype.addHistory = function(toolName, position, state) {
	this.tmpHistory.push({
		toolName: toolName,
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
 * @param ...
 */
Draw.prototype.draw = function(toolName, position, state, color, close, noBroadcast) {
	close = close || 0;
	switch (state) {
		// mouse down
		case 0:
			switch (toolName) {
				case "brush":
					main.board.context.lineWidth = 5;
					break;
				case "pencil":
					main.board.context.lineWidth = 1;
					break;
			}
			
		
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
	
	noBroadcast = noBroadcast || 0;
	if (!noBroadcast && state != 2) {
		// currently drawing
		main.server.broadcast("board tmp", {
			toolName: toolName,
			position: position,
			state: state,
			color: main.board.context.strokeStyle,
			close: close
		});
	}
};

/**
 * 
 */
Draw.prototype.broadcast = function(self, parameters) {
	self.draw(parameters.toolName, parameters.position, parameters.state, parameters.color, parameters.close, 1);
};

/**
 * Draws the whole "current" drawing (from mousedown to mouseup), called by the
 * board class.
 * @param {Object} history - Contains the whole "current" drawing.
 */
Draw.prototype.redraw = function(tmpHistory, toolName) {
	debug.log("+ redraw: " + toolName);
	var d = tmpHistory.drawing;
	for (var i in d) {
		this.draw(d[i].toolName, d[i].position, d[i].state, tmpHistory.color, 0, 1);
	}
};

// register tool in main
main.registerTool(new Draw());
