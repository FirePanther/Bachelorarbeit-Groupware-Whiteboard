/**
 * Enum for history types.
 * @readonly
 * @enum {number}
 * @example
 * HistoryType.TOOLNAME; // 3
 * HistoryType.properties[3]; // "TOOLNAME"
 */
var HistoryType = {
	/**
	 * Contains the keys of this enum as strings with the number as index.
	 * @type {Object}
	 */
	properties: {
		index: 0
	},
	
	/**
	 * Adds all enum keys as readable values (strings) into .properties.
	 */
	initProperties: function() {
		this.properties = {
			index: this.properties.index
		};
		for (var i in this) {
			if (typeof this[i] == "number") {
				this.properties[this[i]] = i;
			}
		}
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
 * Adds an entry into the history.
 * @param {Object} entry - Array of values.
 * @param {integer} entry.type - The type of the object by the HistoryType enum.
 */
History.prototype.add = function(entry) {
	this.history.push(entry);
};

/**
 * Registers (adds) a new tool.
 * @param {Object) tool - The object of the tool.
 */
History.prototype.registerTool = function(tool, name) {
	name = name || tool.constructor.name;
	ucname = name.toUpperCase();
	HistoryType[ucname] = HistoryType[ucname] || ++HistoryType.properties.index;
	HistoryType.initProperties();
};
