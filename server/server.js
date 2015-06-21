var WebSocketServer = require("ws").Server,
	wss = new WebSocketServer({ port: 24690 });

wss.on("connection", function (ws) {
	console.log("connection");

	ws.on("open", function (data, flags) {
		console.log("open");
	});

	ws.on("message", function (data, flags) {
		console.log("message");
	});

	ws.on("close", function () {
		console.log("close");
	});
});