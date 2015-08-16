/**
 * Tools...
 * @constructor
 */
function Server() {
	this.socket = io("http://tchost.de:24690");
	this.userId = 0;
	this.date = new Date();
};

/**
 * 
 */
Server.prototype.init = function() {
	var self = this;
	
	// userId
	this.socket.on("userId", function(resp) {
		self.userId = resp;
	});
	
	// "date" is for getting the server time
	this.socket.on("date", function(resp) {
		var receiveTime = new Date().getTime(),
			latency = (receiveTime - resp.clientTime),
			estimatedServerTime = resp.serverTime + latency / 2,
			diff = estimatedServerTime - receiveTime;
		self.date = new Date(receiveTime + diff);
	});
	
	// on broadcast (when I get data from other users)
	this.socket.on("*", function(resp) {
		switch (resp.type) {
			case "board tmp":
				var toolId = HistoryType[resp.data.toolName.toUpperCase()],
					toolObject = HistoryType.properties[toolId].toolObject;
				toolObject.broadcast(toolObject, resp.userId, resp.data);
				//main.history.tmp[resp.userId] = resp.data;
				break;
			case "board":
				main.history.addById(resp.data.id, false, resp.data.entry);
				main.board.redraw();
				break;
		}
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
		date: this.date.getTime(),
		data: data
	});
};
