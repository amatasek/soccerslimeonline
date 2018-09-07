var publix = {};

publix.tick = function( io ) {
   console.log('tick');

   io.emit('match-state', GAME);

	(async function tickerson() {
      if (!GAME.leftSlime.user || !GAME.leftSlime.user || !GAME.startTime){
         console.log('Ticking stopped.');
         return;
      }
	   //setTimeout(f => publix.tick(socket), SETTINGS.tickRate);
	})();
}

module.exports = function(){
    this.GameService = publix;
};
