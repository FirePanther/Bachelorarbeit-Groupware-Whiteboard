var
/**
 * Creates an object of the debug prototype.
 */
	debug = new Debug(),
/**
 * Creates an object of the main prototype.
 */
	main = new Main();

/**
 * Initializes the main object on page load.
 */
$(function() {
	main.init();
});