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
	this.registeredTools = [];
	
	this.options = {
		color: null
	};
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
	var self = this, colorID;
	
	// source: http://flatuicolors.co/
	this.colorIDs = [
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
		self.selectColor($(this).val());
	});
	this.$colors.append(this.$colorpicker);
	
	for (var i in this.colorIDs) {
		this["$color" + i] = $("<div class=\"color\" data-color-id=\"" + i + "\" data-color=\"" + this.colorIDs[i].substr(1) + "\"><div style=\"background-color: " + this.colorIDs[i] + "\" /></div>");
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
Tools.prototype.registerTool = function(toolObject, toolName) {
	debug.log("registering");
	
	var toolID = this.registeredTools.length;
	
	this.registeredTools.push({
		toolObject: toolObject,
		toolName: toolName,
	});
	
	var settings = toolObject.toolSettings[toolName];
	
	// the tool icon in the toolbar
	this["$tool" + toolID] = $("<div class=\"tool " + toolName + "\" data-tool-id=\"" + toolID + "\">" + settings.icon + "</div>");
	this["$tool" + toolID].click((function(self, toolID) {
		return function() {
			self.selectTool(toolID);
		};
	})(this, toolID));
	this.$tools.append(this["$tool" + toolID]);
	
	if (!toolID) {
		// select first tool
		this.selectTool(0);
	}
};

/**
 * 
 */
Tools.prototype.getColor = function(colorID) {
	if (colorID === undefined) {
		if (this.options.color == -1) {
			return this.options.colorCode;
		} else {
			return this.colorIDs[this.options.color];
		}
	} else {
		return this.colorIDs[colorID];
	}
};

/**
 * 
 */
Tools.prototype.selectColor = function(color) {
	this.$colors.find(".selected").removeClass("selected");
	if (/^\#[a-fA-F0-9]{6}$/.test(color)) {
		var colorCode = color, colorID = -1;
		for (var i in this.colorIDs) {
			if (this.colorIDs[i].toLowerCase() == colorCode.toLowerCase()) {
				colorID = i;
				break;
			}
		}
		this.options.colorCode = colorCode;
	} else {
		var colorID = parseInt(color);
		if (colorID < 0) colorID = 0;
		else if (colorID >= this.colorIDs.length) colorID = this.colorIDs.length - 1;
	}
	if (colorID != -1) {
		this["$color" + colorID].addClass("selected");
		this.$colorpicker.val(this.colorIDs[colorID]);
	}
	
	this.options.color = parseInt(colorID);
};

/**
 * 
 */
Tools.prototype.selectTool = function(toolID) {
	this.$tools.find(".selected").removeClass("selected");
	this["$tool" + toolID].addClass("selected");
	
	this.options.tool = parseInt(toolID);
	
	console.log(this.registeredTools[toolID]);
	
	// deinit
	for (var i in main.board.events) {
		main.board.$board.off(main.board.events[i]);
	}
	this.registeredTools[toolID].toolObject.initEvents(this.registeredTools[toolID].toolName);
};
