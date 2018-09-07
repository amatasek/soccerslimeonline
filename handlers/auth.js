module.exports = function(io, client, fs){
   
   client.on('auth-login', function(creds){
   
      const credStr = `${creds.user}:${creds.pass}`;
      
      console.log(`Login attempted with credentials: [${credStr}]`);
      
      fs.readFile("users.txt", "utf8", function(error, data) {
   
         //Scan user file for a match
         var match = data.search(credStr);
         
         //Prevent two blank fields
         if (credStr == ":") {match=-1;}
         
         //Prevent blank password
         var colinPos = credStr.search(":");
         
         if (credStr.slice(colinPos, -1) == "") {
            match=-1;
         }
         
         if (match == -1) {
            console.log(`Log in denied for user [${creds.user}].`);
            client.emit('app-login', 'Login failed.');
            return;
         }
   
         client.emit('app-login', null);
   
         console.log(`[${creds.user}] has successfully logged in.`);
   
         io.emit('notification', `${creds.user} logged in.`);
         
         io.emit('game-state', GAME);
      });

   });

   client.on('auth-logout', function(user){
   
      console.log(`User [${user}] is logging out.`);
      
      io.emit('notification', `${user} has logged out.`);
   });
   
};