module.exports = function(io, client){

   client.on('input', input => {
      console.log(input);
      if (!input.player || !input.user){
         return;
      }
      
      if (input.player === 1 && input.user !== GAME.leftSlime.user){
         return;
      }

      if (input.player === 2 && input.user !== GAME.rightSlime.user){
         return;
      }
      
      const movement = {
         player: input.player,
         move: input.direction
      }; 

      io.emit('movement', movement); 
   });
};