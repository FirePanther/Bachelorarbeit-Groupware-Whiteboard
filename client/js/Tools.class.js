/**
 * Tools...
 * @constructor
 */
function Tools() {
	this.toolbarWidth = 80;
	this.tools = [];
	
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
	for (var i in this.colorIDs) {
		this["$color" + i] = $("<div class=\"color\" data-color-id=\"" + i + "\" data-color=\"" + this.colorIDs[i].substr(1) + "\" style=\"background-color: " + this.colorIDs[i] + "\" />");
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
Tools.prototype.registerTool = function(toolObject, toolName, toolFunction) {
	toolClassName = ucfirst(toolName);
	toolName = lcfirst(toolName);
	var toolID = this.tools.length;
	
	this.tools.push({
		toolName: toolName,
		toolFunction: toolFunction,
	});
	
	var settings = toolObject.toolSettings[toolFunction];
	this["$tool" + toolID] = $("<div class=\"tool " + toolName + " data-tool-id=\"" + toolID + "\"\">" + settings.icon + "</div>")
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
		return this.colorIDs[this.options.color];
	} else {
		return this.colorIDs[colorID];
	}
};

/**
 * 
 */
Tools.prototype.selectColor = function(colorID) {
	this.$colors.find(".selected").removeClass("selected");
	this["$color" + colorID].addClass("selected");
	
	this.options.color = parseInt(colorID);
};

/**
 * 
 */
Tools.prototype.selectTool = function(toolID) {
	this.$tools.find(".selected").removeClass("selected");
	this["$tool" + toolID].addClass("selected");
	
	this.options.tool = parseInt(toolID);
	
	main.registeredTools[this.tools[toolID].toolName].initEvents();
};
