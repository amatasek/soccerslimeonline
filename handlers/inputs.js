module.exports = function(io, client){

   client.on('input', input => {
      console.log(input);
      if (!input.player || !input.user){
         return;
      }
      
      if (input.player === 0 && input.user !== GAME.leftSlime.user){
         return;
      }

      if (input.player === 1 && input.user !== GAME.rightSlime.user){
         return;
      }
      
      const movement = {
         player: input.player,
         move: input.direction,
         position: input.position
      }; 

      io.emit('movement', movement); 
   });
};