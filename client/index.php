<!doctype html>
<html>
	<head>
		<title>Bachelorarbeit</title>
		<link rel="stylesheet" href="css/default.css" />
		<?php
		// versioning (prevents caching after updated files)
		$styles = glob("css/*.css");
		foreach ($styles as $style) {
			echo '
		<link rel="stylesheet" href="' . $style . '?v=' . hash("crc32b", filemtime($style)) . '" />';
		}
		?>
	</head>
	<body>
		<div class="toolbar left"></div>
		
		<canvas class="board fullscreen" id="visibleBoard"></canvas>
		<div class="tmpBoards"></div>
		
		<script src="js/jq.js"></script>
		<script src="https://cdn.socket.io/socket.io-1.3.5.js"></script>
		<?php
		// versioning (prevents caching after updated files)
		$scripts = array_merge(glob("js/*.ptt.js"), ["js/settings.js", "js/functions.js", "js/cookie.js", "js/default.js"], glob("js/misc/*.ptt.js"), glob("js/tools/*.ptt.js"));
		foreach ($scripts as $script) {
			echo '
		<script src="' . $script . '?v=' . hash("crc32b", filemtime($script)) . '"></script>';
		}
		?>

	</body>
</html>