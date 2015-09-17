/**
 * The Text prototype is a widget to create text elements.
 */
function Text() {
	this.settings = {
		fontSize: 18,
		fontFamily: "verdana"
	};
	
	this.toolSettings = {
		text: {
			icon: '<span class="toolText">T</span>',
			settings: {
				fontSize: {
					type: ToolSettingType.RANGE,
					label: "Font size",
					value: this.settings.fontSize,
					min: 8,
					max: 40,
					step: 2
				},
				fontFamily: {
					type: ToolSettingType.SMALLBUTTONS,
					label: "Font family",
					buttons: {
						times: {
							icon: '<span style="font-family: times; color: white">T</span>',
							value: "times"
						},
						verdana: {
							icon: '<span style="font-family: verdana; color: white">T</span>',
							value: "verdana"
						},
						monospace: {
							icon: '<span style="font-family: monospace; color: white">T</span>',
							value: "monospace"
						}
					}
				}
			}
		}
	};
	
	this.$texts = $('<div class="click-through" />').css({
		position: "absolute",
		left: main.tools.toolbarWidth,
		width: BOARDMAXWIDTH,
		height: BOARDMAXHEIGHT,
		zIndex: 20
	});
	$("body").append(this.$texts);
	
	this.selection = null;
	this.clicked = false;
	this.click = {};
	this.textfields = {};
	
	// textfield safe (whole board alternative), else it will be removed e.g. by too many undos
	this.textfieldsSafe = {};
};

/**
 * This method will be called automatically.
 * @see {@link Tools.selectTool}
 */
Text.prototype.initEvents = function(toolName) {
	$("body").addClass("toolText");
	
	var self = this;
	this.$texts.removeClass("click-through");
	this.$texts.on("mousedown.tool", function(event) {
		console.log($(".toolTextfield.focus").length);
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
				
				self.selection.resize(lx, ly, w, h);
				
				// broadcast resizing
				main.server.broadcast(BroadcastType.TMP, {
					toolNr: HistoryType.TEXT,
					id: "text_" + main.server.userId + "_0",
					pos: {
						left: lx - main.tools.toolbarWidth,
						top: ly
					},
					width: w,
					height: h,
					f: true
				});
			});
		}
	}).on("mouseup.tool", function(event) {
		if (self.clicked) {
			$(window).off(".textcreate");
			main.server.broadcast(BroadcastType.TMP, {
				toolNr: HistoryType.TEXT,
				id: "text_" + main.server.userId + "_0",
				remove: true
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
	this.$texts.addClass("click-through");
};

/**
 * 
 */
Text.prototype.colorChanged = function(color, opacity) {
	var $textfield = $(".toolTextfield.focus");
	if ($textfield.length) {
		this.setColor($textfield, color, opacity, true);
		self.addHistory($textfield.attr("id"), {
			c: color,
			o: opacity
		});
	}
};

/**
 * 
 */
Text.prototype.settingsChanged = function() {
	var $textfield = $(".toolTextfield.focus");
	if ($textfield.length) {
		$textfield.find("textarea, label").css({
			fontSize: this.settings.fontSize + "px",
			fontFamily: this.settings.fontFamily
		});
		this.selection.resize();
		this.setInputSize({ t: $textfield }, 0);
		this.addHistory($textfield.attr("id"), {
			fsize: this.settings.fontSize,
			family: this.settings.fontFamily
		});
	}
};

/**
 * 
 */
Text.prototype.createTextfield = function(userId, id, focus, val, left, top, width, height, color, opacity, fsize, family, redraw) {
	userId = userId || main.server.userId;
	id = id || "text_" + userId + "_" + main.server.getTime();
	val = val || "";
	left = left === undefined ? Math.min(this.click.x1, this.click.x2) : left;
	top = top === undefined ? Math.min(this.click.y1, this.click.y2) : top;
	width = width === undefined ? Math.max(this.click.x1, this.click.x2) - left : width;
	height = height === undefined ? Math.max(this.click.y1, this.click.y2) - top : height;
	color = main.tools.getColor(color);
	opacity = opacity || main.tools.opacity,
	fsize = fsize || this.settings.fontSize,
	family = family || this.settings.fontFamily;
	if (isNaN(opacity)) opacity = 1;
	
	var self = this,
		$textfield = $('<div class="toolTextfield' + (focus ? " textFocus" : "") + '" id="' + id + '" data-user-id="' + userId + '" />'),
		$input = $('<textarea tabindex="-1" spellcheck="false"' + (val.length ? ' data-fixed="1"' : "") + ' />'),
		$parent = $('<div class="parent" />'),
		$label = $('<label />').text(val == "" ? " " : val),
		$texts = $label.add($input), // label and textarea to set css with a single command
		elements = { t: $textfield, i: $input, p: $parent, l: $label, texts: $texts };
	
	$texts.css({
		fontSize: fsize + "px",
		fontFamily: family
	});
	
	if (val) $input.val(val);
	
	// input events
	$input.on("keydown keyup paste", function(event) {
		self.inputKey.apply(self, [ elements, event.type ]);
	}).on("blur", function(event) {
		setTimeout(function() {
			self.inputBlur.apply(self, [ elements, event ]);
		}, 50);
	});
	
	// textfield events
	$textfield.on("click", function(event) {
		self.inputFocus.apply(self, [ elements ]);
	}).on("mousedown", function(event) {
		self.startDrag.apply(self, [ elements, event ]);
		event.stopPropagation();
	});
	
	// position and size
	$textfield.css({
		left: left + "px",
		top: top + "px"
	});
	// static size
	if (width > 5) {
		$textfield.css({
			width: width + "px"
		}).attr("data-w", width);
		$label.css("width", width + "px");
	} else width = 0;
	if (height > 5) {
		$textfield.css("height", height + "px").attr("data-h", height);
		$label.css("height", height + "px");
	} else height = 0;
	
	// DOM
	this.appendTextfieldDom($textfield, {
		textselector: true,
		$parent: $parent,
		$input: $input,
		$label: $label,
		add: true
	});
	
	this.setColor($textfield, color, opacity);
	var size = this.setInputSize(elements);
	
	if (!redraw) {
		main.server.broadcast(BroadcastType.TMP, {
			toolNr: HistoryType.TEXT,
			id: id,
			pos: {
				left: left,
				top: top
			},
			width: width,
			height: height,
			c: color,
			o: opacity,
			fsize: fsize,
			family: family,
			f: true
		});
		this.inputFocus(elements);
	}
	
	this.textfields[id] = {
		pos: {
			left: left,
			top: top
		},
		width: width,
		height: height,
		val: val,
		c: color,
		o: opacity,
		fsize: fsize,
		family: family
	};
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
	if (options.add) this.$texts.append($textfield);
};

/**
 * 
 */
Text.prototype.startDrag = function(elements, event) {
	var self = this,
		$textfield = elements.t,
		$input = elements.i,
		x = event.offsetX,
		y = event.offsetY;
	
	$(window).on("mousemove.textdrag", function(event) {
		if ($textfield.is(".focus")) {
			// remove dragging events because of focus
			$(this).off(".textdrag");
		} else {
			$input.hide();
			$textfield.attr("data-dragging", 1);
			
			var left = event.pageX - main.tools.toolbarWidth - x,
				top = event.pageY - y,
				width = $textfield.outerWidth(),
				height = $textfield.outerHeight();
			if (left < 0) left = 0;
			else if (left > BOARDMAXWIDTH - width) left = BOARDMAXWIDTH - width;
			if (top < 0) top = 0;
			else if (top > BOARDMAXHEIGHT - height) top = BOARDMAXHEIGHT - height;
			
			$textfield.css({
				left: left,
				top: top
			});
			main.server.broadcast(BroadcastType.TMP, {
				toolNr: HistoryType.TEXT,
				id: $textfield.attr("id"),
				pos: {
					left: left,
					top: top
				},
				f: true
			});
		}
	}).on("mouseup.textdrag", function() {
		if ($textfield.attr("data-dragging")) {
			$input.show();
			$(this).off(".textdrag");
			setTimeout(function() {
				$textfield.removeAttr("data-dragging");
			}, 0);
			// history: changed value
			var pos = $textfield.position();
			self.addHistory($textfield.attr("id"), {
				pos: {
					left: pos.left,
					top: pos.top
				}
			});
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
			
			val = $input.val(),
			oldVal = $label.text();
		
		if (val.substr(-1) == "\n" || val.substr(-1) == "\r" || !val.length) val += " ";
		$label.text(val);
		
		var size = this.setInputSize({
			t: $textfield,
			p: $parent,
			l: $label,
			i: $input
		});
		
		if (val != oldVal) {
			var pos = $textfield.position(),
				broadcast = {
					toolNr: HistoryType.TEXT,
					id: $textfield.attr("id"),
					val: val,
					pos: {
						left: pos.left,
						top: pos.top
					},
					a: 1,
					width: $textfield.attr("data-w") - 0,
					height: $textfield.attr("data-h") - 0
				};
			main.server.broadcast(BroadcastType.TMP, broadcast);
		}
		
		this.selection.resize();
	}
};

/**
 * 
 */
Text.prototype.setInputSize = function(elements, addW) {
	addW = addW === undefined ? 20 : addW;
	var $textfield = elements.t,
		$parent = elements.p || $textfield.find(".parent"),
		$input = elements.i || $parent.find("textarea"),
		$label = elements.l || $textfield.find("label"),
		
		dataW = parseInt($textfield.attr("data-w")),
		dataH = parseInt($textfield.attr("data-h")),
		size = [];
	
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
		width: size[0] + (dataW ? 0 : addW),
		height: size[1] + 5
	});
	
	return size;
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
		colors.find(".color, .opacity").add($(".toolbar .settings")).on("mousedown.textblur", function() {
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
			f: true
		});
		
		//this.setInputSize(elements);
		$input.focus();
	}
};

/**
 * 
 */
Text.prototype.inputBlur = function(elements, events) {
	var $input = elements.i,
		$parent = elements.p,
		$textfield = elements.t,
		id = $textfield.attr("id");
	
	if ($textfield.attr("data-auto-blur")) return;
	if ($textfield.attr("data-prevent-blur")) {
		$textfield.removeAttr("data-prevent-blur");
		$input.focus();
	} else {
		var broadcast = {
			toolNr: HistoryType.TEXT,
			id: $textfield.attr("id"),
			f: false
		};
		
		$(".toolbar .colors").off(".textblur");

		this.selection.remove();
	
		$textfield.removeClass("focus");
		
		this.setInputSize(elements, 0);
		
		if (!$input.attr("data-fixed")) {
			if (!$input.val().length) {
				broadcast.remove = true;
				delete broadcast.focus;
				$textfield.remove();
			} else {
				$input.attr("data-fixed", 1);
				
				// history: create
				var pos = $textfield.position();
				this.addHistory($textfield.attr("id"), {
					pos: {
						left: pos.left,
						top: pos.top
					},
					width: $textfield.attr("data-w"),
					height: $textfield.attr("data-h"),
					val: $input.val(),
					c: $textfield.attr("data-color"),
					o: parseInt($textfield.attr("data-opacity")) / 100
				});
			}
		} else if (this.textfields[id].val != $input.val()) {
			// history: changed value
			this.addHistory($textfield.attr("id"), { val: $input.val() });
		}
		
		this.textfields[id].val = $input.val();
		
		main.server.broadcast(BroadcastType.TMP, broadcast);
	}
};

/**
 * 
 */
Text.prototype.setParameters = function(elements, parameters) {
	var $textfield = elements.t,
		$parent = elements.p || $textfield.find(".parent"),
		$input = elements.i || $parent.find("textarea"),
		$label = elements.l || $textfield.find("label"),
		$texts = elements.texts || $label.add($input);
	
	if (parameters.val) {
		var val = parameters.val;
		if (val.substr(-1) == "\n" || val.substr(-1) == "\r" || !val.length) val += " ";
		$label.text(val);
		$input.val(parameters.val);
	}
	
	if (parameters.focus !== undefined) {
		if (parameters.focus) $textfield.addClass("textFocus");
		else $textfield.removeClass("textFocus");
	}
	
	if (parameters.pos) {
		$textfield.css({
			left: (parameters.pos.left) + "px",
			top: parameters.pos.top + "px"
		});
	}
	if (parameters.width) $textfield.attr("data-w", parameters.width).css("width", parameters.width);
	if (parameters.height) $textfield.attr("data-h", parameters.height).css("height", parameters.height);
	
	if (parameters.fsize) $texts.css("font-size", parameters.fsize + "px");
	if (parameters.family) $texts.css("font-family", parameters.family);
	
	this.setInputSize({
		t: $textfield,
		p: $parent,
		l: $label,
		i: $input
	});
	
	if (parameters.c) this.setColor($textfield, parameters.c, parameters.o);
};

/**
 * 
 */
Text.prototype.setColor = function($textfield, color, opacity, history) {
	color = main.tools.getColor(color);
	$textfield.find("label, textarea").css({
		color: color,
		opacity: opacity
	});
	$textfield.attr("data-color", color);
	$textfield.attr("data-opacity", opacity * 100);
	if (history) this.addHistory($textfield.attr("id"), { c: color, o: opacity });
};

/**
 * 
 */
Text.prototype.addHistory = function(id, set) {
	$.extend(this.textfields[id], set);
	var h = $.extend({
		toolNr: HistoryType.TEXT,
		id: id
	}, this.textfields[id]);
	var history = main.history.add(h);
	main.server.broadcast(BroadcastType.SAVE, history);
};

/**
 * 
 */
Text.prototype.drawText = function(parameters) {
	var $textfield = $("#" + parameters.id);
	if (parameters.remove) {
		// remove
		if ($textfield.length) $textfield.remove();
	} else if ($textfield.length) {
		// change
		this.setParameters({
			t: $textfield
		}, parameters);
	} else {
		// create
		try {
			this.createTextfield(parameters.userId, parameters.id,
				parameters.f,
				parameters.val,
				parameters.pos.left, parameters.pos.top,
				parameters.width, parameters.height,
				parameters.c, parameters.o,
				parameters.fsize, parameters.family,
				true);
		} catch(e) {
			console.log("Error: createTextfield (parameters)");
			console.log(e);
			console.log(parameters);
		}
	}
};

/**
 * 
 */
Text.prototype.broadcast = function(userId, parameters) {
	this.drawText(parameters);
};

/**
 * 
 */
Text.prototype.removeTmp = function(history) {
	this.drawText($({}, history, {
		userId: history.userId,
		remove: true
	}));
};

/**
 * 
 */
Text.prototype.prepareRedraw = function() {
	var self = this;
	this.textfields = {};
	$(".toolTextfield").remove();
	
	$.each(this.textfieldsSafe, function() {
		self.redraw(this);
	});
};

/**
 * 
 */
Text.prototype.redraw = function(parameters, board) {
	if (board && board.temporary) {
		this.textfieldsSafe[parameters.id] = $.extend({}, parameters);
		return;
	}
	this.drawText(parameters);
};

// register tool in main
main.registerTool(new Text());
