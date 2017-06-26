/*jshint esversion: 6 */

var channel = `archonthewizard`;
var channelBot = `ttdbot`;

const AWAITING_OAUTH = 0;
const LOGGING_IN = 1;
const LOGGED_IN = 2;
const FINISHED_INITIALIZING = 3;

const TIME_BEFORE_TIMEOUT_MS = 8000;

const ERROR_TIMEOUT = 100;
const ERROR_WRONG_OAUTH = 101;
const ERROR_WRONG_OAUTH_FORMAT = 102;

var player1State = AWAITING_OAUTH;
var player2State = AWAITING_OAUTH;
var player3State = AWAITING_OAUTH;

var loginTimeout1;
var loginTimeout2;
var loginTimeout3;

var sendThroughWhisper = false;

document.addEventListener(`DOMContentLoaded`, function (event) {
    var _selector = document.querySelector(`input[name=whisperCheckbox]`);
    _selector.addEventListener(`change`, function (event) {
      if (_selector.checked) {
		    	sendThroughWhisper = true;
		  	} else {
		    	sendThroughWhisper = false;
		  	}
    });
});

function messageManager (message, ws){
	var newMessage = `!`.concat(message);
	if(sendThroughWhisper === true){
		sendWhisper(newMessage, ws);
	} else {
		sendMessage(newMessage, ws);
	}
}

function sendMessage (message, ws){
	ws.send(`PRIVMSG #` + channel + ` :` + message);
}

function sendWhisper (message, ws){
	ws.send(`PRIVMSG #` + channel + ` :/w ` + channelBot + ` ` + message);
}

function getClassRanks (ws){
	sendWhisper(`!specs`, ws);
}

function setClassRanks (playerID, playerNick, msg){
	msg = msg.substring(msg.indexOf(`[`));
	msg = msg.replace(/] /g, ``);
	//Replace last element of array which doesn't have a whitespace after `]`
	msg = msg.replace(`]`, ``);
	var classRanksArray = msg.split(`[`);
	//Ignore position 0 as it's an empty string
	document.getElementById(`archerRank` + playerID).innerHTML = classRanksArray[1];
	document.getElementById(`rogueRank` + playerID).innerHTML = classRanksArray[2];
	document.getElementById(`firemageRank` + playerID).innerHTML = classRanksArray[3];
	document.getElementById(`frostmageRank` + playerID).innerHTML = classRanksArray[4];
	document.getElementById(`alchemistRank` + playerID).innerHTML = classRanksArray[5];
	document.getElementById(`bardRank` + playerID).innerHTML = classRanksArray[6];
	document.getElementById(`highpriestRank` + playerID).innerHTML = classRanksArray[7];

	document.getElementById(`loadingClasses` + playerID).style.display = `none`;
	document.getElementById(`classSelect` + playerID).style.display = `inline-block`;

	switch (playerID) {
		case 1:
			player1State = 3;
			clearTimeout(loginTimeout1);
			break;
		case 2:
			player2State = 3;
			clearTimeout(loginTimeout2);
			break;
		case 3:
			player3State = 3;
			clearTimeout(loginTimeout3);
			break;
	}
}

function loginError (playerID, errorID) {
	switch (playerID) {
		case 1:
			clearTimeout(loginTimeout1);
			break;
		case 2:
			clearTimeout(loginTimeout2);
			break;
		case 3:
			clearTimeout(loginTimeout3);
			break;
	}

	if (errorID === ERROR_TIMEOUT) {
		document.getElementById(`loadingClassesErrorMessage` + playerID).innerHTML =
			`Something is taking too long, did you type in your Twitch username correctly?`;
		document.getElementById(`loadingClassesTooLong` + playerID).style.display = `block`;
	}

	if (errorID === ERROR_WRONG_OAUTH) {
		document.getElementById(`loadingClassesErrorMessage` + playerID).innerHTML =
			`The OAuth you entered is incorrect, please try again.`;
		document.getElementById(`loadingClassesTooLong` + playerID).style.display = `block`;
	}

	if (errorID === ERROR_WRONG_OAUTH_FORMAT) {
		document.getElementById(`loadingClassesErrorMessage` + playerID).innerHTML =
			`The OAuth you entered is badly formatted, please remember it requires the "oauth:" prefix followed by the private key. Simply copy and paste it from the link provided.`;
		document.getElementById(`loadingClassesTooLong` + playerID).style.display = `block`;
	}
}

function errorBack(playerID) {
	switch (playerID) {
		case 1:
			clearTimeout(loginTimeout1);
			break;
		case 2:
			clearTimeout(loginTimeout2);
			break;
		case 3:
			clearTimeout(loginTimeout3);
			break;
	}

	document.getElementById(`loadingClassesErrorMessage` + playerID).innerHTML = `Error Message`;
	document.getElementById(`loadingClassesTooLong` + playerID).style.display = `none`;
	document.getElementById(`loadingClasses` + playerID).style.display = `none`;
	document.getElementById(`oauth` + playerID).style.display = `block`;
}

function classSelectButtonClicked(buttonID){
	var playerID = buttonID.charAt(buttonID.length - 1);
	var className = buttonID.substring(0, buttonID.indexOf(`Rank`));
	// TODO: Find a better way of getting WebSocket than making it global.
	messageManager(className, getWebSocket(+playerID));

	document.getElementById(`classSelect` + playerID).style.display = `none`;
	document.getElementById(`playBoard` + playerID).style.display = `grid`;
}

function playBoardButtonClicked(buttonID){
	var playerID = Number(buttonID.charAt(buttonID.length - 1));
	var actionID = buttonID.substring(0, buttonID.length - 1);

	if(actionID.includes(`tower`)){messageManager(actionID.substring(5, actionID.length), getWebSocket(playerID));}
  if(actionID.includes(`powerUp`)){messageManager(`p`, getWebSocket(playerID));}
  if(actionID.includes(`powerDown`)){messageManager(`pd`, getWebSocket(playerID));}
  if(actionID.includes(`train`)){messageManager(`t`, getWebSocket(playerID));}
  if(actionID.includes(`altar`)){messageManager(`a`, getWebSocket(playerID));}
  if(actionID.includes(`leave`)){messageManager(`leave`, getWebSocket(playerID));}
}

function twitchChatConnectionManager(playerID, playerNick, received_msg) {
	console.log(`Player ` + playerID + `: ` + received_msg); //Testing

	if(received_msg.includes(`:tmi.twitch.tv ROOMSTATE`)){
		getClassRanks(getWebSocket(playerID));
	}

	if(received_msg.includes(channelBot + `.tmi.twitch.tv WHISPER ` + playerNick +` :[Rank `)) {
		setClassRanks(playerID, playerNick, received_msg);
	}

	if(received_msg.includes(`Login authentication failed`)) {
		loginError(playerID, ERROR_WRONG_OAUTH);
	}

	if(received_msg.includes(`Improperly formatted auth`)) {
		loginError(playerID, ERROR_WRONG_OAUTH_FORMAT);
	}

	if(received_msg.lastIndexOf(`PING`, 0) === 0) {
		getWebSocket(playerID).send(`PONG :irc.twitch.tv`);
	}
}

function oauth1 (){
	player1State = LOGGING_IN;

	document.getElementById(`oauth1`).style.display = `none`;
	document.getElementById(`loadingClasses1`).style.display = `block`;

	var ws1 = new WebSocket(`wss://irc-ws.chat.twitch.tv:443/irc`);

	var oauth = document.getElementById(`twitchoauth1`).value;
	var nick = document.getElementById(`twitchusername1`).value.toLowerCase();

	ws1.onopen = function() {
		ws1.send(`CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership`);
		ws1.send(`PASS ` + oauth);
		ws1.send(`NICK ` + nick);
		ws1.send(`JOIN ` + channel);
	};

	loginTimeout1 = setTimeout(loginError, TIME_BEFORE_TIMEOUT_MS, 1, ERROR_TIMEOUT);

	ws1.onmessage = function (evt) {
		twitchChatConnectionManager(1, nick, evt.data);
	};
	window.ws1 = ws1;
}

function oauth2 (){
	player2State = LOGGING_IN;

	document.getElementById(`oauth2`).style.display = `none`;
	document.getElementById(`loadingClasses2`).style.display = `block`;

	var ws2 = new WebSocket(`wss://irc-ws.chat.twitch.tv:443/irc`);

	var oauth = document.getElementById(`twitchoauth2`).value;
	var nick = document.getElementById(`twitchusername2`).value.toLowerCase();

	ws2.onopen = function() {
		ws2.send(`CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership`);
		ws2.send(`PASS ` + oauth);
		ws2.send(`NICK ` + nick);
		ws2.send(`JOIN ` + channel);
	};

	loginTimeout2 = setTimeout(loginError, TIME_BEFORE_TIMEOUT_MS, 2, ERROR_TIMEOUT);

	ws2.onmessage = function (evt) {
		twitchChatConnectionManager(2, nick, evt.data);
	};
	window.ws2 = ws2;
}

function oauth3 (){
	player3State = LOGGING_IN;

	document.getElementById(`oauth3`).style.display = `none`;
	document.getElementById(`loadingClasses3`).style.display = `block`;

	var ws3 = new WebSocket(`wss://irc-ws.chat.twitch.tv:443/irc`);

	var oauth = document.getElementById(`twitchoauth3`).value;
	var nick = document.getElementById(`twitchusername3`).value.toLowerCase();

	ws3.onopen = function() {
		ws3.send(`CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership`);
		ws3.send(`PASS ` + oauth);
		ws3.send(`NICK ` + nick);
		ws3.send(`JOIN ` + channel);
	};

	loginTimeout3 = setTimeout(loginError, TIME_BEFORE_TIMEOUT_MS, 3, ERROR_TIMEOUT);

	ws3.onmessage = function (evt) {
		twitchChatConnectionManager(3, nick, evt.data);
	};
	window.ws3 = ws3;
}

function getWebSocket(playerID) {
	switch (playerID) {
		case 1:
			return window.ws1;
		case 2:
			return window.ws2;
		case 3:
			return window.ws3;
	}
}
