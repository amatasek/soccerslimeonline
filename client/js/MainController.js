
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
   var canvas = document.getElementById('app-canvas');
   var context = canvas.getContext('2d');

   var isControllingLeft = false;
   var isControllingRight = false;

   var score = {
      left: 0,
      right: 0,
      winner: ''
   };

   var ball = {
      DEFAULTX: 450,
      DEFAULTY: 100,
      x: 0,
      y: 0,
      r: 15,
      vertS: 0,
      horzS: 0,
      color: 'yellow'
   };

   ball.x = ball.DEFAULTX;
   ball.y = ball.DEFAULTY;

   var leftSlime = {
      DEFAULTX: 300,
      DEFAULTY: 300,
      x: 0,
      y: 0,
      r: 40,
      vertS: 0,
      horzS: 0,
      color: 'white'
   };

   leftSlime.x = leftSlime.DEFAULTX;
   leftSlime.y = leftSlime.DEFAULTY;

   let rightSlime = {
      DEFAULTX: 600,
      DEFAULTY: 300,
      x: 0,
      y: 0,
      r: 40,
      vertS: 0,
      horzS: 0,
      color: 'white'
   };

   rightSlime.x = rightSlime.DEFAULTX;
   rightSlime.y = rightSlime.DEFAULTY;

   let sceneVars = {
      fieldHeight: 100,
      goalHeight: 100,
      goalDepth: 50
   };

   var runAnimation = false;

   // WEB SOCKET
   var socket = io();

   /*
   **************GAME ACTOR DEFINITIONS***************
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

   function drawleftSlime(leftSlime, context) {
      context.beginPath();
      context.arc(leftSlime.x, leftSlime.y, leftSlime.r, 0, Math.PI, true);
      context.closePath();
      context.lineWidth = 1;
      context.fillStyle = leftSlime.color;
      context.fill();
      context.strokeStyle = '#550000';
      context.stroke();
   }

   function drawRightSlime(rightSlime, context) {
      context.beginPath();
         context.arc(rightSlime.x, rightSlime.y, rightSlime.r, 0, Math.PI, true);
         context.closePath();
         context.lineWidth = 1;
         context.fillStyle = rightSlime.color;
         context.fill();
         context.strokeStyle = '#550000';
         context.stroke();
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

   /*
   **************GAME LOGIC***************
   */	
   function animate(lastTime, sceneVars, ball, leftSlime, rightSlime, canvas, context) {
   
   if(runAnimation) {
      const time = new Date().getTime(),
         timeDiff = time - lastTime;
         gravA = -15;
      
      // Apply gravity to slimes and ball
      
      if (ball.vertS > -500) {ball.vertS = ball.vertS + gravA;}
      
      if (leftSlime.vertS != 0) {
         if (leftSlime.vertS > -300) {leftSlime.vertS = leftSlime.vertS + gravA;}
      }
      
      if (rightSlime.vertS != 0) {
         if (rightSlime.vertS > -300) {rightSlime.vertS = rightSlime.vertS + gravA;}
      }

      var ballLinearVertDistEachFrame = ball.vertS * timeDiff / 1000;
      var ballLinearHorzDistEachFrame = ball.horzS * timeDiff / 1000;
      var leftLinearVertDistEachFrame = leftSlime.vertS * timeDiff / 1000;
      var leftLinearHorzDistEachFrame = leftSlime.horzS * timeDiff / 1000;
      var rightLinearVertDistEachFrame = rightSlime.vertS * timeDiff / 1000;
      var rightLinearHorzDistEachFrame = rightSlime.horzS * timeDiff / 1000;

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
      if (leftSlime.y <= canvas.height - sceneVars.fieldHeight) {
         leftSlime.y = leftSlime.y - leftLinearVertDistEachFrame;
      } else {
         leftSlime.vertS = 0;
         leftSlime.y = canvas.height - sceneVars.fieldHeight;
      }
      
      // Horizontal Movement
      if (leftSlime.x > leftSlime.r - 1 && leftSlime.x < canvas.width - leftSlime.r + 1) {
         leftSlime.x = leftSlime.x + leftLinearHorzDistEachFrame;
      }
      if (leftSlime.x > canvas.width - leftSlime.r){
         leftSlime.x = canvas.width - leftSlime.r;
         leftSlime.horzS = 0;
      } 
      if (leftSlime.x < leftSlime.r){
         leftSlime.x = leftSlime.r;
         leftSlime.horzS = 0;
      }

      // Move Right Slime
      if (rightSlime.y <= canvas.height - sceneVars.fieldHeight) {
         rightSlime.y = rightSlime.y - rightLinearVertDistEachFrame;
      } else {
         rightSlime.vertS = 0;
         rightSlime.y = canvas.height - sceneVars.fieldHeight;
      }
      
      if (rightSlime.x > rightSlime.r - 1 && rightSlime.x < canvas.width - rightSlime.r + 1) {
         rightSlime.x = rightSlime.x + rightLinearHorzDistEachFrame;
      }
      if (rightSlime.x > canvas.width - rightSlime.r){
         rightSlime.x = canvas.width - rightSlime.r;
         rightSlime.horzS = 0;
      } 
      if (rightSlime.x < rightSlime.r){
         rightSlime.x = rightSlime.r;
         rightSlime.horzS = 0;
      }	
      
      //Collision Detection
      
      // Left slime collision
      if (isControllingLeft) {
         // If ball in above bottom of slime
         if (ball.y <= leftSlime.y) {
            // If edges are touching
            var riseSquared = Math.pow(leftSlime.y - ball.y, 2);
            var runSquared = Math.pow(ball.x - leftSlime.x, 2);
            var distance = Math.sqrt(riseSquared + runSquared);
            if (distance <= leftSlime.r + ball.r) {
               // Calculate force
               var vertVelSquared = Math.pow(leftSlime.vertS, 2);
               var horzVelSquared = Math.pow(leftSlime.horzS, 2);
               var collisionForce = Math.sqrt(vertVelSquared + horzVelSquared);
               var ballVertVelSquared = Math.pow(ball.vertS, 2);
               var ballHorzVelSquared = Math.pow(ball.horzS, 2);
               collisionForce = collisionForce + Math.sqrt(ballVertVelSquared + ballHorzVelSquared);
               // Calculate angle
               var collisionRads = Math.atan((ball.x - leftSlime.x) / (leftSlime.y - ball.y));
               // Send Collision info
               socket.emit('collision', collisionForce + '|' + collisionRads);
               
               // Update ball and left positions
               var roundX = Math.round(ball.x);
               var roundY = Math.round(ball.y);
               socket.emit('ballLocation', roundX + '|' + roundY);
               roundX = Math.round(leftSlime.x);
               roundY = Math.round(leftSlime.y);
               socket.emit('leftLocation', roundX + '|' + roundY);
            }
         }
      }

      // Right slime collision
      if (isControllingRight) {
         // If ball in above bottom of slime
         if (ball.y <= rightSlime.y) {
            // If edges are touching
            var riseSquared = Math.pow(rightSlime.y - ball.y, 2);
            var runSquared = Math.pow(ball.x - rightSlime.x, 2);
            var distance = Math.sqrt(riseSquared + runSquared);
            if (distance <= rightSlime.r + ball.r) {
               // Calculate force
               var vertVelSquared = Math.pow(rightSlime.vertS, 2);
               var horzVelSquared = Math.pow(rightSlime.horzS, 2);
               var collisionForce = Math.sqrt(vertVelSquared + horzVelSquared);
               var ballVertVelSquared = Math.pow(ball.vertS, 2);
               var ballHorzVelSquared = Math.pow(ball.horzS, 2);
               collisionForce = collisionForce + Math.sqrt(ballVertVelSquared + ballHorzVelSquared);
               // Calculate angle
               var collisionRads = Math.atan((ball.x - rightSlime.x) / (rightSlime.y - ball.y));
               // Send Collision info
               socket.emit('collision', collisionForce + '|' + collisionRads);
               
               // Update ball and right position
               var roundX = Math.round(ball.x);
               var roundY = Math.round(ball.y);
               socket.emit('ballLocation', roundX + '|' + roundY);
               roundX = Math.round(rightSlime.x);
               roundY = Math.round(rightSlime.y);
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
      drawleftSlime(leftSlime, context);
      drawRightSlime(rightSlime, context);

      // request new frame
      requestAnimFrame(function() {
         animate(time, sceneVars, ball, leftSlime, rightSlime, canvas, context);
      });
   }
   }
      
   // Re-draw
   drawScene(sceneVars, context);
   drawBall(ball, context);
   drawleftSlime(leftSlime, context);
   drawRightSlime(rightSlime, context);

   function input(direction){
      
      const player = isControllingLeft ? 1
         : isControllingRight ? 2
         : null;
            
      if (!player){
         return;
      }

      const input = {
         user: document.getElementById('login-user').value,
         player: player,
         direction: direction
      }

      console.log(`User input: [${input}].`);

      socket.emit('input', input);
   }

   // CONTROL HANDLING
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

   document.getElementById('app-request-left').addEventListener('click', fn => requestGame(1));
   document.getElementById('app-request-right').addEventListener('click', fn => requestGame(2));
   document.getElementById('app-login').addEventListener('click', fn => login());
   document.getElementById('app-logout').addEventListener('click', fn => logout());
   document.getElementById('app-right').addEventListener('click', fn => input('Right'));
   document.getElementById('app-up').addEventListener('click', fn => input('Up'));
   document.getElementById('app-left').addEventListener('click', fn => input('Left'));
   
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
      
      console.log('GS', info);
      
      leftSlime.color = info.leftSlime.color || 'white';
      rightSlime.color = info.rightSlime.color || 'white';
      
      const user = document.getElementById('login-user').value;

      let leftOverlay = document.getElementById('overlay-left'),
         rightOverlay = document.getElementById('overlay-right'),
         leftRequest = document.getElementById('app-request-left'),
         rightRequest = document.getElementById('app-request-right');
                     
      isControllingLeft = info.leftSlime.user == user;
      isControllingRight = info.rightSlime.user == user;
      
      leftOverlay.style.borderColor = leftSlime.color;
      leftOverlay.innerText = info.leftSlime.user || 'Player 1 Available';

      leftRequest.style.borderColor = info.player1color;
      leftRequest.style.display = 
         info.leftSlime.user
         || 
         isControllingRight
         ||
         info.startTime

         ? 'none' : 'block';

      rightOverlay.style.borderColor = rightSlime.color;
      rightOverlay.innerText = info.rightSlime.user || 'Player 2 Available';
   
      rightRequest.style.borderColor = rightSlime.color;
      rightRequest.style.display = 
         info.rightSlime.user
         || 
         isControllingLeft
         ||
         info.startTime

         ? 'none' : 'block';           

      if (info.startTime && !runAnimation){
         runAnimation = true;
         animate(new Date().getTime(), sceneVars, ball, leftSlime, rightSlime, canvas, context);
      }
   });

   socket.on('movement', movement => {
      switch (movement.move) {
         case 'Up':
            if (movement.player === 1){
               if (leftSlime.y > canvas.height - sceneVars.fieldHeight - 3) {
                  leftSlime.vertS = 400;
               }
            }
            if (movement.player === 2){
               if (rightSlime.y > canvas.height - sceneVars.fieldHeight - 3) {
                  rightSlime.vertS = 400;
               }
            }
            break;
         case 'Left':
            if (movement.player === 1){
               leftSlime.horzS = -400;
            }
            if (movement.player === 2){
               rightSlime.horzS = -400;
            }
            break;
         case 'LeftStop':
            if (movement.player === 1){
               if (leftSlime.horzS < 0){
                  leftSlime.horzS = 0;
               }
            }
            if (movement.player === 2){
               if (rightSlime.horzS < 0) {
                  rightSlime.horzS = 0;
               }
            }
            break;
         case 'Right':
            if (movement.player === 1){
               leftSlime.horzS = 400;
            }
            if (movement.player === 2){
               rightSlime.horzS = 400;
            }
            break;
         case 'RightStop':
            if (movement.player === 1){
               if (leftSlime.horzS > 0){
                  leftSlime.horzS = 0;
               }
            }
            if (movement.player === 2){
               if (rightSlime.horzS > 0) {
                  rightSlime.horzS = 0;
               }
            }
            break;
         default:
            break;
      }
   });
   
   // When receiving a leftLocation
   socket.on('leftLocation', function(msg){
      runAnimation = false;
      var str = msg;
      var strBreak = str.indexOf('|');
      var lx = str.substring(0, strBreak);
      var ly = str.slice(strBreak + 1);
      //leftSlime.x = lx;
      //leftSlime.y = ly;
      runAnimation = true;
   });	

   // When receiving a rightLocation
   socket.on('rightLocation', function(msg){
      runAnimation = false;
      var str = msg;
      var strBreak = str.indexOf('|');
      var rx = str.substring(0, strBreak);
      var ry = str.slice(strBreak + 1);
      //rightSlime.x = rx;
      //rightSlime.y = ry;
      runAnimation = true;
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
      leftSlime.x = leftSlime.DEFAULTX;
      leftSlime.y = leftSlime.DEFAULTY;
      leftSlime.vertS = 0;
      leftSlime.horzS = 0;
      rightSlime.x = rightSlime.DEFAULTX;
      rightSlime.y = rightSlime.DEFAULTY;
      rightSlime.vertS = 0;
      rightSlime.horzS = 0;
      
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
      leftSlime.x = leftSlime.DEFAULTX;
      leftSlime.y = leftSlime.DEFAULTY;
      leftSlime.vertS = 0;
      leftSlime.horzS = 0;
      rightSlime.x = rightSlime.DEFAULTX;
      rightSlime.y = rightSlime.DEFAULTY;
      rightSlime.vertS = 0;
      rightSlime.horzS = 0;
      
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
         leftSlime.x = leftSlime.DEFAULTX;
         leftSlime.y = leftSlime.DEFAULTY;
         leftSlime.vertS = 0;
         leftSlime.horzS = 0;
         rightSlime.x = rightSlime.DEFAULTX;
         rightSlime.y = rightSlime.DEFAULTY;
         rightSlime.vertS = 0;
         rightSlime.horzS = 0;
      }, 50);
   });
 }