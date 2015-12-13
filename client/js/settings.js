var
/**
 * server settings
 */
	SERVER = "localhost",
	PORT = 24690,

/**
 * rewrite rule (mod_rewrite) activated?
 */
	REWRITERULE = true,
/**
 * the board max width is the maximum width of any board or element.
 */
	BOARDMAXWIDTH = 2500,
/**
 * the board max height is the maximum height of any board or element.
 */
	BOARDMAXHEIGHT = 2000,
/**
 * the multiplier resizes the board and allows to draw sharp even on a higher dpi (e.g. retina displays).
 */
	MULTIPLIER = 2,
/**
 * the maximum number of steps that can be undone (to prevent lags and history overflows).
 */
	UNDOSTEPS = 20;