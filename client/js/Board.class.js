/**
 * The Board class manages the board canvas element.
 * @constructor
 * @param {Object} [$board] - The canvas jQuery element.
 */
function Board($board) {
	$board = $board || 0;
	if ($board !== 0 && $board.length == 1) this.setBoard($board);
}

Board.prototype = (function() {
	return {
		/**
		 * @param {Object} $board - The canvas jQuery element.
		 */
		setBoard: function($board) {
			this.$board = $board;
			this.resize();
		},
		
		/**
		 * Resizes the canvas element to the window size.
		 */
		resize: function() {
			this.$board.attr({
				width: window.innerWidth + "px",
				height: window.innerHeight + "px"
			});
		}
	};
})();
