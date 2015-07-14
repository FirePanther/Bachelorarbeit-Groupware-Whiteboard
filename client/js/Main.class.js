/**
 * The Main class
 * @constructor
 */
function Main() {
	var $window = $(window);
	$window.resize((function(self) {
		return function() {
			self.board.resize();
		};
	})(this));
}

Main.prototype = (function() {
	return {
		init: function() {
			this.board = new Board($("#board"));
			return true;
		},
		getBoard: function() {
			return this.board;
		}
	};
})();
