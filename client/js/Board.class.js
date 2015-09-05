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
	
	// main whole board (contains the end result without history steps)
	this.wholeMain = this.tmpBoard(null, true);
	
	this.addUndoButtons();
	
	if ($board !== 0 && $board.length) this.setBoard($board);
	
	main.history.registerEvent(this, "drawHistory");
	main.history.registerEvent(this, "undoButtonsVisibility");
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
		var $canvas = $('<canvas class="board ' + (whole ? "hidden" : "fullscreen click-through") + '" id="board_' + boardId + '"/>');
		
		$canvas.css("left", main.tools.toolbarWidth + "px").attr({
			width: BOARDMAXWIDTH,
			height: BOARDMAXHEIGHT
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
 * 
 */
Board.prototype.undo = function() {
	var pre = 0, h, undone = false;
	for (var x in main.history.history) {
		h = main.history.history[x];
		if (h.whole) continue;
		if (h.undone) {
			undone = true;
			if (pre) pre.undone = true;
			break;
		} else pre = h;
	}
	if (!undone && pre) pre.undone = true;
	this.undoButtonsVisibility(true);
	this.redraw();
};

/**
 * 
 */
Board.prototype.redo = function() {
	var h;
	for (var x in main.history.history) {
		h = main.history.history[x];
		if (h.whole) continue;
		if (h.undone) {
			delete h.undone;
			break;
		}
	}
	this.undoButtonsVisibility(true);
	this.redraw();
};

/**
 * 
 */
Board.prototype.undoButtonsVisibility = function(keep) {
	keep = keep || false;
	var h = main.history.history,
		keys = Object.keys(h),
		first = h[keys[0]],
		last = h[keys[keys.length - 1]],
		classes = "tool-unclickable click-through";
	
	if (!keep) {
		// remove redos
		for (var x in h) {
			if (h[x].undone) {
				delete h[x].undone;
			}
		}
	}
	
	if (first.undone) main.tools.$undo.addClass(classes);
	else main.tools.$undo.removeClass(classes);
	
	if (last.undone) main.tools.$redo.removeClass(classes);
	else main.tools.$redo.addClass(classes);
};

/**
 * 
 */
Board.prototype.addUndoButtons = function() {
	var self = this,
		$undoButtons = $('<section class="undoButtons" />'),
		$undo = $('<div class="tool tool-unclickable click-through"><img src="img/undo.svg" alt="Undo" /></div>'),
		$redo = $('<div class="tool tool-unclickable click-through"><img src="img/redo.svg" alt="Redo" /></div>');
	$undo.click(function() {
		self.undo.apply(self);
	});
	$redo.click(function() {
		self.redo.apply(self);
	});
	$undoButtons.append($undo);
	$undoButtons.append($redo);
	main.tools.$undoButtons = $undoButtons;
	main.tools.$undo = $undo;
	main.tools.$redo = $redo;
	main.tools.$settings.after($undoButtons);
};

/**
 * creates image of history, removes history items
 */
Board.prototype.drawHistory = function() {
	var undoSteps = 6, historyLen = Object.keys(main.history.history).length;
	if (historyLen > undoSteps) {
		// draw image of first steps
		var i = historyLen - undoSteps, finished = false, h;
		for (var x in main.history.history) {
			h = main.history.history[x];
			if (h.undone) continue;
			if (h.whole) {
				this.wholeMain.context.drawImage(this.tmpBoard(h.index, true).$element[0], 0, 0);
			} else if (HistoryType.properties[h.toolNr]) {
				if (finished) {
					break;
				} else {
					HistoryType.properties[h.toolNr].toolObject.redraw(h, this.wholeMain);
				}
			}
			delete main.history.history[x];
			
			// breaks, if the next one isn't a whole board
			if (!--i) finished = true;
		}
	}
};

/**
 * Redraw the whole board.
 */
Board.prototype.redraw = function() {
	this.clear();
	// todo will be removed
	//this.context.shadowBlur=20;
	//this.context.shadowColor="black";

	this.context.drawImage(this.wholeMain.$element[0], 0, 0);

	var h;
	for (var i in main.history.history) {
		h = main.history.history[i];
		if (h.undone) continue;
		if (h.whole) {
			this.context.drawImage(this.tmpBoard(h.index, true).$element[0], 0, 0);
		} else if (HistoryType.properties[h.toolNr]) {
			HistoryType.properties[h.toolNr].toolObject.redraw(h);
		}
	}
};
