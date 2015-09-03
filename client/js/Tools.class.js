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
Tools.prototype.selectTool = function(toolNr) {
	this.$tools.find(".selected").removeClass("selected");
	this["$tool" + toolNr].addClass("selected");
	
	this.options.tool = parseInt(toolNr);
		
	main.board.$board.off(".tool");
	if (this.selectedTool && this.selectedTool.deinitEvents) {
		this.selectedTool.deinitEvents();
	}
	HistoryType.properties[toolNr].toolObject.initEvents(toolNr);
	this.selectedTool = HistoryType.properties[toolNr].toolObject;
};
