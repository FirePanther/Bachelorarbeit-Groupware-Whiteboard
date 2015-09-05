/**
 * The Main class
 * @constructor
 */
function Main() {
	debug.log("+ Main constructor");
	
	// window resize event listener
	var $window = $(window);
	$window.resize((function(self) {
		return function() {
			if (self.initialized) self.board.resize();
		};
	})(this));
	
	this.server = new Server();
	this.tools = new Tools();
	
	// the todo list of all tools to register
	this.registerToolToDo = [];
	
	// is the main object initialized?
	this.initialized = false;
	
	debug.log("- Main constructor");
}

Main.prototype.init = function() {
	debug.log("+ Main init");
	
	this.history = new History();
	this.cursor = new Cursor();
	
	this.server.init();
	this.tools.init();
	
	this.board = new Board($("#visibleBoard"));
	
	// initialized main
	this.initialized = true;
	
	// register tools if todo list exist
	for (var i in this.registerToolToDo) {
		this.registerTool.apply(this, this.registerToolToDo[i]);
	}
	this.registerToolToDo = [];
	
	debug.log("- Main init");
};

/**
 */
Main.prototype.registerTool = function(toolObject) {
	if (this.initialized) {
		var toolClassName = toolObject.constructor.name,
			toolNr;
		debug.log("+ Main registering tool: " + toolClassName + ".class");
		
		if (toolObject.toolSettings) {
			for (var toolName in toolObject.toolSettings) {
				toolNr = this.history.registerTool(toolObject, toolName);
				this.tools.registerTool(toolNr);
			}
		}
		
		debug.log("- Main registering tool: " + toolClassName + ".class");
	} else {
		// just add to the todo list for now, wait for initialization
		this.registerToolToDo.push(arguments);
	}
};
