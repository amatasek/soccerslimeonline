module.exports = function () {   
   this.SETTINGS = {
      
      // Global
      debugging: true,

      // HTTP
      port: 3000,

      // Data
      url: 'mongodb://localhost:27017',
      dbName: 'sso-dev',
      
      // Game
      tickRate: 1000
   }

   console.log('Initializing SETTINGS:', this.SETTINGS);
};