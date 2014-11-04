var ArrayUtil = require("./utils/arrayUtil");
var dateFormat = require('dateformat');
var blockedUsername = ["All", "Me"];
console.log(dateFormat(new Date(), "dd-mmm-yyyy hh:MM:ss a"));
module.exports = function(clients, socketsOfClients, io) {

	var userJoined = function(socket, uName) {
		var time = dateFormat(new Date(), "dd-mmm-yyyy hh:MM:ss a");
		socket.broadcast.emit('userJoined', { "userName": uName , "messageTime" : time});		
	};

	var userLeft = function userLeft(uName) {
		var time = dateFormat(new Date(), "dd-mmm-yyyy hh:MM:ss a");
		io.sockets.emit('userLeft', { "userName": uName , "messageTime" : time});
	};

	var joinUser = function(socket, uName) {
	  setTimeout(function() {
		var time = dateFormat(new Date(), "dd-mmm-yyyy hh:MM:ss a");
		console.log('Sending welcome msg to ' + uName + ' at ' + socket.id);
		
		socket.emit('welcome', { "userName" : uName, "messageTime" : time, 
								 "currentUsers": JSON.stringify(Object.keys(clients))});
	  }, 500);
	};

	var userNameAlreadyInUse = function(socket, uName) {
	  setTimeout(function() {
		socket.emit('err', { "userNameInUse" : true });
	  }, 500);
	};
	
	io.sockets.on('connection', function(socket) {
		console.log('sockets connection');
		socket.on('set username', function(userName) {
			console.log('set username' + userName);
			// Is this an existing user name?
			if (!(blockedUsername[userName] === undefined && clients[userName] === undefined)) {
			  // Does not exist ... so, proceed
			  clients[userName] = socket.id;
			  socketsOfClients[socket.id] = userName;
			  joinUser(socket, userName);
			  userJoined(socket, userName);
			} else {
			  userNameAlreadyInUse(socket, userName);
			}
		});

		socket.on('message', function(msg) {
			var srcUser;
			if (msg.inferSrcUser) {
			  // Infer user name based on the socket id
			  srcUser = socketsOfClients[socket.id];
			} else {
			  srcUser = msg.source;
			}
			if (msg.target == "All") {
			  // broadcast
			  var time = dateFormat(new Date(), "dd-mmm-yyyy hh:MM:ss a");
			  io.sockets.emit('message',
				  {"source": srcUser,
				   "message": msg.message,
				   "target": msg.target,
				   "messageTime" : time});
			} else {
			  // Look up the socket id
				var util = new ArrayUtil(io.sockets.sockets);
				var recv = util.objectFindByKey(clients[msg.target]);
				var time = dateFormat(new Date(), "dd-mmm-yyyy hh:MM:ss a");
				if (recv) {
					recv.emit('message', {"source": srcUser, "message": msg.message, 
										  "target": msg.target, 
										  "messageTime" : time});
					socket.emit('message', {"source": srcUser, "message": msg.message, 
											"target": msg.target, "messageTime" : time});
				} else {
					socket.emit('err', {"message" : "User not avialable", 
										"messageTime" : time});
				}
			}
		})

		socket.on('disconnect', function() {
			
			var uName = socketsOfClients[socket.id];
			delete socketsOfClients[socket.id];
			delete clients[uName];
			// relay this message to all the clients
			userLeft(uName);
		})
	})

}