/**
 *
 */
function Shape() {
	this.settings = {
		rectRadius: 0,
		triRadius: 0,
		lineWidth: 6,
		lineRound: true
	};
	
	this.toolSettings = {
		rectangle: {
			icon: '<span class="shapeRectangle" style="background-color: #16a085;"></span>',
			settings: {
				rectRadius: {
					type: ToolSettingType.RANGE,
					label: "Radius"
				}
			}
		},
		ellipse: {
			icon: '<span class="shapeCircle" style="background-color: #c0392b;"></span>'
		},
		triangle: {
			icon: '<span class="shapeTriangle" style="border-bottom-color: #f39c12;"></span>',
			settings: {
				triRadius: {
					type: ToolSettingType.RANGE,
					label: "Radius",
					value: this.settings.triRadius
				}
			}
		},
		line: {
			icon: '<span class="toolLine">/</span>',
			settings: {
				lineWidth: {
					type: ToolSettingType.RANGE,
					label: "Width",
					value: this.settings.lineWidth,
					min: 1,
					max: 31,
					step: 5
				},
				lineRound: {
					type: ToolSettingType.CHECKBOX,
					label: "Round",
					value: this.settings.lineRound
				}
			}
		}
	};
	
	this.tmpBoard = null;
	this.clicked = false;
	this.click = {};
	this.lastForm = {};
};

/**
 * 
 */
Shape.prototype.initEvents = function(toolNr) {
	$("body").addClass("toolShape");
	
	var self = this;
	main.board.$board.on("mousedown.tool", function(event) {
		self.clicked = true;
		// click-start coordinates
		var x = event.offsetX, y = event.offsetY, direction = 0;
		
		self.tmpBoard = main.board.tmpBoard();
		
		main.board.$board.on("mousemove.shapecreate", function(event) {
			var nx = event.offsetX, ny = event.offsetY, settings = {};
			
			if (toolNr == HistoryType.LINE) {
				// this works a little different
				var lx = x, ly = y, w = nx - lx, h = ny - ly;
			} else {
				var // lower coordinates
					lx = Math.min(x, nx), ly = Math.min(y, ny),
					// higher coordinates
					hx = Math.max(x, nx), hy = Math.max(y, ny),
					// size
					w = hx - lx, h = hy - ly;
			}
			
			if (!direction) direction = ny < y ? -1 : 1;
			
			// upside down shape
			if (toolNr == HistoryType.TRIANGLE) {
				if (ny < y && direction > 0 || ny > y && direction < 0) settings.upsideDown = true;
			}
			
			// get settings
			if (self.toolSettings[HistoryType.properties[toolNr].toolName].settings) {
				$.each(self.toolSettings[HistoryType.properties[toolNr].toolName].settings, function(key) {
					settings[key] = self.settings[key];
				});
			}
			
			self.drawForm.apply(self, [ 
				self.tmpBoard, toolNr,
				lx, ly, w, h,
				main.tools.getColor(), main.tools.opacity, settings,
				BroadcastType.TMP
			]);
		});
	}).on("mouseup.tool", function(event) {
		if (self.clicked) {
			main.board.$board.off(".shapecreate");
			
			main.board.context.globalAlpha = main.tools.opacity;
			main.board.context.drawImage(self.tmpBoard.$element[0], 0, 0);
			self.tmpBoard.remove();
			self.clicked = false;
			
			// broadcast finish
			var history = main.history.add(self.lastForm);
			main.server.broadcast(BroadcastType.SAVE, history);
		}
	});
};

/**
 * 
 */
Shape.prototype.deinitEvents = function() {
	$("body").removeClass("toolShape");
};

/**
 * 
 */
Shape.prototype.drawForm = function(board, toolNr, x, y, w, h, color, opacity, settings, broadcastType) {
	var ctx = board.context,
		xm = x * MULTIPLIER,
		ym = y * MULTIPLIER,
		wm = w * MULTIPLIER,
		hm = h * MULTIPLIER;
	
	if (board.temporary) {
		board.clear();
		board.$element.css({
			opacity: opacity
		});
	}
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	switch (toolNr) {
		case HistoryType.RECTANGLE:
			if (settings.rectRadius) {
				// rounded border
				var radW = wm * settings.rectRadius / 2,
					radH = hm * settings.rectRadius / 2,
					rad = Math.min(settings.rectRadius * 200, wm / 2, hm / 2);
				ctx.moveTo(xm + rad, ym);
				ctx.lineTo(xm + wm - rad, ym);
				ctx.quadraticCurveTo(xm + wm, ym, xm + wm, ym + rad);
				ctx.lineTo(xm + wm, ym + hm - rad);
				ctx.quadraticCurveTo(xm + wm, ym + hm, xm + wm - rad, ym + hm);
				ctx.lineTo(xm + rad, ym + hm);
				ctx.quadraticCurveTo(xm, ym + hm, xm, ym + hm - rad);
				ctx.lineTo(xm, ym + rad);
				ctx.quadraticCurveTo(xm, ym, xm + rad, ym);
				ctx.closePath();
				ctx.fill();
			} else {
				// no border
				ctx.fillRect(xm, ym, wm, hm);
			}
			break;
		case HistoryType.ELLIPSE:
			var wm2 = wm / 2,
				hm2 = hm / 2,
				wm23 = wm * 2 / 3;
				hm23 = hm * 2 / 3;
			// source: http://stackoverflow.com/questions/14169234/the-relation-of-the-bezier-curve-and-ellipse
			ctx.moveTo(xm + wm2, ym);
			ctx.bezierCurveTo(xm + wm2 + wm23, ym, xm + wm2 + wm23, ym + hm, xm + wm2, ym + hm);
			ctx.bezierCurveTo(xm + wm2 - wm23, ym + hm, xm + wm2 - wm23, ym, xm + wm2, ym);
			ctx.closePath();
			ctx.fill();
			break;
		case HistoryType.TRIANGLE:
			var hm1 = settings.upsideDown ? 0 : hm,
				hm2 = settings.upsideDown ? hm : 0,
				// radius percentage (max 40%)
				radP = settings.triRadius * .4,
				rad = ((wm + hm) / 2) * radP / 2,
				radW = wm * radP / 4,
				radH = hm * radP / 4,
				stroke = false;
			
			if (rad) {
				ctx.lineJoin = "round";
				ctx.lineWidth = rad;
				stroke = true;
			}
			if (settings.upsideDown) radH = -radH;
			
			// left corner
			ctx.moveTo(xm + radW, ym + hm1 - radH);
			// to right corner
			ctx.lineTo(xm + wm - radW, ym + hm1 - radH);
			// top middle corner
			ctx.lineTo(xm + wm / 2, ym + hm2 + radH);
			// to left corner
			ctx.lineTo(xm + radW, ym + hm1 - radH);
			ctx.closePath();
			if (stroke) ctx.stroke();
			ctx.fill();
			break;
		case HistoryType.LINE:
			ctx.lineWidth = settings.lineWidth;
			ctx.moveTo(xm, ym);
			ctx.lineTo(xm + wm, ym + hm);
			if (settings.lineRound) {
				ctx.closePath();
				ctx.lineJoin = "round";
			}
			ctx.stroke();
			break;
	}
	
	if (broadcastType) {
		this.lastForm = {
			toolNr: toolNr,
			left: x,
			top: y,
			width: w,
			height: h,
			settings: settings,
			c: color,
			o: opacity
		};
		main.server.broadcast(broadcastType, this.lastForm);
	}
};

/**
 * 
 */
Shape.prototype.broadcast = function(userId, parameters) {
	var tmpBoard = main.board.tmpBoard(userId);
	this.drawForm(tmpBoard, parameters.toolNr,
		parameters.left, parameters.top, parameters.width, parameters.height,
		parameters.c, parameters.o, parameters.settings,
		false);
};

/**
 * 
 */
Shape.prototype.removeTmp = function(history) {
	main.board.tmpBoard(history.userId).remove();
};

/**
 * 
 */
Shape.prototype.redraw = function(history, board) {
	board = board || main.board;
	this.drawForm(board, history.toolNr,
		history.left, history.top, history.width, history.height,
		history.c, history.o, history.settings,
		false);
};

// register tool in main
main.registerTool(new Shape());
