/**
 * Tools...
 * @constructor
 */
function Server() {
	this.socket = io("http://tchost.de:24690");
	this.date = new Date();
};

/**
 * 
 */
Server.prototype.init = function() {
	var self = this;
	
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
				console.log(resp.data);
				toolObject.broadcast(toolObject, resp.data);
				// todo: 0 = userId
				//main.history.tmp[0] = resp.data;
				break;
			case "board":
			console.log(resp);
				main.history.addById(resp.data.id, false, resp.data.entry);
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
