/**
 * Enum
 */
var BroadcastType = {
	CURSOR: 1,
	TMP: 2,
	SAVE: 3
};

/**
 * Tools...
 * @constructor
 */
function Server() {
	this.pathname = location.pathname.substr(-1) != "/" ? location.pathname.replace(/^.*?([^\/]+)$/, "$1") : "";
	this.socket = io("http://tchost.de:24690/?board=" + this.pathname);
	
	// manager: http://socket.io/docs/client-api/#manager(url:string,-opts:object)
	//this.socket.io.reconnection(false);
	
	this.userId = 0;
	
	// difference between client and server time
	this.diff = 0;
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
	
	// url
	this.socket.on("url", function(url) {
		history.pushState({ url: url }, "board", url);
	});
	
	// error
	this.socket.on("err", function(resp) {
		switch (resp) {
			case 1:
				alert("You tried to connect to a board that doesn't exist (anymore).");
				break;
		}
	});
	
	// someone disconnected
	this.socket.on("disconnect", function(userId) {
		main.cursor.remove(userId);
	});
	
	// "date" is for getting the server time
	this.socket.on("date", function(resp) {
		var receiveTime = new Date().getTime(),
			latency = (receiveTime - resp.clientTime),
			estimatedServerTime = resp.serverTime + latency / 2,
			diff = estimatedServerTime - receiveTime;
		self.diff = diff;
	});
	
	// on broadcast (when I get data from other users)
	this.socket.on("*", function(resp) {
		switch (resp.type) {
			case BroadcastType.CURSOR:
				if (resp.data.remove) main.cursor.remove(resp.userId);
				else main.cursor.move(resp.userId, resp.data.x, resp.data.y);
				break;
			case BroadcastType.TMP:
				var toolNr = resp.data.toolNr,
					toolObject = HistoryType.properties[toolNr].toolObject;
				toolObject.broadcast.apply(toolObject, [ resp.userId, resp.data ]);
				break;
			case BroadcastType.SAVE:
				main.board.drawed = false;
				
				var lastEntry = main.history.last();
				if (!lastEntry || !lastEntry.whole || lastEntry.index !== main.board.wholeBoards) {
					// add if not added already
					main.history.addById(resp.data.id, false, {
						whole: true,
						index: main.board.wholeBoards
					});
				}
				
				var h = resp.data.entry;
				HistoryType.properties[h.toolNr].toolObject.redraw(h);
				
				main.board.tmpBoard(resp.userId).remove();
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