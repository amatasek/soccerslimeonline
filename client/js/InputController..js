var callback = function(){
   // WEB SOCKET
   var socket = io();


   // CONTROL HANDLING
   document.onkeydown = function(evt) {
      evt = evt || window.event;
      if (evt.keyCode == 87 && isControllingLeft) {
         socket.emit('leftUp');
      } else if (evt.keyCode == 87 && isControllingRight) {
         socket.emit('rightUp');
      } else if (evt.keyCode == 65 && isControllingLeft){
         socket.emit('leftLeft');
      } else if (evt.keyCode == 65 && isControllingRight){
         socket.emit('rightLeft');
      } else if (evt.keyCode == 68 && isControllingLeft){
         socket.emit('leftRight');
      } else if (evt.keyCode == 68 && isControllingRight){
         socket.emit('rightRight');
      }
   };

   document.onkeyup = function(evt) {
      evt = evt || window.event;
      if (evt.keyCode == 65 && isControllingLeft){
         socket.emit('leftLeftStop');
      } else if (evt.keyCode == 65 && isControllingRight){
         socket.emit('rightLeftStop');
      } else if (evt.keyCode == 68 && isControllingLeft) {
         socket.emit('leftRightStop');
      } else if (evt.keyCode == 68 && isControllingRight) {
         socket.emit('rightRightStop');
      }
   };
};

if (
   document.readyState === "complete" ||
   (
      document.readyState !== "loading" 
      && 
      !document.documentElement.doScroll
   )
) {
   callback();
} else {
   document.addEventListener("DOMContentLoaded", callback);
}
