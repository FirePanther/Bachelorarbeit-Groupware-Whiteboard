/**
 * 
 */
function Text() {
	this.toolSettings = {
		text: {
			icon: '<span class="toolText">T</span>'
		}
	};
	
	this.selection = null;
	this.clicked = false;
	this.click = {};
	this.textfields = [];
};

/**
 * 
 */
Text.prototype.initEvents = function(toolName) {
	$("body").addClass("toolText");
	
	var self = this;
	main.board.$board.on("mousedown.tool", function(event) {
		if (!$(".toolTextfield.focus").length) {
			self.clicked = true;
			self.click.x1 = event.offsetX;
			self.click.y1 = event.offsetY;
			if (self.selection && self.selection.remove) self.selection.remove();
			self.selection = new Selection(event.pageX, event.pageY, 0, 0);
			// click-start coordinates
			var x = event.pageX, y = event.pageY;
			$(window).on("mousemove.textcreate", function(event) {
				var // click-move coordinates
					nx = event.pageX, ny = event.pageY,
					// lower coordinates
					lx = Math.min(x, nx), ly = Math.min(y, ny),
					// higher coordinates
					hx = Math.max(x, nx), hy = Math.max(y, ny),
					// size
					w = hx - lx, h = hy - ly;
				
				// + 6 = + padding
				self.selection.resize(lx, ly, w, h);
				
				// broadcast resizing
				main.server.broadcast(BroadcastType.TMP, {
					toolNr: HistoryType.TEXT,
					id: 0,
					pos: {
						x: lx - main.tools.toolbarWidth,
						y: ly,
						w: w,
						h: h
					}
				});
			})
		}
	}).on("mouseup.tool", function(event) {
		if (self.clicked) {
			$(window).off(".textcreate");
			main.server.broadcast(BroadcastType.TMP, {
				toolNr: HistoryType.TEXT,
				id: 0,
				remove: 1
			});
			self.selection.remove();
			self.click.x2 = event.offsetX;
			self.click.y2 = event.offsetY;
			self.createTextfield();
			self.clicked = false;
		}
	});
};

/**
 * 
 */
Text.prototype.deinitEvents = function() {
	$("body").removeClass("toolText");
};

/**
 * 
 */
Text.prototype.colorChanged = function(newColor) {
	var $textfield = $(".toolTextfield.focus");
	this.setColor($textfield);
	main.server.broadcast(BroadcastType.TMP, {
		toolNr: HistoryType.TEXT,
		id: $textfield.attr("id"),
		color: newColor
	});
};

/**
 * 
 */
Text.prototype.createTextfield = function() {
	var self = this,
		id = main.server.getTime(),
		$textfield = $('<div class="toolTextfield" id="' + id + '" />'),
		$input = $('<textarea spellcheck="false" />'),
		$parent = $('<div class="parent" />'),
		$label = $('<label />').text(" "),
		elements = { t: $textfield, i: $input, p: $parent, l: $label },
		
		left = Math.min(this.click.x1, this.click.x2),
		right = Math.max(this.click.x1, this.click.x2),
		top = Math.min(this.click.y1, this.click.y2),
		bottom = Math.max(this.click.y1, this.click.y2),
		width = 0,
		height = 0;
	
	// static sizes
	if (right - left > 5) width = right - left;
	if (bottom - top > 5) height = bottom - top;
	
	// input events
	$input.on("keydown keyup paste", function(event) {
		self.inputKey.apply(self, [ elements, event.type ]);
	});
	$input.on("blur", function(events) {
		setTimeout(function() {
			self.inputBlur.apply(self, [ elements, event ]);
		}, 50);
	});
	
	// textfield events
	$textfield.on("click", function() {
		self.inputFocus.apply(self, [ elements ]);
	}).on("mousedown", this.startDrag);
	
	// position and size
	$textfield.css({
		left: (left + main.tools.toolbarWidth) + "px",
		top: top + "px"
	});
	if (width) {
		$textfield.css("width", width + "px").attr("data-w", width);
		$label.css("width", width + "px");
	}
	if (height) {
		$textfield.css("height", height + "px").attr("data-h", height);
		$label.css("height", height + "px");
	}
	
	// DOM
	this.appendTextfieldDom($textfield, {
		textselector: true,
		$parent: $parent,
		$input: $input,
		$label: $label,
		body: true
	});
	
	main.server.broadcast(BroadcastType.TMP, {
		toolNr: HistoryType.TEXT,
		id: id,
		focus: true,
		pos: {
			x: left,
			y: top,
			w: width ? width : $label.outerWidth(),
			h: height ? height : $label.outerHeight()
		},
		color: main.tools.getColor()
	});
	
	this.setColor($textfield, main.tools.getColor());
	
	$input.css({
		width: $label.outerWidth() + 20,
		height: $label.outerHeight() + 5
	});
	this.inputFocus(elements);
	
	this.textfields.push($textfield);
};

/**
 * 
 */
Text.prototype.createTmpTextfield = function(id, val, focus, color, pos) {
	var $findTextfield = $("#" + id);
	if ($findTextfield.length) {
		var $textfield = $findTextfield,
			$label = $findTextfield.find("label"),
			curVal = $label.text(),
			create = false;
	} else {
		var $textfield = $('<div class="toolTextfield click-through" id="' + id + '" />'),
			$label = $('<label />').text(" "),
			curVal = "",
			create = true;
		
		// DOM
		this.appendTextfieldDom($textfield, {
			textselector: true,
			$label: $label,
			body: true
		});
	}
	
	if (focus !== undefined) {
		var textselector = $textfield.find(".textselector");
		if (focus) textselector.show();
		else textselector.hide();
	}
	
	if (val) {
		if (val.t) $label.text(val.t);
		else if (val.a) $label.text(curVal + val.a);
		else if (val.d) $label.text(curVal.substr(0, curVal.length - val.d));
	}
	
	if (color !== undefined) $label.css("color", main.tools.getColor(color));
	
	if (pos) {
		if (pos.x) $textfield.css("left", (main.tools.toolbarWidth + pos.x) + "px");
		if (pos.y) $textfield.css("top", pos.y + "px");
		if (pos.w) $label.css("width", pos.w + "px");
		if (pos.h) $label.css("height", pos.h + "px");
	}
	
	if (create) $("body").append($textfield);
};

/**
 * 
 */
Text.prototype.appendTextfieldDom = function($textfield, options) {
	if (options.textselector) {
		$textfield.append('<div class="textselector top"/>');
		$textfield.append('<div class="textselector right"/>');
		$textfield.append('<div class="textselector bottom"/>');
		$textfield.append('<div class="textselector left"/>');
	}
	if (options.$parent) {
		if (options.$input) options.$parent.append(options.$input);
		$textfield.append(options.$parent);
	}
	if (options.$label) $textfield.append(options.$label);
	if (options.body) $("body").append($textfield);
};

/**
 * 
 */
Text.prototype.startDrag = function(event) {
	var $self = $(this),
		x = event.offsetX,
		y = event.offsetY;
	
	$(window).on("mousemove.textdrag", function(event) {
		if ($self.is(".focus")) {
			// remove dragging events because of focus
			$(this).off(".textdrag");
		} else {
			$self.attr("data-dragging", 1);
			$self.css({
				left: event.pageX - x,
				top: event.pageY - y
			});
			main.server.broadcast(BroadcastType.TMP, {
				toolNr: HistoryType.TEXT,
				id: $self.attr("id"),
				pos: {
					x: event.pageX - x - main.tools.toolbarWidth,
					y: event.pageY - y
				}
			});
		}
	}).on("mouseup.textdrag", function() {
		if ($self.attr("data-dragging")) {
			$(this).off(".textdrag");
			setTimeout(function() {
				$self.removeAttr("data-dragging");
			}, 0);
		}
	});
};

/**
 * 
 */
Text.prototype.inputKey = function(elements, eventType) {
	if (eventType == "paste" || eventType == "keydown") {
		setTimeout(function(self) {
			self.inputKey.apply(self, [ elements, 0 ]);
		}, 0, this);
	} else {
		var $input = elements.i,
			$parent = elements.p,
			$textfield = elements.t,
			$label = elements.l,
			
			size = [],
			val = $input.val(),
			oldVal = $label.text(),
			dataW = parseInt($textfield.attr("data-w")),
			dataH = parseInt($textfield.attr("data-h"));
		
		if (val.substr(-1) == "\n" || val.substr(-1) == "\r" || !val.length) val += " ";
		$label.text(val);
		
		// exact values (float), important to prevent wraps on foreign clients
		var clientRect = $label[0].getBoundingClientRect();
		
		if (dataW) size[0] = dataW;
		else size[0] = clientRect["width"];
		if (dataH) size[1] = dataH;
		else size[1] = clientRect["height"];
		$parent.css({
			width: size[0],
			height: size[1]
		});
		$input.css({
			width: size[0] + (dataW ? 0 : 20),
			height: size[1] + 5
		});
		
		if (val != oldVal) {
			var broadcast = {
				toolNr: HistoryType.TEXT,
				id: $textfield.attr("id"),
				pos: {
					w: size[0],
					h: size[1]
				}
			};
			
			// only if value was changed, try to send difference
			if (oldVal != val) {
				if (val.substr(0, oldVal.length) == oldVal) {
					// text added:
					broadcast.val = { a: val.substr(oldVal.length) };
				} else if (oldVal.substr(0, val.length) == val) {
					// text deleted (num of chars):
					broadcast.val = { d: oldVal.length - val.length };
				} else {
					// just send the text
					broadcast.val = { t: val };
				}
			}
			main.server.broadcast(BroadcastType.TMP, broadcast);
		}
		
		this.selection.resize();
	}
};

/**
 * 
 */
Text.prototype.inputFocus = function(elements) {
	var $input = elements.i,
		$parent = elements.p,
		$textfield = elements.t;
	
	if (!$textfield.is(".focus") && !$textfield.attr("data-dragging")) {
		var colors = $(".toolbar .colors");
		colors.find(".color").on("mousedown.textblur", function() {
			$textfield.attr("data-prevent-blur", 1);
		});
		colors.find(".colorpicker").on("mousedown.textblur focus.textblur", function() {
			if (!$textfield.attr("data-auto-blur")) {
				$textfield.attr("data-auto-blur", 1);
				$(this).on("change blur", function() {
					$textfield.removeAttr("data-auto-blur");
					$input.focus();
				});
			}
		});
		if (this.selection && this.selection.remove) this.selection.remove();
		this.selection = new Selection($textfield);
		$textfield.addClass("focus");
		main.server.broadcast(BroadcastType.TMP, {
			toolNr: HistoryType.TEXT,
			id: $textfield.attr("id"),
			focus: true
		});
		$input.focus();
	}
};

/**
 * 
 */
Text.prototype.inputBlur = function(elements, events) {
	var $input = elements.i,
		$parent = elements.p,
		$textfield = elements.t;
	
	if ($textfield.attr("data-auto-blur")) return;
	if ($textfield.attr("data-prevent-blur")) {
		$textfield.removeAttr("data-prevent-blur");
		$input.focus();
	} else {
		$(".toolbar .colors").off(".textblur");

		this.selection.remove();
	
		$textfield.removeClass("focus");
		var broadcast = {
			toolNr: HistoryType.TEXT,
			id: $textfield.attr("id"),
			focus: false
		};
		if (!$input.attr("data-fixed")) {
			if (!$input.val().length) {
				$textfield.remove();
				delete broadcast.focus;
				broadcast.remove = true;
			} else $input.attr("data-fixed", 1);
		}
		main.server.broadcast(BroadcastType.TMP, broadcast);
	}
};

/**
 * 
 */
Text.prototype.setColor = function($textfield, colorId) {
	$textfield.find("label, textarea").css("color", main.tools.getColor(colorId));
};

/**
 * 
 */
Text.prototype.broadcast = function(userId, parameters) {
	var id = "textfield-" + userId + "_" + parameters.id;
	if (parameters.remove) {
		$("#" + id).remove();
	} else {
		this.createTmpTextfield(id,
			parameters.val, parameters.focus, parameters.color, parameters.pos);
	}
};

/**
 * 
 */
Text.prototype.redraw = function(history) {
	
};

// register tool in main
main.registerTool(new Text());
