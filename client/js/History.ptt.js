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
 * The History prototype contains the changes history.
 * @constructor
 */
function History() {
	this.history = {};
	this.tmp = {};
	this.events = [];
};

/**
 * Adds an entry into the history with the current timestamp. Calls {@link History#callEvents}.
 * @param {Object} entry - Array of values.
 * @param {integer} entry.type - The type of the object by the HistoryType enum.
 * @returns {Object} The id and the extended entry.
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
 * Adds the entry of the user into the history. Calls {@link History#callEvents}.
 * @param {string} id - ID of the history, maybe received by {@link History#add}.
 * @param {string} userId - From whom?
 * @param {Object} entry - Array of values.
 * @param {integer} entry.type - The type of the object by the HistoryType enum.
 */
History.prototype.addById = function(id, userId, entry) {
	entry.userId = userId;
	this.history[id] = entry;
	this.callEvents();
};

/**
 * Adds an object and a function name into the events array.
 * @param {Object} obj - The object.
 * @param {string} func - The name of the function.
 */
History.prototype.registerEvent = function(obj, func) {
	this.events.push([ obj, func ]);
};

/**
 * Calls the functions of all events in the events array.
 */
History.prototype.callEvents = function() {
	$.each(this.events, function() {
		this[0][this[1]].apply(this[0]);
	});
};

/**
 * Returns the last history item if it exist, else null.
 * @returns {Object} last item or null.
 */
History.prototype.last = function() {
	var keys = Object.keys(this.history);
	return keys.length ? this.history[keys[keys.length - 1]] : null;
};

/**
 * Registers the tool into the {@link HistoryType}.
 * @param {Object} toolObject
 * @param {string} toolName
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
