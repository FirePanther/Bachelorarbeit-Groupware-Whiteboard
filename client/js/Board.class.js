/**
 * The Board class manages the board canvas element.
 * @constructor
 * @param {jQuery} [$board] - The canvas jQuery element.
 */
function Board($board) {
	this.context = null;
	this.tools = {};
	this.events = [];
	
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
		left: main.tools.toolbarWidth,
		width: window.innerWidth - main.tools.toolbarWidth,
		height: window.innerHeight
	});
	this.redraw();
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
	// will be removed
	//this.context.shadowBlur=20;
	//this.context.shadowColor="black";

	var h;
	for (var i in main.history.history) {
		h = main.history.history[i];
		if (HistoryType.properties[h.type]) {
			HistoryType.properties[h.type].toolObject.redraw(h, HistoryType.properties[h.type].toolName);
		}
	}
};
