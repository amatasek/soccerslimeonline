module.exports = function(io, client){
   
   client.on('notification', function(notification) {      
      io.emit('notification', notification);
      console.log('notification: ' + notification);
   });
   
};