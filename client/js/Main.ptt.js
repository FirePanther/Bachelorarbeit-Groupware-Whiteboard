/**
 * The Main class contains objects of the required prototypes.
 * @constructor
 */
function Main() {
	debug.log("+ Main constructor");
	
	this.miscs = {};
	this.server = new Server();
	this.tools = new Tools();
	
	// the todo list of all tools to register
	this.registerToolToDo = [];
	
	// is the main object initialized?
	this.initialized = false;
	
	debug.log("- Main constructor");
}

/**
 * Initializes the history, server, tools, board and registers the tools in the
 * todo list.
 */
Main.prototype.init = function() {
	debug.log("+ Main init");
	
	this.history = new History();
	
	this.server.init();
	this.tools.init();
	
	this.board = new Board($("#visibleBoard"));
	
	// init miscs
	for (var x in this.miscs) {
		if (this.miscs[x].init) this.miscs[x].init();
	}
	
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
 * Registers a toolObject. If the main object isn't initializes (page is not loaded)
 * the registering progress will be added into the todo list.
 * @param {Object} toolObject
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
