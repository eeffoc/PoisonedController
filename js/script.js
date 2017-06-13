var channel = 'archonthewizard';
var channelBot = "ttdbot";

var joinedChannelBool1 = false;
var joinedChannelBool2 = false;
var joinedChannelBool3 = false;

var sendThroughWhisper = false;

function messageManager (message, ws){
	var newMessage = "!".concat(message);
	if(sendThroughWhisper == true){
		sendWhisper(newMessage, ws);
	} else {
		sendMessage(newMessage, ws);
	}
}

function sendMessage (message, ws){
	ws.send('PRIVMSG #' + channel + ' :' + message);
}

function sendWhisper (message, ws){
	ws.send('PRIVMSG #' + channel + ' :/w ' + channelBot + " " + message);
}

function getClassRanks (ws){
	sendWhisper("!specs", ws);
}

function showClasesRanks (playerID){
	document.getElementById("loadingClasses" + playerID).style.display = "none";
	document.getElementById("classSelect" + playerID).style.display = "inline-block";
}

function setClassRanks (playerID, playerNick, msg){
	if(msg.indexOf(channelBot + ".tmi.twitch.tv WHISPER " + playerNick +" :[Rank ") != -1){
		msg = msg.substring(msg.indexOf("["));
		msg = msg.replace(/] /g, "");
		msg = msg.replace("]", ""); //Last element of array which doesn't have a " " after "]"
		var classRanksArray = msg.split('[');
		//Ignore position 0 as it's an empty string
		document.getElementById("archerRank" + playerID).innerHTML = classRanksArray[1];
		document.getElementById("rougeRank" + playerID).innerHTML = classRanksArray[2];
		document.getElementById("firemageRank" + playerID).innerHTML = classRanksArray[3];
		document.getElementById("frostmageRank" + playerID).innerHTML = classRanksArray[4];
		document.getElementById("alchemistRank" + playerID).innerHTML = classRanksArray[5];
		document.getElementById("bardRank" + playerID).innerHTML = classRanksArray[6];
		document.getElementById("highpriestRank" + playerID).innerHTML = classRanksArray[7];
		showClasesRanks(playerID);
	}
}

function joinedChannel (playerID, msg, ws){
	if(msg.indexOf("ROOMSTATE") != -1){
		switch (playerID) {
			case 1:
				joinedChannelBool1 = true;
				break;
			case 2:
				joinedChannelBool2 = true;
				break;
			case 3:
				joinedChannelBool3 = true;
				break;
		}
		getClassRanks(ws);
		console.log("joinedchannel true");
	}
}

function classSelectButtonClicked(buttonID){
	var playerID = buttonID.charAt(buttonID.length - 1);
	var className = buttonID.substring(0, buttonID.indexOf("Rank"));
	// TODO: Find a better way of getting WebSocket than making it global.
	switch (+playerID) {
		case 1:
			var wsGlobal1 = window.ws1;
			messageManager(className, wsGlobal1);
			break;
		case 2:
			var wsGlobal2 = window.ws2;
			messageManager(className, wsGlobal2);
			break;
		case 3:
			var wsGlobal3 = window.ws3;
			messageManager(className, wsGlobal3);
			break;
	}
	document.getElementById("classSelect" + playerID).style.display = "none";
	document.getElementById("playBoard" + playerID).style.display = "grid";
}

function oauth1 (){
	document.getElementById("oauth1").style.display = "none";
	document.getElementById("loadingClasses1").style.display = "block";

	var ws1 = new WebSocket('wss://irc-ws.chat.twitch.tv:443/irc');
	window.ws1 = ws1;
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
		console.log("Player 1: " + received_msg); //Testing

		if(joinedChannelBool1 == true){setClassRanks(1, nick, received_msg);
		} else {joinedChannel(1, received_msg, ws1);}

		if(received_msg.lastIndexOf('PING', 0) === 0) {
			ws1.send('PONG :irc.twitch.tv');
		}
	};
}

function oauth2 (){
	document.getElementById("oauth2").style.display = "none";
	document.getElementById("loadingClasses2").style.display = "block";

	var ws2 = new WebSocket('wss://irc-ws.chat.twitch.tv:443/irc');
	window.ws2 = ws2;

	var oauth = document.getElementById("twitchoauth2").value;
	var nick = document.getElementById("twitchusername2").value.toLowerCase();

	ws2.onopen = function() {
		console.log("connecting");
		ws2.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
		ws2.send('PASS ' + oauth);
		ws2.send('NICK ' + nick);
		ws2.send('JOIN ' + channel);
	};

	ws2.onmessage = function (evt) {
		var received_msg = evt.data;
		console.log("Player 2: " + received_msg); //Testing

		if(joinedChannelBool2 == true){setClassRanks(2, nick, received_msg);}
		else {joinedChannel(2, received_msg, ws2);}

		if(received_msg.lastIndexOf('PING', 0) === 0) {
			ws2.send('PONG :irc.twitch.tv');
		}
	};
}

function oauth3 (){
	document.getElementById("oauth3").style.display = "none";
	document.getElementById("loadingClasses3").style.display = "block";

	var ws3 = new WebSocket('wss://irc-ws.chat.twitch.tv:443/irc');
	window.ws3 = ws3;

	var oauth = document.getElementById("twitchoauth3").value;
	var nick = document.getElementById("twitchusername3").value.toLowerCase();

	ws3.onopen = function() {
		console.log("connecting");
		ws3.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
		ws3.send('PASS ' + oauth);
		ws3.send('NICK ' + nick);
		ws3.send('JOIN ' + channel);
	};

	ws3.onmessage = function (evt) {
		var received_msg = evt.data;
		console.log("Player 3: " + received_msg); //Testing

		if(joinedChannelBool3 == true){setClassRanks(3, nick, received_msg);}
		else {joinedChannel(3, received_msg, ws3);}

		if(received_msg.lastIndexOf('PING', 0) === 0) {
			ws3.send('PONG :irc.twitch.tv');
		}
	};
}
