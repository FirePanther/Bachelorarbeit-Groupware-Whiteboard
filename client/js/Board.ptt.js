/**
 * The Board class manages the board canvas elements.
 * @constructor
 * @param {Object} [$board] - The canvas jQuery element.
 */
function Board($board) {
	this.context = null;
	this.tools = {};
	this.events = [];
	this.cache = {};
	
	$board = $board || 0;
	this.wholeBoards = 0;
	
	// temporary
	this.temporary = false;
	this.$tmpBoards = $(".tmpBoards");
	this.tmpBoards = {};
	
	// main whole board (contains the end result without history steps)
	this.wholeMain = this.tmpBoard(null, true);
	
	if ($board !== 0 && $board.length) this.setBoard($board);
	
	if (main) {
		this.addUndoButtons();
		this.initBroadcastTypes();
		
		main.history.registerEvent(this, "undoButtonsVisibility");
		main.history.registerEvent(this, "drawHistory");
	}
};

/**
 * Initializes some required broadcast types for temporary broadcasts,
 * saved (fixed) broadcasts and for the undo and redo tools.
 * Calls the broadcast methods of the tools if TMP broadcasts are received.
 * Calls the removeTmp (if exist) and redraw methods of the tools if SAVE
 * broadcasts are received. Also adds the SAVE broadcast to the history.
 */
Board.prototype.initBroadcastTypes = function() {
	var self = this;
	
	BroadcastType.TMP = BroadcastType.index++;
	BroadcastType.SAVE = BroadcastType.index++;
	BroadcastType.UNDO = BroadcastType.index++;
	BroadcastType.REDO = BroadcastType.index++;
	
	main.server.broadcasts[BroadcastType.TMP] = function(resp) {
		var toolNr = resp.data.toolNr,
			toolObject = HistoryType.properties[toolNr].toolObject;
		// call broadcast() method of all tools
		toolObject.broadcast.apply(toolObject, [ resp.userId, resp.data ]);
	};
	main.server.broadcasts[BroadcastType.SAVE] = function(resp) {
		var h = resp.data.entry;
		main.history.addById(resp.data.id, resp.userId, h);
		if (HistoryType.properties[h.toolNr].toolObject.removeTmp) {
			HistoryType.properties[h.toolNr].toolObject.removeTmp.apply(HistoryType.properties[h.toolNr].toolObject, [ h ]);
		}
		// call redraw() method of all tools
		HistoryType.properties[h.toolNr].toolObject.redraw(h);
		
		//main.board.tmpBoard(resp.userId).remove();
	};
	main.server.broadcasts[BroadcastType.UNDO] = function(resp) {
		self.undo(resp.userId);
	};
	main.server.broadcasts[BroadcastType.REDO] = function(resp) {
		self.redo(resp.userId);
	};
};

/**
 * Creates or selects (if already created) a temporary board (e.g. for temporary
 * drawings by foreign clients).
 * @param {string} boardId - The ID of the board. Not required if whole=true.
 * @param {boolean} [whole=false] - whole boards contain whole drawing informations and are invisible.
 */
Board.prototype.tmpBoard = function(boardId, whole) {
	if (whole) {
		if (!boardId) boardId = ++this.wholeBoards;
		boardId = "whole_" + boardId;
	}
	if (!this.tmpBoards[boardId]) {
		// create
		var $canvas = $('<canvas class="board ' + (whole ? "hidden" : "fullscreen click-through") + '" id="board_' + boardId + '"/>');
		
		$canvas.css({
			left: main ? main.tools.toolbarWidth : 0,
			width: BOARDMAXWIDTH,
			height: BOARDMAXHEIGHT
		}).attr({
			width: BOARDMAXWIDTH * MULTIPLIER,
			height: BOARDMAXHEIGHT * MULTIPLIER
		});
		this.$tmpBoards.append($canvas);
		this.tmpBoards[boardId] = {
			temporary: true,
			whole: whole && this.wholeBoards, // returns 0 if not whole, the wholeBoardIndex if whole
			$element: $canvas,
			context: $canvas[0].getContext("2d"),
			cache: {},
			width: BOARDMAXWIDTH,
			height: BOARDMAXHEIGHT,
			remove: (function(self, boardId) {
				return function() {
					self.removeTmpBoard(boardId);
				};
			})(this, boardId),
			clear: (function(self, boardId) {
				return function() {
					self.tmpBoards[boardId].context.clearRect(0, 0, BOARDMAXWIDTH * MULTIPLIER, BOARDMAXHEIGHT * MULTIPLIER)
				};
			})(this, boardId)
		};
	}
	return this.tmpBoards[boardId];
};

/**
 * Removes the temporary board element and the item.
 * @param {string} boardId - The ID of the board.
 */
Board.prototype.removeTmpBoard = function(boardId) {
	this.tmpBoards[boardId].$element.remove();
	this.tmpBoards[boardId].deleted = true;
	delete this.tmpBoards[boardId];
};

/**
 * Selects the board (canvas) element. Sets the dimensions to the maximum size.
 * @param {Object} $board - The canvas jQuery element.
 */
Board.prototype.setBoard = function($board) {
	if ($board.length > 1) $board = $($board[0]);
	this.$board = $board;
	this.context = this.$board[0].getContext("2d");
	this.$board.css({
		left: main ? main.tools.toolbarWidth : 0,
		width: BOARDMAXWIDTH,
		height: BOARDMAXHEIGHT
	}).attr({
		width: BOARDMAXWIDTH * MULTIPLIER,
		height: BOARDMAXHEIGHT * MULTIPLIER
	});
};

/**
 * Clears the main canvas.
 */
Board.prototype.clear = function() {
	this.context.clearRect(0, 0, BOARDMAXWIDTH, BOARDMAXHEIGHT);
};

/**
 * Marks the last not already undone item of a user in the history as "undone".
 * @param {string} userId - The last item of which user?
 */
Board.prototype.undo = function(userId) {
	userId = userId || 0;
	
	var pre = 0, h, undone = false;
	for (var x in main.history.history) {
		h = main.history.history[x];
		// if (h.whole) continue;
		if (h.userId != userId) continue;
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
 * Deletes the "undone" mark of the last undone item in the history of a user.
 * @param {string} userId - The last item of which user?
 */
Board.prototype.redo = function(userId) {
	userId = userId || 0;
	
	var h;
	for (var x in main.history.history) {
		h = main.history.history[x];
		//if (h.whole) continue;
		if (h.userId != userId) continue;
		if (h.undone) {
			delete h.undone;
			break;
		}
	}
	this.undoButtonsVisibility(true);
	this.redraw();
};

/**
 * Checks if there are undone and undoneable history items and shows or hides
 * the tool buttons in the toolbar.
 */
Board.prototype.undoButtonsVisibility = function(keep) {
	keep = keep || false;
	var h = main.history.history;
	
	if (!keep) {
		// remove redos
		for (var x in h) {
			if (h[x].undone) delete h[x];
		}
		h = main.history.history;
	}
	
	var undo = false, redo = false,
		classes = "tool-unclickable click-through";
	
	for (var x in h) {
		if (h[x].userId) continue;
		if (h[x].undone) redo = true;
		else if (!h[x].undone) undo = true;
		if (redo && undo) break;
	}
	
	if (undo) main.tools.$undo.removeClass(classes);
	else main.tools.$undo.addClass(classes);
	
	if (redo) main.tools.$redo.removeClass(classes);
	else main.tools.$redo.addClass(classes);
};

/**
 * Creates and injects the undo and redo buttons into the toolbar.
 */
Board.prototype.addUndoButtons = function() {
	var self = this,
		$undoButtons = $('<section class="undoButtons" />'),
		$undo = $('<div class="tool tool-unclickable click-through"><img src="img/undo.svg" alt="Undo" /></div>'),
		$redo = $('<div class="tool tool-unclickable click-through"><img src="img/redo.svg" alt="Redo" /></div>');
	$undo.click(function() {
		self.undo.apply(self);
		main.server.broadcast(BroadcastType.UNDO);
	});
	$redo.click(function() {
		self.redo.apply(self);
		main.server.broadcast(BroadcastType.REDO);
	});
	$undoButtons.append($undo);
	$undoButtons.append($redo);
	main.tools.$undoButtons = $undoButtons;
	main.tools.$undo = $undo;
	main.tools.$redo = $redo;
	main.tools.$settings.after($undoButtons);
};

/**
 * Creates an image of the first (old) history items, removes history these items.
 * This prevents lags and history overflows.
 */
Board.prototype.drawHistory = function() {
	var historyLen = 0;
	$.each(main.history.history, function() {
		if (this.userId == 0) historyLen++;
	});
	if (historyLen > UNDOSTEPS) {
		// draw image of first steps
		var i = historyLen - UNDOSTEPS, h, prepared = [];
		for (var x in main.history.history) {
			h = main.history.history[x];
			
			if (h.undone) continue;
			HistoryType.properties[h.toolNr].toolObject.redraw(h, this.wholeMain);
			delete main.history.history[x];
			
			if (!--i) break;
		}
	}
};

/**
 * Prepare to redraw. Calls the prepareRedraw method of the tools (if exist) so
 * they can prepare (e.g. remove elements) before redrawing.
 */
Board.prototype.prepareRedraw = function(h, prepared) {
	// prepare redraw (remove some stuff)
	if (h.toolNr && prepared.indexOf(h.toolNr) === -1) {
		if (HistoryType.properties[h.toolNr].toolObject.prepareRedraw) {
			HistoryType.properties[h.toolNr].toolObject.prepareRedraw(h.toolNr);
		}
		prepared.push(h.toolNr);
	}
	return prepared;
};

/**
 * Redraw the whole board. Calls the required redraw method of the tools from the
 * history in the right order.
 */
Board.prototype.redraw = function() {
	this.clear();

	this.context.drawImage(this.wholeMain.$element[0], 0, 0);

	var h, prepared = [];
	for (var i in main.history.history) {
		h = main.history.history[i];
		
		prepared = this.prepareRedraw(h, prepared);
		
		if (h.undone) continue;
		HistoryType.properties[h.toolNr].toolObject.redraw(h);
	}
};
