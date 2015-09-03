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
};

/**
 * Adds an entry into the history with the current timestamp.
 * @param {Object} entry - Array of values.
 * @param {integer} entry.type - The type of the object by the HistoryType enum.
 */
History.prototype.add = function(entry) {
	var entry2 = entry;
	var id = main.server.getTime() + "_" + hash(entry);
	entry2.own = true;
	this.history[id] = entry2;
	return {
		id: id,
		entry: entry
	};
};

/**
 *
 */
History.prototype.addById = function(id, own, entry) {
	entry.own = own;
	this.history[id] = entry;
};

/**
 *
 */
History.prototype.last = function() {
	var keys = Object.keys(this.history);
	return this.history[keys[keys.length - 1]];
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

