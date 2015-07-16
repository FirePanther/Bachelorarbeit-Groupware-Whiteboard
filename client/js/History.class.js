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
	this.history = [];
};

/**
 * Adds an entry into the history with the current timestamp.
 * @param {Object} entry - Array of values.
 * @param {integer} entry.type - The type of the object by the HistoryType enum.
 */
History.prototype.add = function(entry) {
	// todo: get difference between server, exact time of SERVER, NOT CLIENT
	var id = new Date().getTime();
	while (this.history[id] !== undefined) {
		id++;
	}
	entry.own = true;
	this.history[id] = entry;
};

/**
 * 
 * 
 */
History.prototype.registerTool = function(toolName) {
	toolClassName = ucfirst(toolName);
	toolName = lcfirst(toolName);
	toolUCName = toolName.toUpperCase();
	HistoryType[toolUCName] = HistoryType[toolUCName] || ++HistoryType.properties.index;
	HistoryType.properties[HistoryType.properties.index] = {
		toolClassName: toolClassName,
		toolName: toolName
	};
};
