/**
 * The Drawing Handler. Allows to draw on a board.
 * @constructor
 * @param {jQuery} [$board] - The canvas jQuery element.
 */
function Draw() {
	this.drawing = {};
	
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
	
	var self = this;
	main.board.$board.on("mousedown.tool", function(event) {
		// start drawing
		self.drawAction(event, true);
	}).on("mousemove.tool", function(event) {
		// still drawing
		if (self.drawing[0] == 1) self.drawAction(event, false, false, 1);
	}).on("mouseleave.tool", function(event) {
		// pause drawing
		if (self.drawing[0] == 1) {
			self.drawAction(event, false, true, 2);
			self.drawing[0] = 2;
		}
	}).on("mouseenter.tool", function(event) {
		// continue drawing
		if (self.drawing[0] == 2 && event.buttons == 1) self.drawAction(event, true, true);
	}).on("mouseup.tool", function(event) {
		// stop drawing
		if (self.drawing[0]) {
			self.drawAction(event, false, false, 2);
			self.drawing[0] = 0;
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
	
	this.drawing[0] = 1;
	if (begin) {
		this.tmpHistory = [];
	}
	
	if (doCorrectByDirection) event = correctByDirection(event);
	var position = [event.offsetX, event.offsetY];
	
	this.addHistory(position, setState);
	this.draw(this.toolName, position, setState);
	
	if (setState == 2) {
		// finished the current drawing
		var history = main.history.add({
			type: HistoryType[this.toolName.toUpperCase()],
			toolName: this.toolName,
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
Draw.prototype.addHistory = function(position, state) {
	this.tmpHistory.push({
		p: position,
		s: state
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
Draw.prototype.draw = function(toolName, position, state, color, userId) {
	userId = userId || 0; // 0 = own, -1 = not important (e.g. redraw)
	
	var curBoard = (userId == -1 ? main.board : main.board.tmpBoard(userId));
	
	switch (state) {
		// mouse down
		case 0:
			switch (toolName) {
				case "brush":
					curBoard.context.lineWidth = 5;
					break;
				case "pencil":
					curBoard.context.lineWidth = 1;
					break;
			}
			
			if (/^\#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) {
				curBoard.context.strokeStyle = color;
			} else {
				curBoard.context.strokeStyle = main.tools.getColor(color);
			}
			
			// bevel (eckig), miter (spitz), round (rund)
			curBoard.context.lineJoin = "round";
			curBoard.context.lineCap = "round";
			curBoard.cache.startPosition = position;
			break;
		// mouse move
		case 1:
			if (curBoard.cache.startPosition) {
				curBoard.context.beginPath();
				curBoard.context.moveTo(curBoard.cache.startPosition[0], curBoard.cache.startPosition[1]);
				delete curBoard.cache.startPosition;
			}

			curBoard.context.lineTo(position[0], position[1]);
			curBoard.context.stroke();
			break;
		// mouse up
		case 2:
			if (!curBoard.cache.startPosition) {
				curBoard.context.lineTo(position[0], position[1]);
				curBoard.context.stroke();
			}
			if (curBoard.temporary) {
				if (userId == 0) {
					main.board.context.drawImage(curBoard.$element[0], 0, 0);
					main.board.drawed = true;
				} else {
					// foreign drawing
					var wholeBoard;
					if (main.board.drawed) {
						// create new wholeBoard
						wholeBoard = main.board.tmpBoard(null, true); // create a whole board
					} else {
						// get last wholeBoard
						wholeBoard = main.board.tmpBoard(main.board.wholeBoards, true);
					}
					wholeBoard.context.drawImage(curBoard.$element[0], 0, 0);
				}
				curBoard.remove();
			}
			break;
	}
	
	if (userId == 0) {
		// currently drawing
		main.server.broadcast("board tmp", {
			t: toolName,
			p: position,
			s: state,
			c: curBoard.context.strokeStyle
		});
	}
};

/**
 * 
 */
Draw.prototype.broadcast = function(self, userId, parameters) {
	self.draw(parameters.t, parameters.p, parameters.s, parameters.c, userId);
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
		this.draw(d[i].toolName, d[i].position, d[i].state, tmpHistory.color, -1);
	}
};

// register tool in main
main.registerTool(new Draw());
