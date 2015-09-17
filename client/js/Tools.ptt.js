/**
 * 
 */
var ToolSettingType = {
	BUTTONS: 1,
	SMALLBUTTONS: 2,
	RANGE: 3,
	CHECKBOX: 4
};

/**
 * Tools...
 * @constructor
 */
function Tools() {
	this.toolbarWidth = 80;
	this.selectedTool = null;
	
	this.color = null;
	this.opacity = 1;
};

/**
 * 
 */
Tools.prototype.init = function() {
	this.$toolbar = $(".toolbar");
	this.$toolbar.width(this.toolbarWidth);
	this.$toolbarContent = $('<div class="toolbarContent" />');
	
	this.$tools = $('<section class="tools" />');
	this.$toolbarContent.append(this.$tools);
	
	this.$settings = $('<section class="settings" />');
	this.$toolbarContent.append(this.$settings);
	
	this.$toolbarContent.append(this.initColors())
	this.$toolbar.append(this.$toolbarContent);
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
	
	this.$colors = $('<section class="colors" />');
	
	this.$colorpicker = $('<input type="color" class="colorpicker" maxlength="7" />').on("change keyup", function() {
		if ($(this).val().length == 7) {
			self.selectColor($(this).val());
		}
	});
	this.$colors.append(this.$colorpicker);
	
	for (var i in this.colorIds) {
		this["$color" + i] = $('<div class="color" data-color-id="' + i + '" data-color="' + this.colorIds[i].substr(1) + '">' +
			'<div style="background-color: ' + this.colorIds[i] + '" />' +
		'</div>');
		this["$color" + i].on("click", function() {
			self.selectColor($(this).attr("data-color-id"));
		});
		this.$colors.append(this["$color" + i]);
	}
	this.selectColor(0);
	
	var label = $('<label />').css({
		marginTop: 5,
	}).text("Opacity");
	this.$opacity = $('<input type="range" class="opacity" value="100" min="5" max="100" step="5" />')
		.on("change input", function() {
			self.opacity = parseInt($(this).val()) / 100;
			self.callColorEvents.apply(self);
		});
	this.$colors.append($('<div class="clear" />'));
	this.$colors.append(label);
	this.$colors.append(this.$opacity);
	
	return this.$colors;
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
		colorId = parseInt(color);
		if (colorId < 0 || isNaN(colorId)) colorId = 0;
		else if (colorId >= this.colorIds.length) colorId = this.colorIds.length - 1;
		this.color = this.colorIds[colorId];
	}
	if (colorId != -1) {
		this["$color" + colorId].addClass("selected");
		this.$colorpicker.val(this.color);
	}
	
	this.callColorEvents();
};

/**
 * 
 */
Tools.prototype.callColorEvents = function() {
	// call events
	if (this.selectedTool && this.selectedTool.colorChanged) this.selectedTool.colorChanged(this.color, this.opacity);
};

/**
 * 
 */
Tools.prototype.callSettingsEvents = function() {
	// call events
	if (this.selectedTool && this.selectedTool.settingsChanged) this.selectedTool.settingsChanged();
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
		this.selectedTool.deinitEvents.apply(this.selectedTool);
	}
	
	var tool = HistoryType.properties[toolNr],
		settings = tool.toolObject.toolSettings[tool.toolName].settings;

	if (settings) this.parseSettings(tool.toolObject, settings);
	else this.$settings.html("");
	
	tool.toolObject.initEvents(toolNr);
	this.selectedTool = tool.toolObject;
};

/**
 * 
 */
Tools.prototype.parseSettings = function(toolObject, settings) {
	this.$settings.html("");
	
	var self = this,
		settingValues = toolObject.settings;
	$.each(settings, function(name) {
		var setting = this;
		
		// label
		if (this.label && this.type != ToolSettingType.CHECKBOX) {
			self.$settings.append($('<label />').text(this.label));
		}
		
		// type
		switch (this.type) {
			case ToolSettingType.BUTTONS:
			case ToolSettingType.SMALLBUTTONS:
				$.each(this.buttons, function() {
					var button = this,
						$button = $('<div class="setting' + (this.value == settingValues[name] ? ' selected' : '') + '" data-type="' + setting.type + '" />')
							.click(function() {
								self.$settings.find(".selected").removeClass("selected");
								$(this).addClass("selected");
								settingValues[name] = button.value;
								self.callSettingsEvents();
							}).html(this.icon);
					
					self.$settings.append($button);
				});
				break;
			case ToolSettingType.RANGE:
				var value = settingValues[name],
					min = this.min || 0,
					max = this.max || 1,
					step = this.step || .1,
					$range = $('<input type="range" value="' + value + '" min="' + min + '" max="' + max + '" step="' + step + '" />')
						.on("input change", function() {
							settingValues[name] = parseFloat($(this).val());
							self.callSettingsEvents();
						});
				self.$settings.append($range);
				break;
			case ToolSettingType.CHECKBOX:
				var value = settingValues[name],
					min = this.min || 0,
					max = this.max || 1,
					step = this.step || .1,
					$label = $('<label />'),
					$checkbox = $('<input type="checkbox" min="' + min + '" max="' + max + '" step="' + step + '" />')
						.change(function() {
							settingValues[name] = this.checked;
							self.callSettingsEvents();
						}).prop("checked", value);

				$label.append($checkbox);
				$label.append($('<span />').css("width", self.toolbarWidth - 30).text(this.label));
				self.$settings.append($label);
				break;
		}
	});
};
