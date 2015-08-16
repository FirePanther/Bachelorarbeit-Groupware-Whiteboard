var WebSocketServer = require("ws").Server,
	wss = new WebSocketServer({ port: 24690 });

wss.on("connection", function (ws) {
	var url = ws.upgradeReq.url.substr(1);

	ws.on("message", function (data, flags) {
		// ask for time
		if (data.substr(0, 2) == "t:") {
			ws.send("t:" + data.substr(2) + ":" + (new Date().getTime() + 1234));
		}
	});

	ws.on("close", function () {
		console.log("close");
	});
});
