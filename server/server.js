var port = 24690, // my birthday :)
	http = require('http').createServer(),
	io = require("socket.io")(http),
	fs = require("fs"),
	boardIds = 0,
	boards = {},
	
	codecs = {
		board: shuffle("dth4MDPioZyeUuHCv9pGVxjbLg7f8FQsX_azNmqRA61cWkB-w3EK+JSrTY5n2")
	};

io.on("connection", function(socket) {
	console.log("client " + socket.id + " connected.");
	
	var board = socket.handshake.query.board;
	console.log("trying to connect to board: \"" + board + "\"");
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
	} else if (boards[board]) {
		console.log("joined board: " + board);
		boards[board].users++;
	} else {
		console.log("error 1");
		socket.emit("err", 1); // board doesn't exist
		socket.disconnect();
		return;
	}
	
	socket.join(board);
	socket.emit("userId", socket.id);
	socket.broadcast.to(board).emit("userConnect", socket.id);
	
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
	
	socket.on("disconnect", function() {
		boards[board].users--;
		console.log("client " + socket.id + " disconnected.");
		io.sockets.emit("userDisconnect", socket.id);
	});
	
	socket.on("date", function(clientTime) {
		socket.emit("date", {
			clientTime: clientTime,
			serverTime: new Date().getTime()
		});
	});
	
	socket.on("*", function(rec) {
		rec.userId = socket.id;
		socket.broadcast.to(board).emit("*", rec);
	});
});

http.listen(port, function() {
	console.log("listening on *:" + port);
});

// source: http://www.javascripter.net/faq/convert3.htm
function radix(integer, codec) {
	var clen = codec.length, string = "", mod;
	do {
		mod = integer % clen;
		string = codec[mod] + string;
		integer = (integer - mod) / clen; 
	} while (integer > 0);
	return string;
}


function shuffle(str) {
	return str.split('').sort(function(){return 0.5-Math.random()}).join('');
}