/**
 * Contains all types of sendable and receivable broadcasts. The index is the
 * number of broadcasts and has to be incremented after each extension.
 * The broadcast types are constants (shouldn't be edited ever) and have to be
 * written in upper case.
 * @example
 * BroadcastType.NAME = BroadcastType.index++;
 * var type = BroadcastType.NAME;
 */
var BroadcastType = {
	index: 0
};

/**
 * The Server prototype creates a connection to the server with the correct url
 * to join the right channel. The server contains the userId, an object of
 * all broadcast events and arrays of all connect and disconnect events.
 * @constructor
 */
function Server(pathname, options) {
	if (typeof pathname === "undefined") this.pathname = location.pathname.substr(-1) != "/" ? location.pathname.replace(/^.*?([^\/]+)$/, "$1") : "";
	else this.pathname = pathname;
	
	options = options || {};
	
	this.socket = io("http://tchost.de:24690/?board=" + this.pathname, options);
	
	// manager: http://socket.io/docs/client-api/#manager(url:string,-opts:object)
	this.socket.io.reconnection(false);
	
	this.userId = 0;
	
	this.alerts = false;
	
	// difference between client and server time
	this.diff = 0;
	
	this.broadcasts = {};
	this.connects = [];
	this.disconnects = [];
};

/**
 * Initializes all required server events.
 * @param {boolean} [alerts=true] - Should the user get an alert on errors?
 */
Server.prototype.init = function(alerts) {
	var self = this;
	if (typeof alerts === "undefined" || alert) this.alerts = true;
	
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
				var msg = "You tried to connect to a board that doesn't exist (anymore).";
				if (self.alerts) alert(msg);
				else console.log(msg);
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
 * Broadcasts to all foreign clients in the same channel.
 * @param {int} type - The broadcast type.
 * @param {mixed} data - The data to send to the other clients.
 */
Server.prototype.broadcast = function(type, data) {
	this.socket.emit("*", {
		type: type,
		date: this.getTime(),
		data: data
	});
};

/**
 * Calculates the server time by the client time and the calculated difference.
 */
Server.prototype.getTime = function() {
	return new Date(new Date().getTime() + this.diff).getTime();
};