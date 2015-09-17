/**
 * Debug
 * @constructor
 */
function Debug() {};

/**
 * Logs the message into the console. Can be uncommented so the user can't see
 * debug console messages.
 * @param {mixed} msg
 */
Debug.prototype.log = function(msg) {
	console.log(msg);
}

/**
 * On new errors contact the server.
 * @param {string} msg - The error message.
 * @param {string} url - The script file.
 * @param {int} line - The code line.
 */
window.onerror = function(msg, url, line) {  
	main.server.socket.emit("log", msg, url, line);
};