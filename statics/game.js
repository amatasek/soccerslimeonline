module.exports = function () {   
   
   this.GAME = {
      startTime: null,
      leftSlime: {
         user: null,
         color: 'pink'
      },
      rightSlime: {
         user: null,
         color: 'lime'
      }     
   }

   console.log('Initializing GAME:', this.GAME);
};