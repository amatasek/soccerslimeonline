/**
 * Created by Andrew Matasek on 4/27/2015
 * Updated 9/1/2018
 */

require('./statics/settings.js')();

console.log( 'Starting Application:', new Date().toUTCString() );

var express = require( 'express' ),
   app = express(),
   fs = require('fs'),
   path  = require("path");
   
app.http = require( 'http' ).Server( app );
app.io = require( 'socket.io' )( app.http );

app.use( express.static( __dirname + '/client' ) );







var exec = require("child_process").exec;


var isLeftControlled = false;
var isRightControlled = false;
var userControllingLeft = '';
var userControllingRight = '';

// New connection
app.io.on('connection', function(socket){
   
   console.log('A new client connected');
  
   // Notification received
   socket.on('notification', function(msg) {
      
      app.io.emit('notification', msg);
      console.log('notification: ' + msg);

   });
  
  // Message received
  socket.on('chatMessage', function(msg){
	fs.readFile("posts.txt", "utf8", function(error, data) {
		var str = data;
		if (str == "0" || str == "") {
			fs.writeFile("posts.txt", "1|" + msg, function(err) {
			if(err) { return console.log(err); }
			app.io.emit('forceChatRefresh');
			console.log('New posts.txt started');
			});
		} else {
			var strBreak = str.indexOf('|');
			var size = str.substring(0, strBreak);
			size++;
			str = size + str.slice(strBreak) + '|' + msg;
			fs.writeFile("posts.txt", str, function(err) {
				if(err) { return console.log(err); }
			});
		}
	});
	io.emit('chatMessage', msg);
	
  });
  
  // Chat refresh received
  socket.on('chatRefresh', function(msg){
	app.io.emit('clearChat');
	fs.readFile('posts.txt', 'utf8', function(err,data){
		if (err) { return console.log(err);}
		var str = data;
		var strBreak = str.indexOf('|');
		var size = str.substring(0, strBreak);
		str = str.slice(strBreak + 1);
		for (i = 0; i < size - 1; i++) {
			strBreak = str.indexOf('|');
			var thisPost = str.substring(0, strBreak);
			str = str.slice(strBreak + 1);
			app.io.emit('chatMessage', thisPost);
		}
		app.io.emit('chatMessage', str);
	});
  });
  
  // New User message received
  socket.on('newUser', function(msg){
	fs.appendFile('users.txt', "|" + msg, function (err) {
	});
	console.log('new user: ' + msg);
  });
  
  // Delete User message received
  socket.on('deleteUser', function(msg){
		fs.readFile("users.txt", "utf8", function(error, data) {

		//Scan user file for a match
		var oldStr = data;
		var newStr = oldStr.replace("|" + msg, "");
		fs.writeFile("users.txt", newStr, function(err) {
			if(err) { return console.log(err); }
		}); 
	});
	console.log('delete user: ' + msg);
  });
  
  // Logout received
  socket.on('logout', function(msg){
    msg += " has logged out"
    app.io.emit('notification', msg);
	console.log(msg);
  });

   // Login validation and notification
   socket.on('checkLogin', function(msg){
	console.log('Login attempted with these credentials: ' + msg);
	fs.readFile("users.txt", "utf8", function(error, data) {

		//Scan user file for a match
		var match = data.search(msg);
		
		//Prevent two blank fields
		if (msg == ":") {match=-1;}
		
		//Prevent blank password
		var colinPos = msg.search(":");
		if (msg.slice(colinPos, -1) == "") {match=-1;}
		
		if (match == -1) {app.io.emit('checkLogin', 'Login Failed');}
	    else {
			app.io.emit('checkLogin', '1');
			var pos = msg.search(":");
			var justUser = msg.slice(0, pos);
			console.log(justUser + ' has logged in');
			app.io.emit('notification', justUser + ' has logged in');
			if (isLeftControlled){app.io.emit('grantLeft', userControllingLeft);}
			if (isRightControlled){app.io.emit('grantRight', userControllingRight);}
		}
	});
  });
  
  // GAME STUFF BELOW

  // checkLeft received
  socket.on('checkLeft', function(msg){
	isLeftControlled = true;
	userControllingLeft = msg;
	app.io.emit('grantLeft', msg);
	if (isLeftControlled && isRightControlled) {app.io.emit('startGame');}
  });

  // checkRight received
  socket.on('checkRight', function(msg){
	isRightControlled = true;
	userControllingRight = msg;
	app.io.emit('grantRight', msg);
	if (isLeftControlled && isRightControlled) {app.io.emit('startGame');}
  });    
  
  // collision received
  socket.on('collision', function(msg){app.io.emit('collision', msg); });    
  
  // ballLocation received
  socket.on('ballLocation', function(msg){app.io.emit('ballLocation', msg); });

  // leftLocation received
  socket.on('leftLocation', function(msg){app.io.emit('leftLocation', msg);  });

  // rightLocation received
  socket.on('rightLocation', function(msg){app.io.emit('rightLocation', msg); });  
  
  // leftGoal received
  socket.on('leftGoal', function(){app.io.emit('leftGoal'); });   

  // rightGoal received
  socket.on('rightGoal', function(){app.io.emit('rightGoal'); }); 

  // gameover received
  socket.on('gameover', function(msg){app.io.emit('gameover', msg); 
	isLeftControlled = false;
	isRightControlled = false;
	userControllingLeft = '';
	userControllingRight = '';
  });      
  
  // LeftUp received
  socket.on('leftUp', function(){app.io.emit('leftUp');});
  
  // LeftLeft received
  socket.on('leftLeft', function(){app.io.emit('leftLeft');});
  
  // LeftUp received
  socket.on('leftRight', function(){app.io.emit('leftRight');});
 
  // LeftStop received
  socket.on('leftLeftStop', function(){app.io.emit('leftLeftStop');}); 
  
    // LeftStop received
  socket.on('leftRightStop', function(){app.io.emit('leftRightStop');}); 
  
   // RightUp received
  socket.on('rightUp', function(){app.io.emit('rightUp');});
  
  // RightLeft received
  socket.on('rightLeft', function(){app.io.emit('rightLeft');});
  
  // RightUp received
  socket.on('rightRight', function(){app.io.emit('rightRight');});
 
  // RightStop received
  socket.on('rightLeftStop', function(){app.io.emit('rightLeftStop');}); 
  
    // RightStop received
  socket.on('rightRightStop', function(){app.io.emit('rightRightStop');});  
  
});

app.http.listen( SETTINGS.port, function(){
	console.log( 'Navigate your browser to localhost:' + SETTINGS.port );
});