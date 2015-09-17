/**
 *
 */
function Table() {
	this.toolSettings = {
		table: {
			icon: '<table class="toolTableIcon"><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></table>'
		}
	};
	
	this.$tables = $('<div class="click-through tableElements" />').css({
		position: "absolute",
		left: main.tools.toolbarWidth,
		width: BOARDMAXWIDTH,
		height: BOARDMAXHEIGHT,
		zIndex: 1
	});
	$("body").append(this.$tables);
	
	this.selection = null;
	this.selected = false;
	this.clicked = false;
	this.moved = false;
	this.click = {};
	this.tables = {};
};

/**
 * 
 */
Table.prototype.initEvents = function(toolNr) {
	$("body").addClass("toolTable");
	
	this.$tables.removeClass("click-through");
	var self = this;
	this.$tables.on("mousedown.tool", function(event) {
		self.clicked = true;
		self.moved = false;
		self.click.x = event.offsetX;
		self.click.y = event.offsetY;
		self.click.time = main.server.getTime();
		if (self.selected) {
			var $e = self.tables[self.selected].$element,
				offset = $e.position(),
				size = [ $e.width(), $e.height() ];
			if (self.click.x < offset.left || self.click.y < offset.top
				|| self.click.x > offset.left + size[0] || self.click.y > offset.top + size[1]) {
				self.selected = false; // clicked outside
				self.setSelection.apply(self);
			}
		}
		self.$tables.find(".toolTableElement").removeClass("click-through");
	}).on("mousemove.tool", function(event) {
		if (!self.clicked) return;
		self.$tables.find(".toolTableElement:not(.click-through)").addClass("click-through");
		if (self.selected) {
			// edit mode
			var tmpBoard = main.board.tmpBoard(self.click.time);
			tmpBoard.clear();
			if (self.moved) {
				tmpBoard.context.beginPath();
				tmpBoard.context.moveTo(self.click.x * MULTIPLIER, self.click.y * MULTIPLIER);
				if (Math.abs(event.offsetX - self.click.x) > Math.abs(event.offsetY - self.click.y)) {
					// horizontal
					tmpBoard.context.lineTo(event.offsetX * MULTIPLIER, self.click.y * MULTIPLIER);
				} else {
					// vertical
					tmpBoard.context.lineTo(self.click.x * MULTIPLIER, event.offsetY * MULTIPLIER);
				}
				tmpBoard.context.stroke();
			}
			self.moved = true;
		} else {
			// create/drag mode
			var left = Math.min(event.offsetX, self.click.x),
				top = Math.min(event.offsetY, self.click.y),
				right = Math.max(event.offsetX, self.click.x),
				bottom = Math.max(event.offsetY, self.click.y),
				width = right - left,
				height = bottom - top,
				table = self.draw.apply(self, [ self.click.time + "_" + main.server.userId, left, top, width, height, 1, 1, main.tools.getColor(), main.tools.opacity ]);
			main.server.broadcast(BroadcastType.TMP, {
				toolNr: HistoryType.TABLE,
				id: self.click.time + "_" + main.server.userId,
				left: left,
				top: top,
				width: width,
				height: height,
				c: main.tools.getColor(),
				o: main.tools.opacity
			});
		}
	}).on("mouseup.tool", function(event) {
		if (self.clicked) {
			self.$tables.find(".toolTableElement:not(.click-through)").addClass("click-through");
			if (self.selected && self.moved) {
					main.board.tmpBoard(self.click.time).clear();
					var $e = self.tables[self.selected].$element;
					if (Math.abs(event.offsetX - self.click.x) > Math.abs(event.offsetY - self.click.y)) {
						// horizontal line, add row
						self.tables[self.selected].rows++;
						var $row = $("<tr />");
						for (var i = 0; i < self.tables[self.selected].columns; i++) {
							$row.append($("<td />"));
						}
						$e.append($row);
					} else {
						// vertical line, add column
						self.tables[self.selected].columns++;
						$e.find("tr").append($("<td />"));
					}
					self.addHistory(self.selected);
			} else if (self.tables[self.click.time + "_" + main.server.userId]) {
				self.selected = self.click.time + "_" + main.server.userId;
				self.setSelection.apply(self);
				self.addHistory(self.selected);
			}
			self.clicked = false;
		}
	});
};

/**
 * 
 */
Table.prototype.deinitEvents = function() {
	$("body").removeClass("toolTable");
	this.$tables.addClass("click-through");
	this.selected = false;
	this.setSelection();
};

/**
 * 
 */
Table.prototype.colorChanged = function(color, opacity, event) {
	if (this.selected) {
		this.tables[this.selected].$element.css({
			borderColor: color,
			opacity: opacity
		});
		this.tables[this.selected].c = color;
		this.tables[this.selected].o = opacity;
		this.addHistory(this.selected);
	}
};

/**
 * 
 */
Table.prototype.addHistory = function(table) {
	var h = $.extend({
		toolNr: HistoryType.TABLE,
		id: table
	}, this.tables[table]);
	var history = main.history.add(h);
	main.server.broadcast(BroadcastType.SAVE, history);
};

/**
 * 
 */
Table.prototype.setSelection = function() {
	if (this.selected) {
		if (this.selection) {
			this.selection.resize();
		} else {
			this.selection = new Selection(this.tables[this.selected].$element);
		}
		this.createControldots(this.tables[this.selected].$element);
	} else if (this.selection) {
		this.selection.remove();
		this.selection = null;
		this.$tables.find(".controldot").remove();
	}
};

/**
 * 
 */
Table.prototype.createControldots = function($e) {
	this.$tables.find(".controldot").remove();
	var self = this,
		selected = this.selected,
		distance = 10,
		dotHalf = 6 / 2,
		offset = $e.position(),
		size = [ $e.outerWidth(), $e.outerHeight() ],
		mid = [ offset.left + size[0] / 2, offset.top + size[1] / 2 ],
		full = [ offset.left + size[0], offset.top + size[1] ],
		$dotRight = $('<div class="controldot" data-size="width" data-coord="X" />').css({ left: full[0] - dotHalf + distance, top: mid[1] - dotHalf, cursor: "ew-resize" }),
		$dotBottom = $('<div class="controldot" data-size="height" data-coord="Y" />').css({ left: mid[0] - dotHalf, top: full[1] - dotHalf + distance, cursor: "ns-resize" }),
		$dotDrag = $('<div class="controldot" />').css({ left: offset.left - distance - dotHalf, top: offset.top - distance - dotHalf, cursor: "move" });
	$dotRight.add($dotBottom).on("mousedown", function(event) {
		event.stopPropagation();
		var get = [ $(this).attr("data-size"), $(this).attr("data-coord") ],
			click = event[ "page" + get[1] ],
			size = $e[get[0]]();
		$(window).on("mousemove.controldot", function(event) {
			self.selected = false;
			self.setSelection.apply(self);
			var move = event[ "page" + get[1] ],
				newSize = size + move - click;
			if (newSize < 15) newSize = 15;
			$e[get[0]](newSize);
			self.tables[selected][get[0]] = newSize;
		}).on("mouseup.controldot", function(event) {
			$(window).off(".controldot");
			self.selected = selected;
			self.setSelection.apply(self);
			self.addHistory(selected);
		});
	});
	$dotDrag.on("mousedown", function(event) {
		event.stopPropagation();
		var get = [ $(this).attr("data-size"), $(this).attr("data-coord") ],
			clickX = event.pageX,
			clickY = event.pageY,
			pos = $e.position(),
			w = $e.outerWidth(),
			h = $e.outerHeight();
		$(window).on("mousemove.controldot", function(event) {
			self.selected = false;
			self.setSelection.apply(self);
			var moveX = event.pageX,
				moveY = event.pageY,
				l = pos.left + moveX - clickX,
				t = pos.top + moveY - clickY;
			if (l < 0) l = 0; else if (l + w > BOARDMAXWIDTH) l = BOARDMAXWIDTH - w;
			if (t < 0) t = 0; else if (t + h > BOARDMAXHEIGHT) t = BOARDMAXHEIGHT - h;
			$e.css("left", l);
			$e.css("top", t);
			self.tables[selected].left = l;
			self.tables[selected].top = t;
		}).on("mouseup.controldot", function(event) {
			$(window).off(".controldot");
			self.selected = selected;
			self.setSelection.apply(self);
			self.addHistory(selected);
		});
	});
	this.$tables.append($dotRight);
	this.$tables.append($dotBottom);
	this.$tables.append($dotDrag);
}

/**
 * 
 */
Table.prototype.draw = function(id, left, top, width, height, columns, rows, color, opacity) {
	if (this.tables[id]) {
		if (columns != this.tables[id].columns || rows != this.tables[id].rows) {
			this.tables[id].$element.remove();
			delete this.tables[id];
			this.draw.apply(this, arguments);
		} else {
			if (width < 15 || height < 15) {
				this.tables[id].$element.remove();
				delete this.tables[id];
			} else {
				this.tables[id].width = width;
				this.tables[id].height = height;
				this.tables[id].c = color;
				this.tables[id].o = opacity;
				this.tables[id].$element.css({
					left: left,
					top: top,
					width: width,
					height: height,
					borderColor: color,
					opacity: opacity
				});
			}
		}
	} else {
		if (width < 15 || height < 15) return false;
		var self = this,
			row = "",
			html = "",
			$table = $("<table />").attr({
				id: "table_" + id,
				class: "toolTableElement click-through"
			}).css({
				left: left,
				top: top,
				width: width,
				height: height,
				borderColor: color,
				opacity: opacity
			}).on("mouseup", function(event) {
				self.selected = id;
				self.setSelection.apply(self);
			});
		row += "<tr>";
		for (var i = 0; i < columns; i++) {
			row += "<td></td>";
		}
		row += "</tr>";
		for (var i = 0; i < rows; i++) {
			html += row;
		}
		$table.append(html);
		
		this.$tables.append($table);
		this.tables[id] = {
			$element: $table,
			rows: 1,
			columns: 1,
			left: left,
			top: top,
			width: width,
			height: height,
			c: color,
			o: opacity
		};
	}
};

/**
 * 
 */
Table.prototype.broadcast = function(userId, parameters) {
	this.draw(parameters.id,
		parameters.left, parameters.top, parameters.width, parameters.height,
		1, 1,
		parameters.c, parameters.o);
};

/**
 * 
 */
Table.prototype.removeTmp = function(history) {
	var id = history.id;
	if (this.tables[id]) {
		this.tables[id].$element.remove();
		delete this.tables[id];
	}
};

/**
 * 
 */
Table.prototype.prepareRedraw = function() {
	this.tables = {};
	$(".toolTableElement").remove();
	this.selected = false;
	this.setSelection();

};

/**
 * 
 */
Table.prototype.redraw = function(parameters, board) {
	if (board && board.temporary) return;
	this.draw(parameters.id,
		parameters.left, parameters.top, parameters.width, parameters.height,
		parameters.columns, parameters.rows,
		parameters.c, parameters.o);
};

// register tool in main
main.registerTool(new Table());
