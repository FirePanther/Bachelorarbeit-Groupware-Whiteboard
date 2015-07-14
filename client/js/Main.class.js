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

Main.prototype.init = function() {
	this.history = new History();
	
	this.board = new Board($("#board"));
	
	this.draw = new Draw();
	this.registerTool(this.draw);
};

Main.prototype.registerTool = function(tool) {
	this.history.registerTool(tool);
	this.board.registerTool(tool);
};
