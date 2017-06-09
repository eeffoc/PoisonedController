var channel = 'archonthewizard';
var channelBot = "TTDBot";

function sendMessage (message, ws){
	ws.send('PRIVMSG #' + channel + ' :' + message);
}

function sendWhisper (message, ws){
	ws.send('PRIVMSG #' + channel + ' :/w ' + channelBot + " " + message);
}

function oauth1 (){
	var ws1 = new WebSocket('wss://irc-ws.chat.twitch.tv:443/irc');

	var oauth = document.getElementById("twitchoauth1").value;
	var nick = document.getElementById("twitchusername1").value.toLowerCase();
	
	ws1.onopen = function() {
	console.log("connecting");
	ws1.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
	ws1.send('PASS ' + oauth);
	ws1.send('NICK ' + nick);
	ws1.send('JOIN ' + channel);
	};

	ws1.onmessage = function (evt) { 
		var received_msg = evt.data;
		console.log(received_msg); //Testing
		if(received_msg.lastIndexOf('PING', 0) === 0) {
		ws1.send('PONG :irc.twitch.tv');
		}
	};
}