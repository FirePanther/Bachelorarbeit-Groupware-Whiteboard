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
	
	// temporary
	this.temporary = false;
	this.$tmpBoards = $(".tmpBoards");
	this.tmpBoards = {};
	
	if ($board !== 0 && $board.length) this.setBoard($board);
};

/**
 * Creates a temporary board (e.g. for temporary drawings by users)
 */
Board.prototype.tmpBoard = function(boardId) {
	if (!this.tmpBoards[boardId]) {
		// create
		var $canvas = $('<canvas class="board fullscreen click-through" id="board_' + boardId + '"/>');
		$canvas.attr({
			left: main.tools.toolbarWidth,
			width: window.innerWidth - main.tools.toolbarWidth,
			height: window.innerHeight
		});
		this.$tmpBoards.append($canvas);
		this.tmpBoards[boardId] = {
			temporary: true,
			$element: $canvas,
			context: $canvas[0].getContext("2d"),
			remove: (function(self, boardId) {
				return function() {
					self.removeTmpBoard(boardId);
				};
			})(this, boardId)
		};
	}
	return this.tmpBoards[boardId];
};

/**
 * Removes the element and the item
 */
Board.prototype.removeTmpBoard = function(boardId) {
	this.tmpBoards[boardId].$element.remove();
	delete this.tmpBoards[boardId];
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
