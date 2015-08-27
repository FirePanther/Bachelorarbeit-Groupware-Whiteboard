/**
 * The Board class manages the board canvas element.
 * @constructor
 * @param {jQuery} [$board] - The canvas jQuery element.
 */
function Board($board) {
	this.context = null;
	this.tools = {};
	this.events = [];
	this.cache = {};
	
	// did the board changed? (did "I" drawed on the board?)
	this.drawed = false;
	
	$board = $board || 0;
	this.$wholeBoard = $("#wholeBoard");
	this.$wholeBoard.attr({
		width: BOARDMAXWIDTH,
		height: BOARDMAXHEIGHT
	});
	this.wholeBoards = 0;
	
	// temporary
	this.temporary = false;
	this.$tmpBoards = $(".tmpBoards");
	this.tmpBoards = {};
	
	if ($board !== 0 && $board.length) this.setBoard($board);
};

/**
 * Creates a temporary board (e.g. for temporary drawings by users)
 * whole boards contain whole drawing informations and are invisible (and have the maximum size)
 */
Board.prototype.tmpBoard = function(boardId, whole) {
	if (whole) {
		if (!boardId) boardId = ++this.wholeBoards;
		boardId = "whole_" + boardId;
	}
	if (!this.tmpBoards[boardId]) {
		// create
		var $canvas = $('<canvas class="board ' + (whole ? "hidden" : "fullscreen click-through") + '" id="board_' + boardId + '"/>'),
			width = window.innerWidth - main.tools.toolbarWidth,
			height = window.innerHeight;
		$canvas.css("left", main.tools.toolbarWidth + "px").attr({
			width: width < BOARDMAXWIDTH && !whole ? width : BOARDMAXWIDTH,
			height: height < BOARDMAXHEIGHT && !whole ? height : BOARDMAXHEIGHT
		});
		this.$tmpBoards.append($canvas);
		this.tmpBoards[boardId] = {
			temporary: true,
			whole: whole && this.wholeBoards, // returns 0 if not whole, the wholeBoardIndex if whole
			$element: $canvas,
			context: $canvas[0].getContext("2d"),
			cache: {},
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
	console.log("resize");
	var width = window.innerWidth - main.tools.toolbarWidth,
		height = window.innerHeight;
	this.$board.css("left", main.tools.toolbarWidth).attr({
		width: width < BOARDMAXWIDTH ? width : BOARDMAXWIDTH,
		height: height < BOARDMAXHEIGHT ? height : BOARDMAXHEIGHT
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
	// todo will be removed
	//this.context.shadowBlur=20;
	//this.context.shadowColor="black";

	var h;
	for (var i in main.history.history) {
		h = main.history.history[i];
		if (h.whole) {
			this.context.drawImage(this.tmpBoard(h.index, true).$element[0], 0, 0);
		} else if (HistoryType.properties[h.type]) {
			HistoryType.properties[h.type].toolObject.redraw(h, HistoryType.properties[h.type].toolName);
		}
	}
};
