/**
 * 
 */
var ToolSettingType = {
	BUTTONS: 1
};

/**
 * Tools...
 * @constructor
 */
function Tools() {
	this.toolbarWidth = 80;
	this.selectedTool = null;
	
	this.color = null;
};

/**
 * 
 */
Tools.prototype.init = function() {
	this.$toolbar = $(".toolbar");
	this.$toolbar.width(this.toolbarWidth);
	
	this.$tools = $("<section class=\"tools\"/>");
	this.$toolbar.append(this.$tools);
	
	this.$settings = $("<section class=\"settings\"/>");
	this.$toolbar.append(this.$settings);
	
	this.initColors();
};

/**
 * 
 */
Tools.prototype.initColors = function() {
	var self = this, colorId;
	
	// source: http://flatuicolors.co/
	this.colorIds = [
		"#34495E", // dark
		"#7F8C8D", // gray
		"#9B59B6", // purple
		"#2980B9", // blue
		"#16A085", // green
		"#652623", // brown
		"#E74C3C", // red
		"#F1C40F" // yellow
	];
	
	this.$colors = $("<section class=\"colors\"/>");
	
	this.$colorpicker = $("<input type=\"color\" class=\"colorpicker\" maxlength=\"7\" />").on("change keyup", function() {
		if ($(this).val().length == 7) {
			self.selectColor($(this).val());
		}
	});
	this.$colors.append(this.$colorpicker);
	
	for (var i in this.colorIds) {
		this["$color" + i] = $("<div class=\"color\" data-color-id=\"" + i + "\" data-color=\"" + this.colorIds[i].substr(1) + "\"><div style=\"background-color: " + this.colorIds[i] + "\" /></div>");
		this["$color" + i].on("click", function() {
			self.selectColor($(this).attr("data-color-id"));
		});
		this.$colors.append(this["$color" + i]);
	}
	this.$toolbar.append(this.$colors);
	this.selectColor(0);
};

/**
 * 
 */
Tools.prototype.registerTool = function(toolNr) {
	debug.log("registering");
	
	var toolName = HistoryType.properties[toolNr].toolName,
		settings = HistoryType.properties[toolNr].toolObject.toolSettings[toolName];
	
	// the tool icon in the toolbar
	this["$tool" + toolNr] = $("<div class=\"tool " + toolName + "\" data-tool-id=\"" + toolNr + "\">" + settings.icon + "</div>");
	this["$tool" + toolNr].click((function(self, toolNr) {
		return function() {
			self.selectTool(toolNr);
		};
	})(this, toolNr));
	this.$tools.append(this["$tool" + toolNr]);
	
	if (toolNr == 1) {
		// select first tool
		this.selectTool(1);
	}
};

/**
 * 
 */
Tools.prototype.getColor = function(color) {
	if (color === undefined) return this.color;
	else if (/^\#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) return color.toUpperCase();
	else return this.colorIds[color];
};

/**
 * 
 */
Tools.prototype.selectColor = function(color) {
	var colorId = -1;
	
	color = ("" + color).toUpperCase();
	this.$colors.find(".selected").removeClass("selected");
	
	if (/^\#[A-F0-9]{6}$/.test(color)) {
		for (var i in this.colorIds) {
			if (this.colorIds[i] == color) {
				colorId = i;
				break;
			}
		}
		this.color = color;
	} else {
		console.log(colorId);
		colorId = parseInt(color);
		if (colorId < 0 || isNaN(colorId)) colorId = 0;
		else if (colorId >= this.colorIds.length) colorId = this.colorIds.length - 1;
		this.color = this.colorIds[colorId];
	}
	if (colorId != -1) {
		console.log(colorId);
		this["$color" + colorId].addClass("selected");
		this.$colorpicker.val(this.color);
	}
	
	// call events
	if (this.selectedTool && this.selectedTool.colorChanged) this.selectedTool.colorChanged(this.color);
};

/**
 * 
 */
Tools.prototype.selectTool = function(toolNr) {
	this.$tools.find(".selected").removeClass("selected");
	this["$tool" + toolNr].addClass("selected");
	
	this.tool = parseInt(toolNr);
		
	main.board.$board.off(".tool");
	if (this.selectedTool && this.selectedTool.deinitEvents) {
		this.selectedTool.deinitEvents();
	}
	HistoryType.properties[toolNr].toolObject.initEvents(toolNr);
	this.selectedTool = HistoryType.properties[toolNr].toolObject;
};
