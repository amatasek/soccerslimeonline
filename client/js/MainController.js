
 window.onload = function(){
   window.requestAnimFrame = function(){
      return (
          window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(callback){
              window.setTimeout(callback, 1000 / 60);
          }
      );
   }();

   /*
   ***************TOP LEVEL VARIABLES****************
   */ 

   var socket = io();

   let runAnimation = false;
   
   var canvas = document.getElementById('app-canvas');
   var context = canvas.getContext('2d');

   var isControllingLeft = false;
   var isControllingRight = false;

   var score = {
      left: 0,
      right: 0,
      winner: ''
   };

   let ball = {
      DEFAULTX: 450,
      DEFAULTY: 100,
      x: 0,
      y: 0,
      r: 15,
      vertS: 0,
      horzS: 0,
      color: 'yellow'
   };   

   let slimes = [
      {
         DEFAULTX: 300,
         DEFAULTY: 300,
         x: 0,
         y: 0,
         r: 40,
         vertS: 0,
         horzS: 0,
         color: 'white'
      },
      {
         DEFAULTX: 600,
         DEFAULTY: 300,
         x: 0,
         y: 0,
         r: 40,
         vertS: 0,
         horzS: 0,
         color: 'white'
      }
   ];
   
   // Move to default positions
   ball.x = ball.DEFAULTX;
   ball.y = ball.DEFAULTY;
   
   for (let slime of slimes){
      slime.x = slime.DEFAULTX;
      slime.y = slime.DEFAULTY
   }

   const sceneVars = {
      fieldHeight: 100,
      goalHeight: 100,
      goalDepth: 50
   };   

   /*
   * Scene defitions
   */

   function drawBall(ball, context) {
      context.beginPath();
      context.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI, false);
      context.fillStyle = ball.color;
      context.fill();
      context.lineWidth = 1;
      context.strokeStyle = '#003300';
      context.stroke();
   }

   function drawSlimes(slimes, context) {
      for (let slime of slimes){
         context.beginPath();
         context.arc(slime.x, slime.y, slime.r, 0, Math.PI, true);
         context.closePath();
         context.lineWidth = 1;
         context.fillStyle = slime.color;
         context.fill();
         context.strokeStyle = '#550000';
         context.stroke();
      }      
   }

   function drawScene(sceneVars, context) {
      // field
      context.beginPath();
      context.rect(0, canvas.height - sceneVars.fieldHeight, canvas.width, sceneVars.fieldHeight);
      context.fillStyle = 'green';
      context.fill();

      //left goal
      context.beginPath();
      context.rect(0, canvas.height - sceneVars.fieldHeight - sceneVars.goalHeight, sceneVars.goalDepth, sceneVars.goalHeight);
      context.fillStyle = 'grey';
      context.fill();

      //right goal
      context.beginPath();
      context.rect(canvas.width - sceneVars.goalDepth, canvas.height - sceneVars.fieldHeight - sceneVars.goalHeight, sceneVars.goalDepth, sceneVars.goalHeight);
      context.fillStyle = 'grey';
      context.fill();		
   }

   // Initial draw
   drawScene(sceneVars, context);
   drawBall(ball, context);
   drawSlimes(slimes, context);


   /*
   **************GAME LOGIC***************
   */	
   function animate(lastTime) {
   
      if(runAnimation) {
         const time = new Date().getTime(),
            timeDiff = time - lastTime;
            gravA = -15;
         
         // Apply gravity to slimes and ball
         
         if (ball.vertS > -500) {ball.vertS = ball.vertS + gravA;}
         
         if (slimes[0].vertS != 0) {
            if (slimes[0].vertS > -300) {slimes[0].vertS = slimes[0].vertS + gravA;}
         }
         
         if (slimes[1].vertS != 0) {
            if (slimes[1].vertS > -300) {slimes[1].vertS = slimes[1].vertS + gravA;}
         }

         var ballLinearVertDistEachFrame = ball.vertS * timeDiff / 1000;
         var ballLinearHorzDistEachFrame = ball.horzS * timeDiff / 1000;
         var leftLinearVertDistEachFrame = slimes[0].vertS * timeDiff / 1000;
         var leftLinearHorzDistEachFrame = slimes[0].horzS * timeDiff / 1000;
         var rightLinearVertDistEachFrame = slimes[1].vertS * timeDiff / 1000;
         var rightLinearHorzDistEachFrame = slimes[1].horzS * timeDiff / 1000;

         // Move ball
         if (ball.y <= canvas.height - sceneVars.fieldHeight - ball.r) {
            ball.y = ball.y - ballLinearVertDistEachFrame;
         } else {
            if (ball.vertS < 0) {ball.vertS = ball.vertS * -.8;}
            ball.horzS = ball.horzS * .8;
            ballLinearVertDistEachFrame = ball.vertS * timeDiff / 1000;
            ball.y = ball.y - ballLinearVertDistEachFrame;
         }
         // Horizontal Movement
         if (ball.x > ball.r - 1 && ball.x < canvas.width - ball.r + 1) {
            ball.x = ball.x + ballLinearHorzDistEachFrame;
         }
         if (ball.x > canvas.width - ball.r){
            ball.horzS = ball.horzS * -.8;
            ballLinearHorzDistEachFrame = ball.horzS * timeDiff / 1000;
            ball.x = ball.x + ballLinearHorzDistEachFrame;
         } 
         if (ball.x < ball.r){
            ball.horzS = ball.horzS * -.8;
            ballLinearHorzDistEachFrame = ball.horzS * timeDiff / 1000;
            ball.x = ball.x + ballLinearHorzDistEachFrame;
         }
         
         
         // Move Left Slime
         
         // Vertical Movement
         if (slimes[0].y <= canvas.height - sceneVars.fieldHeight) {
            slimes[0].y = slimes[0].y - leftLinearVertDistEachFrame;
         } else {
            slimes[0].vertS = 0;
            slimes[0].y = canvas.height - sceneVars.fieldHeight;
         }
         
         // Horizontal Movement
         if (slimes[0].x > slimes[0].r - 1 && slimes[0].x < canvas.width - slimes[0].r + 1) {
            slimes[0].x = slimes[0].x + leftLinearHorzDistEachFrame;
         }
         if (slimes[0].x > canvas.width - slimes[0].r){
            slimes[0].x = canvas.width - slimes[0].r;
            slimes[0].horzS = 0;
         } 
         if (slimes[0].x < slimes[0].r){
            slimes[0].x = slimes[0].r;
            slimes[0].horzS = 0;
         }

         // Move Right Slime
         if (slimes[1].y <= canvas.height - sceneVars.fieldHeight) {
            slimes[1].y = slimes[1].y - rightLinearVertDistEachFrame;
         } else {
            slimes[1].vertS = 0;
            slimes[1].y = canvas.height - sceneVars.fieldHeight;
         }
         
         if (slimes[1].x > slimes[1].r - 1 && slimes[1].x < canvas.width - slimes[1].r + 1) {
            slimes[1].x = slimes[1].x + rightLinearHorzDistEachFrame;
         }
         if (slimes[1].x > canvas.width - slimes[1].r){
            slimes[1].x = canvas.width - slimes[1].r;
            slimes[1].horzS = 0;
         } 
         if (slimes[1].x < slimes[1].r){
            slimes[1].x = slimes[1].r;
            slimes[1].horzS = 0;
         }	
         
         //Collision Detection
         
         // Left slime collision
         if (isControllingLeft) {
            // If ball in above bottom of slime
            if (ball.y <= slimes[0].y) {
               // If edges are touching
               var riseSquared = Math.pow(slimes[0].y - ball.y, 2);
               var runSquared = Math.pow(ball.x - slimes[0].x, 2);
               var distance = Math.sqrt(riseSquared + runSquared);
               if (distance <= slimes[0].r + ball.r) {
                  // Calculate force
                  var vertVelSquared = Math.pow(slimes[0].vertS, 2);
                  var horzVelSquared = Math.pow(slimes[0].horzS, 2);
                  var collisionForce = Math.sqrt(vertVelSquared + horzVelSquared);
                  var ballVertVelSquared = Math.pow(ball.vertS, 2);
                  var ballHorzVelSquared = Math.pow(ball.horzS, 2);
                  collisionForce = collisionForce + Math.sqrt(ballVertVelSquared + ballHorzVelSquared);
                  // Calculate angle
                  var collisionRads = Math.atan((ball.x - slimes[0].x) / (slimes[0].y - ball.y));
                  // Send Collision info
                  socket.emit('collision', collisionForce + '|' + collisionRads);
                  
                  // Update ball and left positions
                  var roundX = Math.round(ball.x);
                  var roundY = Math.round(ball.y);
                  socket.emit('ballLocation', roundX + '|' + roundY);
                  roundX = Math.round(slimes[0].x);
                  roundY = Math.round(slimes[0].y);
                  socket.emit('leftLocation', roundX + '|' + roundY);
               }
            }
         }

         // Right slime collision
         if (isControllingRight) {
            // If ball in above bottom of slime
            if (ball.y <= slimes[1].y) {
               // If edges are touching
               var riseSquared = Math.pow(slimes[1].y - ball.y, 2);
               var runSquared = Math.pow(ball.x - slimes[1].x, 2);
               var distance = Math.sqrt(riseSquared + runSquared);
               if (distance <= slimes[1].r + ball.r) {
                  // Calculate force
                  var vertVelSquared = Math.pow(slimes[1].vertS, 2);
                  var horzVelSquared = Math.pow(slimes[1].horzS, 2);
                  var collisionForce = Math.sqrt(vertVelSquared + horzVelSquared);
                  var ballVertVelSquared = Math.pow(ball.vertS, 2);
                  var ballHorzVelSquared = Math.pow(ball.horzS, 2);
                  collisionForce = collisionForce + Math.sqrt(ballVertVelSquared + ballHorzVelSquared);
                  // Calculate angle
                  var collisionRads = Math.atan((ball.x - slimes[1].x) / (slimes[1].y - ball.y));
                  // Send Collision info
                  socket.emit('collision', collisionForce + '|' + collisionRads);
                  
                  // Update ball and right position
                  var roundX = Math.round(ball.x);
                  var roundY = Math.round(ball.y);
                  socket.emit('ballLocation', roundX + '|' + roundY);
                  roundX = Math.round(slimes[1].x);
                  roundY = Math.round(slimes[1].y);
                  socket.emit('rightLocation', roundX + '|' + roundY);
               }
            }
         }	
         
         //Goal Detection
         
         // Left slime goal (right goal)
         if (isControllingLeft) {
            // If ball is in the goal
            if (ball.x > canvas.width - sceneVars.goalDepth + ball.r && ball.y > canvas.height - sceneVars.fieldHeight - sceneVars.goalHeight + ball.r) {
               socket.emit('leftGoal');
            }
         }

         // Right slime goal (left goal)
         if (isControllingRight) {
            // If ball is in the goal
            if (ball.x < sceneVars.goalDepth - ball.r && ball.y > canvas.height - sceneVars.fieldHeight - sceneVars.goalHeight + ball.r) {
               socket.emit('rightGoal');
            }
         }	
         
         // draw
         context.clearRect(0, 0, canvas.width, canvas.height);
         drawScene(sceneVars, context);
         drawBall(ball, context);
         drawSlimes(slimes, context);

         // request new frame
         requestAnimFrame(function() {
            animate(time);
         });
      }
   }
      
   

   /*
   * Inputs
   */

   function input(direction){
      
      const player = isControllingLeft ? 0
         : isControllingRight ? 1
         : null;
            
      if (!player){
         return;
      }

      const input = {
         user: document.getElementById('login-user').value,
         player: player,
         direction: direction,
         position: {
            x: slimes[player].x,
            y: slimes[player].y
         }
      }

      console.log(`User input: [${input}].`);

      socket.emit('input', input);
   }

   document.getElementById('app-right').addEventListener('click', fn => input('Right'));
   document.getElementById('app-up').addEventListener('click', fn => input('Up'));
   document.getElementById('app-left').addEventListener('click', fn => input('Left'));

   document.onkeydown = function(evt) {     
      evt = evt || window.event;

      let direction = null;
      
      switch (event.keyCode) {         
         case 87:
         case 38:
            direction = 'Up';
            break;
         case 65:
         case 37:
            direction = 'Left';
            break;
         case 68:
         case 39:
            direction = 'Right';
            break;
         default:
            break;
      }      

      if (direction){
         input(direction);
      }
   };

   document.onkeyup = function(evt) { 
      evt = evt || window.event;

      let direction = null;
      
      switch (event.keyCode) {         
         case 87:
         case 38:
            irection = 'Up';
            break;
         case 65:
         case 37:
            direction = 'Left';
            break;
         case 68:
         case 39:
            direction = 'Right';
            break;
         default:
            break;
      }

      if (direction){
         input(`${direction}Stop`);
      }
   };

   function login() {
      
      const creds = {
         user: document.getElementById('login-user').value,
         pass: document.getElementById('login-pass').value,
      }

      console.log(`Attempting log in as user [${creds.user}].`);
      
      socket.emit('auth-login', creds);
      document.getElementById('app-login').addEventListener('click', login);
   };

   function logout() {
      
      const user = document.getElementById('login-user').value;
      
      console.log(`Logging out ${user}.`);
      
      socket.emit('auth-logout', user);
            
      document.getElementById('app-login').style.display = 'block';
      document.getElementById('app-main').style.display = 'none';
   };

   function requestGame(player) {

      const user = document.getElementById('login-user').value;
      
      console.log(`Requesting player ${player} as ${user}.`);

      socket.emit('match-request', {
         user: user,
         player: player
      });
   };   

   document.getElementById('app-request-left').addEventListener('click', fn => requestGame(0));
   document.getElementById('app-request-right').addEventListener('click', fn => requestGame(1));
   document.getElementById('app-login').addEventListener('click', fn => login());
   document.getElementById('app-logout').addEventListener('click', fn => logout());   
   
   socket.on('app-login', function(err){

      if (err) {
         $('#errorMessages').append($('<li>').text(err));
         return;               
      }

      document.getElementById('app-login').style.display = 'none';
      document.getElementById('app-main').style.display = 'block';

      console.log('Logged in.')
   });
   
   socket.on('match-state', function(info){
      
      console.log('MS', info);

      slimes[0].color = info.leftSlime.color || 'white';
      slimes[1].color = info.rightSlime.color || 'white';
      
      const user = document.getElementById('login-user').value;

      let leftOverlay = document.getElementById('overlay-left'),
         rightOverlay = document.getElementById('overlay-right'),
         leftRequest = document.getElementById('app-request-left'),
         rightRequest = document.getElementById('app-request-right');
                     
      isControllingLeft = info.leftSlime.user == user;
      isControllingRight = info.rightSlime.user == user;
      
      leftOverlay.style.borderColor = slimes[0].color;
      leftOverlay.innerText = info.leftSlime.user || 'Player 1 Available';

      leftRequest.style.borderColor = info.player1color;
      leftRequest.style.display = 
         info.leftSlime.user
         || 
         isControllingRight
         ||
         info.startTime

         ? 'none' : 'block';

      rightOverlay.style.borderColor = slimes[1].color;
      rightOverlay.innerText = info.rightSlime.user || 'Player 2 Available';
   
      rightRequest.style.borderColor = slimes[1].color;
      rightRequest.style.display = 
         info.rightSlime.user
         || 
         isControllingLeft
         ||
         info.startTime

         ? 'none' : 'block';           

      if (info.startTime && !runAnimation){
         runAnimation = true;
         animate(new Date().getTime());
      }
   });

   socket.on('movement', movement => {

      slimes[movement.player].x = movement.position.x;
      slimes[movement.player].y = movement.position.y;

      switch (movement.move) {
         case 'Up':
            if (slimes[movement.player].y > canvas.height - sceneVars.fieldHeight - 3) {
               slimes[movement.player].vertS = 400;
            }
            break;
         case 'Left':
            slimes[movement.player].horzS = -400;
            break;
         case 'LeftStop':
            if (slimes[movement.player].horzS < 0){
               slimes[movement.player].horzS = 0;
            }
            break;
         case 'Right':
            slimes[movement.player].horzS = 400;
            break;
         case 'RightStop':
            if (slimes[movement.player].horzS > 0){
               slimes[movement.player].horzS = 0;
            }
            break;
         default:
            break;
      }
   });

   // When receiving a collision
   socket.on('collision', function(msg){
      runAnimation = false;
      var str = msg;
      var strBreak = str.indexOf('|');
      var force = str.substring(0, strBreak);
      var angle = str.slice(strBreak + 1);
      ball.vertS = force * Math.cos(angle);
      ball.horzS = force * Math.sin(angle);
      runAnimation = true;
   });

   // When receiving a leftGoal
   socket.on('leftGoal', function(){
      //stop animation and increment score 
      runAnimation = false;
      score.left = score.left + 1;
      
      //reset erthang
      ball.x = ball.DEFAULTX;
      ball.y = ball.DEFAULTY;
      ball.vertS = 0;
      ball.horzS = 0;
      slimes[0].x = slimes[0].DEFAULTX;
      slimes[0].y = slimes[0].DEFAULTY;
      slimes[0].vertS = 0;
      slimes[0].horzS = 0;
      slimes[1].x = slimes[1].DEFAULTX;
      slimes[1].y = slimes[1].DEFAULTY;
      slimes[1].vertS = 0;
      slimes[1].horzS = 0;
      
      if (score.left == 3){
         if (isControllingLeft){
            socket.emit('gameover', $('#user').val());
         }
      } else {
         runAnimation = true;
      }
   });

   // When receiving a rightGoal
   socket.on('rightGoal', function(){
      //stop animation and increment score 
      runAnimation = false;
      score.right = score.right + 1;
      
      //reset erthang
      ball.x = ball.DEFAULTX;
      ball.y = ball.DEFAULTY;
      ball.vertS = 0;
      ball.horzS = 0;
      slimes[0].x = slimes[0].DEFAULTX;
      slimes[0].y = slimes[0].DEFAULTY;
      slimes[0].vertS = 0;
      slimes[0].horzS = 0;
      slimes[1].x = slimes[1].DEFAULTX;
      slimes[1].y = slimes[1].DEFAULTY;
      slimes[1].vertS = 0;
      slimes[1].horzS = 0;
      
      if (score.right == 3){
         if (isControllingRight){
            socket.emit('gameover', $('#user').val());
         }
      } else {
         runAnimation = true;
      }
   });

   //When receiving a gameover
   socket.on('gameover', function(msg){
      score.winner = msg + " is the winner!";
      
      //reset game
      isControllingLeft = false;
      isControllingRight = false;
      
      document.getElementById('app-request-left').style.display = 'block';
      document.getElementById('app-request-right').style.display = 'block';
      
      document.getElementById('overlay-left').innerText = 'Player 1 available';
      document.getElementById('overlay-right').innerText = 'Player 2 available';

      setTimeout(function(){
         //reset erthang
         score.left = 0;
         score.right = 0;
         score.winner = '';
         ball.x = ball.DEFAULTX;
         ball.y = ball.DEFAULTY;
         ball.vertS = 0;
         ball.horzS = 0;
         slimes[0].x = slimes[0].DEFAULTX;
         slimes[0].y = slimes[0].DEFAULTY;
         slimes[0].vertS = 0;
         slimes[0].horzS = 0;
         slimes[1].x = slimes[1].DEFAULTX;
         slimes[1].y = slimes[1].DEFAULTY;
         slimes[1].vertS = 0;
         slimes[1].horzS = 0;
      }, 50);
   });
 }