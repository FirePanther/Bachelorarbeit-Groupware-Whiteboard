/**
 * Creates a chat element to chat with other clients.
 * @constructor
 */
function Chat() {
	var self = this;
	this.$history = $('<div class="history" />');
	this.$input = $('<input type="text" id="chat" autocomplete="off" />');
	this.$form = $('<form />').on("submit", function() {
		self.submit();
		return false;
	}).append(this.$input);
	this.$chat = $('<div class="chat mini" />').append(this.$history, this.$form);
	this.$history.html("<i>Empty chat</i>");
	$("body").append(this.$chat);
	
	this.$chat.click(function() {
		if ($(this).is(".mini")) {
			$(this).removeClass("mini");
			self.$input.focus();
		} else $(this).addClass("mini");
	});
	this.$history.click(function() {
		self.$input.focus();
		event.stopPropagation();
	});
	this.$form.click(function(event) { event.stopPropagation() });
	
	this.history = {};
	
	this.initServer();
	
	if (Cookies.get("name") !== undefined) {
		var name = this.validateName(Cookies.get('name'));
		if (name) {
			main.server.name = name;
			Cookies.set("name", name, { expires: 7 });
			main.server.broadcast(BroadcastType.NAME, name);
		}
	}
};

/**
 * Initializes some server settings and functions to receive chat messages
 * and names.
 */
Chat.prototype.initServer = function() {
	var self = this;
	BroadcastType.NAME = BroadcastType.index++;
	BroadcastType.CHAT = BroadcastType.index++;
	main.server.names = {};
	main.server.broadcasts[BroadcastType.NAME] = function(resp) {
		var name = self.validateName(resp.data);
		if (name) {
			for (var x in main.server.names) {
				if (main.server.names[x] == name) return false;
			}
			main.server.names[resp.userId] = name;
			self.refresh();
			Cookies.set("name", name, { expires: 7 });
		}
	};
	main.server.broadcasts[BroadcastType.CHAT] = function(resp) {
		self.history[resp.data.date + "_" + resp.userId] = {
			u: resp.userId,
			t: resp.data.message
		};
		self.refresh.apply(self);
	};
	main.server.connects.push(function() {
		if (main.server.name) main.server.broadcast(BroadcastType.NAME, main.server.name);
	});
};

/**
 * Submits and broadcasts the own input. Clears the input.
 */
Chat.prototype.submit = function() {
	var val = this.$input.val(),
		date = main.server.getTime();
	
	if (val.length) {
		if (val.substr(0, 6) == "/name ") {
			main.server.name = this.validateName(val.substr(6));
			if (main.server.name) main.server.broadcast(BroadcastType.NAME, main.server.name);
		} else {
			this.history[date + "_0"] = { u: 0, t: val };
			this.broadcast(date, val);
			this.refresh();
		}
		this.$input.val("");
	}
};

/**
 * Initializes some mouse events to hide the chat while drawing.
 */
Chat.prototype.init = function() {
	var self = this;
	main.board.$board.on("mousedown.chat", function(event) {
		self.hide.apply(self);
	}).on("mouseenter.chat", function(event) {
		if (event.buttons == 1) self.hide.apply(self);
	}).on("mouseup.chat mouseleave.chat", function(event) {
		self.show.apply(self);
	});
};

/**
 * Shows the chat. Adds an opacity transition if the hide time is over 300ms.
 */
Chat.prototype.show = function() {
	if (this.hideTime) {
		if (main.server.getTime() - this.hideTime > 300) {
			this.$chat.css("opacity", 0).show().stop().animate({
				opacity: 1
			}, 1000);
		} else {
			this.$chat.show();
		}
		this.hideTime = 0;
	}
};

/**
 * Hides the chat and remembers, when the chat was hidden.
 */
Chat.prototype.hide = function() {
	this.hideTime = main.server.getTime();
	this.$chat.hide();
};

/**
 * Validates the user name. Checks it before sending and after receiving.
 */
Chat.prototype.validateName = function(name) {
	name = name
		.replace(/^\s+/, "").replace(/\s+$/, "") // remove space at start and end
		.replace(/\s/g, "-") // replace spaces with dash
		.replace(/[^a-zA-Z0-9_-]/g, "") // only this chars are allowed
		.substr(0, 20); // max 20 chars
	if (name == "Me") return false;
	return name;
};

/**
 * Broadcasts a message with the date.
 */
Chat.prototype.broadcast = function(date, msg) {
	main.server.broadcast(BroadcastType.CHAT, {
		date: date,
		message: msg
	});
};

/**
 * Refreshes the history and displays all messages.
 */
Chat.prototype.refresh = function() {
	var keys = Object.keys(this.history), klen = keys.length, limit = 100;
	if (klen > limit) {
		for (var i = 0; i < klen - limit; i++) {
			delete this.history[keys[i]];
		}
	}
	
	// remember scroll position (percentage)
	var maxScroll = this.$history.prop("scrollHeight") - this.$history.innerHeight(),
		scrollPos = maxScroll ? Math.ceil(this.$history.scrollTop() / maxScroll) : 1;
	console.log("scroll percentage: "+(scrollPos * 100)+"%");
	
	this.$history.html("");
	for (var x in this.history) {
		this.$history.append(
			$('<div class="msg" />').append(
				$('<span class="u' + (this.history[x].u ? '' : ' own') + '" />').text(this.history[x].u ? (main.server.names[this.history[x].u] ? main.server.names[this.history[x].u] : this.history[x].u) : "Me"),
				$('<span class="t" />').text(this.history[x].t)
			)
		);
	}
	
	// scroll
	this.$history.scrollTop((this.$history.prop("scrollHeight") - this.$history.innerHeight()) * scrollPos);
};

main.miscs.chat = new Chat();