module.exports = function(io, client){
   
   client.on('match-request', function(info){

      console.log(`User [${info.user}] has requested control of player [${info.player}].`);
   
      io.emit('match-state', GAME);
      
      if (GAME.leftSlime.user && GAME.rightSlime.user){
         console.log(`Request from [${info.user}] to control player [${info.player}] denied becuase both players are in use.`);
         return;
      }
   
      switch (info.player) {
         
         case 1:
            if (info.player == 1 && GAME.leftSlime.user){
               console.log(`Request from [${info.user}] to control player [${info.player}] denied.`);
               return;
            } else {
               GAME.leftSlime.user = info.user;
            }
            break;
   
         case 2:
            if (info.player == 1 && GAME.rightSlime.user){
               console.log(`Request from [${info.user}] to control player [${info.player}] denied.`);
               return;
            } else {
               GAME.rightSlime.user = info.user;
            }
            break;
      
         default:
            break;
      }
   
      console.log(`Request from [${info.user}] to control player [${info.player}] granted.`);
   
      if (GAME.leftSlime.user && GAME.rightSlime.user) {
         
         console.log(`Game between [${GAME.leftSlime.user}] and [${GAME.rightSlime.user}] started at [${new Date().toISOString()}]`);
         GAME.startTime = new Date().getTime();
         
         GameService.tick( io );
      } else {
         io.emit('match-state', GAME);
      }   
   });
   
};