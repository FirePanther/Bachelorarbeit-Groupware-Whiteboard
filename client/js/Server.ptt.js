/**
 * Enum
 */
var BroadcastType = {
	index: 0
};

/**
 * Tools...
 * @constructor
 */
function Server(pathname) {
	if (typeof pathname === "undefined") this.pathname = location.pathname.substr(-1) != "/" ? location.pathname.replace(/^.*?([^\/]+)$/, "$1") : "";
	else this.pathname = pathname;
	this.socket = io("http://tchost.de:24690/?board=" + this.pathname);
	
	// manager: http://socket.io/docs/client-api/#manager(url:string,-opts:object)
	this.socket.io.reconnection(false);
	
	this.userId = 0;
	
	this.alerts = 0;
	
	// difference between client and server time
	this.diff = 0;
	
	this.broadcasts = {};
	this.connects = [];
	this.disconnects = [];
};

/**
 * 
 */
Server.prototype.init = function(alerts) {
	var self = this;
	if (typeof alerts === "undefined" || alert) this.alerts = 1;
	
	// userId
	this.socket.on("userId", function(resp) {
		self.userId = resp;
	});
	
	// url
	this.socket.on("url", function(url) {
		history.pushState({ url: url }, "board", url);
	});
	
	// error
	this.socket.on("err", function(resp) {
		switch (resp) {
			case 1:
				if (self.alerts) alert("You tried to connect to a board that doesn't exist (anymore).");
				break;
		}
	});
	
	// someone connected
	this.socket.on("userConnect", function(userId) {
		for (var x in self.connects) {
			self.connects[x](userId);
		}
	});
	
	// someone disconnected
	this.socket.on("userDisconnect", function(userId) {
		for (var x in self.disconnects) {
			self.disconnects[x](userId);
		}
		delete self.names[userId];
	});
	
	// "date" is for getting the server time
	this.socket.on("date", function(resp) {
		var receiveTime = new Date().getTime(),
			latency = (receiveTime - resp.clientTime) / 2,
			estimatedServerTime = resp.serverTime + latency,
			diff = estimatedServerTime - receiveTime;
		self.diff = diff;
	});
	
	// on broadcast (when I get data from other users)
	this.socket.on("*", function(resp) {
		if (self.broadcasts[resp.type]) self.broadcasts[resp.type](resp);
	});
	
	// ask for the server time
	this.socket.emit("date", new Date().getTime());
};

/**
 * 
 */
Server.prototype.broadcast = function(type, data) {
	this.socket.emit("*", {
		type: type,
		date: this.getTime(),
		data: data
	});
};

/**
 * 
 */
Server.prototype.getTime = function() {
	return new Date(new Date().getTime() + this.diff).getTime();
};