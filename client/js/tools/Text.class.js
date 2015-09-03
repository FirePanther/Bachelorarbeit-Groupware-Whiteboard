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
			this.clicked = true;
			self.click.x1 = event.offsetX;
			self.click.y1 = event.offsetY;
		}
	}).on("mouseup.tool", function(event) {
		if (this.clicked) {
			self.click.x2 = event.offsetX;
			self.click.y2 = event.offsetY;
			self.createTextfield();
			this.clicked = false;
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
Text.prototype.createTextfield = function() {
	var self = this,
		id = main.server.getTime(),
		$textfield = $('<div class="toolTextfield focus" id="' + id + '" />'),
		$input = $('<textarea />'),
		$parent = $('<div class="parent" />'),
		$label = $('<label />'),
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
		self.inputBlur.apply(self, [ elements, event ]);
	});
	
	// textfield events
	$textfield.on("click", function() {
		if (!$(this).is(".focus") && !$(this).attr("data-dragging")) {
			var $input = $(this).find("textarea");
			self.selection = new Selection($(this));
			$(this).addClass("focus");
			main.server.broadcast("board tmp", {
				toolNr: HistoryType.TEXT,
				id: $textfield.attr("id"),
				focus: true
			});
			$input.focus();
		}
	}).on("mousedown", this.startDrag);
	
	// position and size
	$textfield.css({
		left: (left + main.tools.toolbarWidth) + "px",
		top: top + "px"
	});
	if (width) $textfield.css("width", width + "px").attr("data-w", width);
	if (height) $textfield.css("height", height + "px").attr("data-h", height);
	
	// DOM
	$textfield.append('<div class="textselector top"/>');
	$textfield.append('<div class="textselector right"/>');
	$textfield.append('<div class="textselector bottom"/>');
	$textfield.append('<div class="textselector left"/>');
	$parent.append($input);
	$textfield.append($parent);
	$label.text(" ");
	$textfield.append($label);
	$("body").append($textfield);
	
	main.server.broadcast("board tmp", {
		toolNr: HistoryType.TEXT,
		id: id,
		focus: true,
		pos: {
			x: left,
			y: top
		}
	});
	
	this.selection = new Selection($textfield);
	$input.focus();
	
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
		
		$textfield.append('<div class="textselector dontHide top"/>');
		$textfield.append('<div class="textselector dontHide right"/>');
		$textfield.append('<div class="textselector dontHide bottom"/>');
		$textfield.append('<div class="textselector dontHide left"/>');
		$textfield.append($label);
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
	
	if (pos) {
		if (pos.x) $textfield.css("left", (main.tools.toolbarWidth + pos.x) + "px");
		if (pos.y) $textfield.css("top", pos.y + "px");
		if (pos.w) $textfield.css("width", pos.w + "px");
		if (pos.h) $textfield.css("height", pos.h + "px");
	}
	
	if (create) $("body").append($textfield);
};

/**
 * 
 */
Text.prototype.startDrag = function(event) {
	var $self = $(this),
		x = event.offsetX,
		y = event.offsetY;
	$(window).on("mousemove.drag", function(event) {
		$self.attr("data-dragging", 1);
		$self.css({
			left: event.pageX - x,
			top: event.pageY - y
		});
		main.server.broadcast("board tmp", {
			toolNr: HistoryType.TEXT,
			id: $self.attr("id"),
			pos: {
				x: event.pageX - x - main.tools.toolbarWidth,
				y: event.pageY - y
			}
		});
	}).on("mouseup.drag", function() {
		$(this).off(".drag");
		setTimeout(function() {
			$self.removeAttr("data-dragging");
		}, 0);
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
		
		var labelSize = [ $label.outerWidth(), $label.outerHeight() ];
		
		$parent.css({
			width: labelSize[0],
			height: labelSize[1]
		});
		$input.css({
			width: labelSize[0] + 20,
			height: labelSize[1] + 5
		});
		
		if (val != oldVal) {
			var broadcast = {
				toolNr: HistoryType.TEXT,
				id: $textfield.attr("id"),
				val: {},
				pos: {
					w: labelSize[0],
					h: labelSize[1]
				},
				color: main.tools.options.color
			};
			
			// only if value was changed, try to send difference
			if (oldVal != val) {
				if (val.substr(0, oldVal.length) == oldVal) {
					// text added:
					broadcast.val.a = val.substr(oldVal.length);
				} else if (oldVal.substr(0, val.length) == val) {
					// text deleted (num of chars):
					broadcast.val.d = oldVal.length - val.length;
				} else {
					// just send the text
					broadcast.val.t = val;
				}
			}
			main.server.broadcast("board tmp", broadcast);
		}
		
		this.selection.resize();
	}
};

/**
 * 
 */
Text.prototype.inputBlur = function(elements, events) {
	var $input = elements.i,
		$parent = elements.p,
		$textfield = elements.t;
	
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
	main.server.broadcast("board tmp", broadcast);
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
