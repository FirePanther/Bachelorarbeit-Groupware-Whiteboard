/**
 * The Drawing Handler. Allows to draw on a board.
 * @constructor
 * @param {jQuery} [$board] - The canvas jQuery element.
 */
function Draw() {
	this.drawing = 0;
	
	this.settings = {
		brushSize: 10,
		eraserSize: 50
	};
	
	this.toolSettings = {
		pencil: {
			icon: '<img src="img/pencil.svg" alt="Pencil" />'
		},
		brush: {
			icon: '<img src="img/brush.svg" alt="Brush" />',
			settings: {
				brushSize: {
					type: ToolSettingType.SMALLBUTTONS,
					label: "Size",
					buttons: {
						thin: {
							icon: '<span class="shapeCircle" style="width: 5px; height: 5px;"></span>',
							value: 10
						},
						medium: {
							icon: '<span class="shapeCircle" style="width: 10px; height: 10px;"></span>',
							value: 20
						},
						thick: {
							icon: '<span class="shapeCircle" style="width: 15px; height: 15px;"></span>',
							value: 30
						}
					}
				}
			}
		},
		eraser: {
			icon: '<img src="img/eraser.svg" alt="Eraser" />',
			settings: {
				eraserSize: {
					type: ToolSettingType.SMALLBUTTONS,
					label: "Size",
					buttons: {
						thin: {
							icon: '<span class="shapeCircle" style="width: 5px; height: 5px;"></span>',
							value: 20
						},
						medium: {
							icon: '<span class="shapeCircle" style="width: 10px; height: 10px;"></span>',
							value: 50
						},
						thick: {
							icon: '<span class="shapeCircle" style="width: 15px; height: 15px;"></span>',
							value: 80
						}
					}
				}
			}
		}
	};
};

/**
 * Initializes the mouse events for the board.
 */
Draw.prototype.initEvents = function(toolNr) {
	this.toolNr = toolNr;
	
	var self = this;
	main.board.$board.on("mousedown.tool", function(event) {
		// start drawing
		if (!event.button) { // left mouse button
			self.drawAction.apply(self, [ event, true ]);
		}
	}).on("mousemove.tool", function(event) {
		// still drawing
		if (self.drawing == 1) self.drawAction.apply(self, [ event, false, 1 ]);
	}).on("mouseleave.tool", function(event) {
		// pause drawing
		if (self.drawing == 1) {
			self.drawAction.apply(self, [ event, false, 2 ]);
			self.drawing = 2;
		}
	}).on("mouseenter.tool", function(event) {
		// continue drawing
		if (event.buttons == 1) {
			if (self.drawing == 2) self.drawAction.apply(self, [ event, true ]);
		} else {
			self.drawing = 0;
		}
	}).on("mouseup.tool", function(event) {
		// stop drawing
		if (self.drawing) {
			self.drawAction.apply(self, [ event, false, 2 ]);
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
Draw.prototype.drawAction = function(event, begin, setState) {
	begin = begin || false;
	//doCorrectByDirection = doCorrectByDirection || false;
	setState = setState || 0;
	
	this.drawing = 1;
	if (begin) this.tmpHistory = [];
	
	//if (doCorrectByDirection) event = correctByDirection(event);
	var position = [ event.offsetX, event.offsetY ];
	
	this.addHistory(position, setState);
	var thickness = this.toolNr == HistoryType.ERASER ? this.settings.eraserSize : this.settings.brushSize;
	var drawing = this.draw(this.toolNr, thickness, position, setState);
	
	if (setState == 2 && drawing.drawed) {
		// finished the current drawing
		var history = main.history.add({
			toolNr: this.toolNr,
			drawing: this.tmpHistory,
			t: this.toolNr == HistoryType.PENCIL ? null : thickness,
			c: main.tools.getColor(),
			o: main.tools.opacity
		});
		
		// redraw, else it isn't sharp because of too many strokes (better than drawImage)
		this.redraw(history.entry);
		drawing.board.remove();
		
		main.server.broadcast(BroadcastType.SAVE, history);
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
		x: position[0],
		y: position[1],
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
Draw.prototype.draw = function(toolNr, thickness, position, state, color, opacity, userId, board) {
	userId = userId || 0; // 0 = own, -1 = not important (e.g. redraw)
	if (toolNr == HistoryType.ERASER) {
		opacity = 1;
		color = "#FFFFFF";
	} else opacity = opacity || main.tools.opacity;
	
	color = main.tools.getColor(color);
	
	var curBoard = (userId == -1 ? board : main.board.tmpBoard(userId));
	
	switch (state) {
		// mouse down
		case 0:
			this.drawStart(userId == -1, toolNr, curBoard, thickness, position, color, opacity);
			break;
		// mouse move
		case 1:
			this.drawContinue(userId == -1, curBoard, position);
			break;
		// mouse up
		case 2:
			if (!this.drawEnd(userId == -1, curBoard, position, opacity)) return { drawed: false };
			break;
	}
	
	if (userId == 0) {
		// currently drawing
		main.server.broadcast(BroadcastType.TMP, {
			toolNr: toolNr,
			t: thickness,
			x: position[0],
			y: position[1],
			s: state,
			c: toolNr == HistoryType.ERASER ? null : color,
			o: toolNr == HistoryType.ERASER ? null : opacity
		});
	}
	return {
		drawed: true,
		board: curBoard
	};
};

/**
 */
Draw.prototype.drawStart = function(redraw, toolNr, curBoard, thickness, position, color, opacity) {
	switch (toolNr) {
		case HistoryType.BRUSH:
			curBoard.context.lineWidth = thickness * MULTIPLIER;
			break;
		case HistoryType.ERASER:
			color = "#FFFFFF";
			curBoard.context.lineWidth = thickness * MULTIPLIER;
			break;
		case HistoryType.PENCIL:
			curBoard.context.lineWidth = 1 * MULTIPLIER;
			break;
	}
	
	if (redraw) curBoard.context.globalAlpha = opacity;
	else curBoard.$element.css("opacity", opacity);
	curBoard.context.strokeStyle = color;
	
	// bevel (eckig), miter (spitz), round (rund)
	curBoard.context.lineJoin = "round";
	curBoard.context.lineCap = "round";
	curBoard.cache.startPosition = position;
	curBoard.cache.moved = false;
};

/**
 */
Draw.prototype.drawContinue = function(redraw, curBoard, position) {
	if (curBoard.cache.startPosition) {
		curBoard.context.beginPath();
		curBoard.context.moveTo(curBoard.cache.startPosition[0] * MULTIPLIER, curBoard.cache.startPosition[1] * MULTIPLIER);
		delete curBoard.cache.startPosition;
	}

	curBoard.context.lineTo(position[0] * MULTIPLIER, position[1] * MULTIPLIER);
	if (!redraw) curBoard.context.stroke();
};

/**
 *
 */
Draw.prototype.drawEnd = function(redraw, curBoard, position, opacity) {
	if (curBoard.cache.startPosition) {
		curBoard.context.beginPath();
		curBoard.context.moveTo(position[0] * MULTIPLIER + .001, position[1] * MULTIPLIER);
	}
	curBoard.context.lineTo(position[0] * MULTIPLIER, position[1] * MULTIPLIER);
	curBoard.context.stroke();
	
	return true;
};

/**
 * 
 */
Draw.prototype.broadcast = function(userId, parameters) {
	this.draw(parameters.toolNr, parameters.t, [ parameters.x, parameters.y ], parameters.s, parameters.c, parameters.o, userId);
};

/**
 * 
 */
Draw.prototype.removeTmp = function(history) {
	main.board.tmpBoard(history.userId).remove();
};

/**
 * Draws the whole "current" drawing (from mousedown to mouseup), called by the
 * board class.
 * @param {Object} history - Contains the whole "current" drawing.
 */
Draw.prototype.redraw = function(history, board) {
	board = board || main.board;
	debug.log("+ redraw: " + history.toolNr);
	var d = history.drawing;
	for (var i in d) {
		this.draw(history.toolNr, history.t, [ d[i].x, d[i].y ], d[i].s, history.c, history.o, -1, board);
	}
};

// register tool in main
main.registerTool(new Draw());
