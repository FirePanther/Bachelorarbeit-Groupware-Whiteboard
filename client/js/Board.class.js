var Board = (function() {
	/**
	 * The Board class manages the board canvas element.
	 * @constructor
	 * @param {jQuery} [$board] - The canvas jQuery element.
	 */
	var Board = function ($board) {
		$board = $board || 0;
		if ($board !== 0 && $board.length == 1) this.setBoard($board);
	};
	
	/**
	 * Selects the board element.
	 * @param {jQuery} $board - The canvas jQuery element.
	 */
	Board.prototype.setBoard = function($board) {
		this.$board = $board;
		this.resize();
	};
	
	/**
	 * Resizes the canvas element to the window size.
	 */
	Board.prototype.resize = function() {
		this.$board.attr({
			width: window.innerWidth + "px",
			height: window.innerHeight + "px"
		});
	};
	
	return Board;
})();
