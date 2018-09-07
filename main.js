/**
 * Created by Andrew Matasek on 4/27/2015
 * Updated 9/1/2018
 */

require('./statics/settings.js')();
require('./statics/game.js')();

console.log( `Application starting at [${new Date().toUTCString()}].`);

const express = require( 'express' ),
      app = express(),
      http = require( 'http' ).Server( app ),
      io = require( 'socket.io' )( http ),
      fs = require('fs'),
      mongoClient = require('mongodb').MongoClient,
      assert = require('assert');

require( './services/GameService.js' )( io );

app.use( express.static( __dirname + '/client' ) );

mongoClient.connect(SETTINGS.url, function(err, client) {
   assert.equal(null, err);
   console.log( `Mongo connected at [${new Date().toUTCString()}].`);
 
   const db = client.db(SETTINGS.dbName);
 
   client.close();
});

http.listen( SETTINGS.port, function(){
	console.log( 'Navigate your browser to localhost:' + SETTINGS.port );
});

io.on( 'connection', function( client ){
   console.log(`Client with id: [${client.id}] connected.`);
   
   require( './handlers/auth.js' )( io, client, fs );
   require( './handlers/match.js' )( io, client );
   require( './handlers/inputs.js' )( io, client );
   require( './handlers/notifications.js' )( io, client );
   console.log( 'Handlers registered.' );   
  
  // collision received
  client.on('collision', function(msg){io.emit('collision', msg); });    
  
  // ballLocation received
  client.on('ballLocation', function(msg){io.emit('ballLocation', msg); });

  // leftLocation received
  client.on('leftLocation', function(msg){io.emit('leftLocation', msg);  });

  // rightLocation received
  client.on('rightLocation', function(msg){io.emit('rightLocation', msg); });  
  
  // leftGoal received
  client.on('leftGoal', function(){io.emit('leftGoal'); });   

  // rightGoal received
  client.on('rightGoal', function(){io.emit('rightGoal'); }); 

  // gameover received
  client.on('gameover', function(msg){io.emit('gameover', msg); 
   GAME.leftSlime.user = null;
   GAME.rightSlime.user = null;
  });      
  
    
  
});

