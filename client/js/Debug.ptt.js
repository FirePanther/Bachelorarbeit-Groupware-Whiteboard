/**
 * Debug
 * @constructor
 */
function Debug() {
};

/**
 *
 */
Debug.prototype.log = function(msg) {
	console.log(msg);
}

window.onerror = function(msg, url, line) {  
	main.server.socket.emit("log", msg, url, line);
};