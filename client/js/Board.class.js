/**
 * The Board class manages the board canvas element.
 * @constructor
 * @param {jQuery} [$board] - The canvas jQuery element.
 */
function Board($board) {
	this.context = null;
	this.tools = {};
	
	$board = $board || 0;
	if ($board !== 0 && $board.length) this.setBoard($board);
};

/**
 * Selects the board (canvas) element.
 * @param {jQuery} $board - The canvas jQuery element.
 */
Board.prototype.setBoard = function($board) {
	if ($board.length > 1) $board = $($board[0]);
	this.$board = $board;
	this.context = this.$board[0].getContext("2d");
	this.resize();
};

/**
 * Resizes the canvas element to the window size.
 */
Board.prototype.resize = function() {
	this.$board.attr({
		width: window.innerWidth,
		height: window.innerHeight
	});
};

/**
 * Clears the canvas.
 */
Board.prototype.clear = function() {
	this.context.clearRect(0, 0, this.$board.width(), this.$board.height());
};

/**
 * Redraw the whole board.
 */
Board.prototype.redraw = function() {
	this.clear();
};

/**
 * Registers (adds) a new tool.
 * @param {Object) tool - The object of the tool.
 */
Board.prototype.registerTool = function(tool, name) {
	// name is the constructor name with lcfirst.
	name = name || tool.constructor.name.substr(0, 1).toLowerCase() + tool.constructor.name.substr(1);
	this.tools[tool.constructor.name] = this.tools[tool.constructor.name] || {
		name: name
	};
};
