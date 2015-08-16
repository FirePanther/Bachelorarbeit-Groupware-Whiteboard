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
	
	// contains all tools with the toolName as key and the object as value
	this.registeredTools = {};
	
	// the todo list of all tools to register
	this.registerToolToDo = [];
	
	// is the main object initialized?
	this.initialized = false;
	
	debug.log("- Main constructor");
}

Main.prototype.init = function() {
	debug.log("+ Main init");
	
	this.history = new History();
	this.board = new Board($(".board"));
	
	this.server.init();
	this.tools.init();
	
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
 * Registers an object in the Main object.
 * @param {string} toolName - The name of the tool (of the class).
 */
Main.prototype.registerTool = function(toolObject) {
	if (this.initialized) {
		var toolClassName = toolObject.constructor.name;
		debug.log("+ Main registering tool: " + toolClassName + ".class");
		
		this.registeredTools[toolClassName] = toolObject;

		if (toolObject.toolSettings) {
			for (var i in toolObject.toolSettings) {
				this.history.registerTool(toolObject, i);
				this.tools.registerTool(toolObject, i);
			}
		}
		
		debug.log("- Main registering tool: " + toolClassName + ".class");
	} else {
		// just add to the todo list for now, wait for initialization
		this.registerToolToDo.push(arguments);
	}
};
