var port = 24690, // my birthday :)
	http = require('http').createServer(),
	io = require("socket.io")(http),
	fs = require("fs"),
	
	// the boardId index
	boardIds = 0,
	
	// contains all boards with the board url, boardId and number of users
	boards = {},
	
	codecs = {
		// the codec of the board. This chars are allowed in the url.
		board: shuffle("dth4MDPioZyeUuHCv9pGVxjbLg7f8FQsX_azNmqRA61cWkB-w3EK+JSrTY5n2")
	};

/**
 * socket connection listener
 */
io.on("connection", function(socket) {
	console.log("client " + socket.id + " connected.");
	
	var board = socket.handshake.query.board;
	console.log("trying to connect to board: \"" + board + "\"");
	
	/** if the user connects to the home (without board url) redirect him to a new url. */
	if (!board) {
		// create new board
		board = radix(boardIds, codecs.board);
		console.log("created board: " + board);
		boards[board] = {
			boardId: boardIds,
			users: 1
		};
		socket.emit("url", board);
		boardIds++;
	
	/** if he connects to an existing url, increment the number of users */
	} else if (boards[board]) {
		console.log("joined board: " + board);
		boards[board].users++;
	
	/** if he connects to a not existing url, disconnect him with error message */
	} else {
		console.log("error 1");
		socket.emit("err", 1); // board doesn't exist
		socket.disconnect();
		return;
	}
	
	/** join him to the board and send him his informations, broadcast, that anyone is connected. */
	socket.join(board);
	socket.emit("userId", socket.id);
	socket.broadcast.to(board).emit("userConnect", socket.id);
	
	/**
	 * Logs errors by the client into the logs directory
	 */
	socket.on("log", function(msg, url, line) {
		var addZero = function(i) { return (i < 10 ? "0" : "") + i; },
			date = new Date(),
			d = addZero(date.getDate()),
			m = addZero(date.getMonth()),
			h = addZero(date.getHours()),
			i = addZero(date.getMinutes());
		fs.writeFile(
			__dirname + "/logs/" + m + "-" + d + "," + h + "." + i + "-" + Math.round(Math.random() * 1000),
			"Script: " + url + " (" + line + ")\n\nSocketId: " + socket.id + "\n\nMessage:\n" + msg,
			function(err) { if (err) return console.log(err); }
		);
	});
	
	/**
	 * If a user disconnects, broadcast this information
	 */
	socket.on("disconnect", function() {
		boards[board].users--;
		console.log("client " + socket.id + " disconnected.");
		io.sockets.emit("userDisconnect", socket.id);
	});
	
	/**
	 * Reply for date asking users with the server date
	 */
	socket.on("date", function(clientTime) {
		socket.emit("date", {
			clientTime: clientTime,
			serverTime: new Date().getTime()
		});
	});
	
	/**
	 * A client wants to broadcast informations.
	 */
	socket.on("*", function(rec) {
		rec.userId = socket.id;
		socket.broadcast.to(board).emit("*", rec);
	});
});

/**
 * starts to listen to the port
 */
http.listen(port, function() {
	console.log("listening on *:" + port);
});

/**
 * Converts an integer into a string containg only the chars of codec.
 * This prevents two times the same string e.g. for unique urls.
 * source: {@link http://www.javascripter.net/faq/convert3.htm}
 * @param {int} integer
 * @param {string} codec
 */
function radix(integer, codec) {
	var clen = codec.length, string = "", mod;
	do {
		mod = integer % clen;
		string = codec[mod] + string;
		integer = (integer - mod) / clen; 
	} while (integer > 0);
	return string;
}

/**
 * shuffles a string
 * @param {string} str
 * @returns {string} the shuffled string
 */
function shuffle(str) {
	return str.split('').sort(function() {
		return 0.5 - Math.random();
	}).join('');
}
