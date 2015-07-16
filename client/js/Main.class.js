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
	
	this.tools = new Tools();
	
	// contains all tools with the toolName as key and the object as value
	this.registeredTools = [];
	
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
	
	this.tools.init();
	
	// initialized main
	this.initialized = true;
	
	// register tools if todo list exist
	for (var i in this.registerToolToDo) {
		this.registerTool(this.registerToolToDo[i].toolName, this.registerToolToDo[i].toolClassName);
	}
	this.registerToolToDo = [];
	
	debug.log("- Main init");
};

/**
 * Registers a tool in the Main object.
 * @param {string} toolName - The name of the tool (of the class).
 */
Main.prototype.registerTool = function(toolName) {
	toolClassName = ucfirst(toolName);
	toolName = lcfirst(toolName);
	if (this.initialized) {
		debug.log("+ Main registering tool: " + toolName + " (" + toolClassName + ".class)");
		
		this.registeredTools[toolName] = new window[toolClassName]();
		this.registeredTools[toolName].init();
		
		debug.log("- Main registering tool: " + toolName + " (" + toolClassName + ".class)");
	} else {
		// just add to the todo list for now, wait for initialization
		this.registerToolToDo.push({
			toolName: toolName,
			toolClassName: toolClassName
		});
	}
};
