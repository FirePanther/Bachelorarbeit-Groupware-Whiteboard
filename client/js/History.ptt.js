/**
 * Enum for history types.
 * @readonly
 * @enum {number}
 * @example
 * HistoryType.TESTTOOL; // 3
 * HistoryType.properties[3].toolName; // "TestTool"
 */
var HistoryType = {
	/**
	 * Contains the integer value of this enum as key with an object with details as value.
	 * The object contains the toolClassName and the toolName.
	 * The "index" key returns the last added index value and increases automatically by registering more tools.
	 * @type {Object}
	 */
	properties: {
		index: 0
	}
};

/**
 * The Drawing Handler. Allows to draw on a board.
 * @constructor
 * @param {jQuery} [$board] - The canvas jQuery element.
 */
function History(board) {
	this.history = {};
	this.tmp = {};
	this.events = [];
};

/**
 * Adds an entry into the history with the current timestamp.
 * @param {Object} entry - Array of values.
 * @param {integer} entry.type - The type of the object by the HistoryType enum.
 */
History.prototype.add = function(entry) {
	var entry2 = $.extend({}, entry);
	var id = main.server.getTime() + "_" + hash(entry);
	entry2.userId = 0;
	this.history[id] = entry2;
	this.callEvents();
	return {
		id: id,
		entry: entry
	};
};

/**
 *
 */
History.prototype.addById = function(id, userId, entry) {
	entry.userId = userId;
	this.history[id] = entry;
	this.callEvents();
};

/**
 *
 */
History.prototype.registerEvent = function(obj, func) {
	this.events.push([ obj, func ]);
};

/**
 *
 */
History.prototype.callEvents = function() {
	$.each(this.events, function() {
		this[0][this[1]].apply(this[0]);
	});
};

/**
 *
 */
History.prototype.last = function() {
	var keys = Object.keys(this.history);
	return keys.length ? this.history[keys[keys.length - 1]] : null;
};

/**
 * 
 */
History.prototype.registerTool = function(toolObject, toolName) {
	toolUCName = toolName.toUpperCase();
	HistoryType[toolUCName] = HistoryType[toolUCName] || ++HistoryType.properties.index;
	HistoryType.properties[HistoryType.properties.index] = {
		toolObject: toolObject,
		toolName: toolName
	};
	return HistoryType.properties.index;
};
