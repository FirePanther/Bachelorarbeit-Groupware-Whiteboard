/**
 * 
 */
function Text() {
	this.toolSettings = {
		text: {
			icon: '<span class="toolText">T</span>'
		}
	};
	
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
	var $textfield = $('<div class="toolTextfield focus" />'),
		$input = $('<textarea />'),
		$parent = $('<div class="parent" />'),
		$label = $('<label />'),
		
		left = Math.min(this.click.x1, this.click.x2),
		right = Math.max(this.click.x1, this.click.x2),
		top = Math.min(this.click.y1, this.click.y2),
		bottom = Math.max(this.click.y1, this.click.y2),
		width = 0,
		height = 0;
	// static sizes
	if (right - left > 5) width = right - left;
	if (bottom - top > 5) height = bottom - top;
	
	$input.on("keydown keyup", this.inputKey);
	$textfield.css({
		left: (left + main.tools.toolbarWidth) + "px",
		top: top + "px"
	});
	if (width) $textfield.css("width", width + "px");
	if (height) $textfield.css("height", height + "px");
	
	$parent.append($input);
	$textfield.append($parent);
	$label.text(" ");
	$textfield.append($label);
	
	$textfield.on("click", function() {
		$(this).addClass("focus").find("textarea").focus();
	});
	
	$("body").append($textfield);
	
	$input.on("blur", this.inputBlur);
	
	$input.focus();
	
	this.textfields.push($textfield);
};

/**
 * 
 */
Text.prototype.inputKey = function(event) {
	console.log(event);
	var $input = $(event.target),
		$parent = $input.parent(),
		$textfield = $parent.parent(),
		$label = $textfield.find("label"),
		val = $input.val(),
		labelSize = [ $label.outerWidth(), $label.outerHeight() ];
	
	if (val.substr(-1) == "\n") {
		val += " ";
	}
	
	$parent.css({
		width: labelSize[0] + 20,
		height: labelSize[1] + 5
	});
	$input.css({
		width: labelSize[0] + (event.type == "keydown" ? 100 : 20),
		height: labelSize[1] + (event.type == "keydown" ? 100 : 5)
	});
	if (val.length) $label.text(val);
	else $label.text(" ");
};

/**
 * 
 */
Text.prototype.inputBlur = function(event) {
	var $input = $(event.target),
		$parent = $input.parent(),
		$textfield = $parent.parent();
	$textfield.removeClass("focus");
	if ($input.val().length == 0 && !$input.attr("fixed")) {
		$textfield.remove();
	} else if ($input.val().length > 0) {
		$input.attr("fixed", 1);
	}
};

/**
 * 
 */
Text.prototype.broadcast = function(userId, parameters) {
	
};

/**
 * 
 */
Text.prototype.redraw = function(tmpHistory, toolName) {
	
};

// register tool in main
main.registerTool(new Text());
