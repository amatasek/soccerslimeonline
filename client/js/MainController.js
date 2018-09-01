window.requestAnimFrame = (function(callback) {
   return window.requestAnimationFrame || window.webkitRequestAnimationFrame 
                              || window.mozRequestAnimationFrame 
                              || window.oRequestAnimationFrame 
                              || window.msRequestAnimationFrame ||
   function(callback) {
     window.setTimeout(callback, 1000 / 60);
   };
 })();

 window.onload = function(){
   /*
   ***************TOP LEVEL VARIABLES****************
   */
   var canvas = document.getElementById('myCanvas');
   var context = canvas.getContext('2d');

   var isControllingLeft = false;
   var isControllingRight = false;

   var score = {
      left: 0,
      right: 0,
      winner: ''
   };

   var ball = {
      DEFAULTX: 400,
      DEFAULTY: 100,
      x: 0,
      y: 0,
      r: 15,
      vertS: 0,
      horzS: 0
   };
   ball.x = ball.DEFAULTX;
   ball.y = ball.DEFAULTY;

   var leftSlime = {
      DEFAULTX: 240,
      DEFAULTY: 325,
      x: 0,
      y: 0,
      r: 40,
      vertS: 0,
      horzS: 0
   };
   leftSlime.x = leftSlime.DEFAULTX;
   leftSlime.y = leftSlime.DEFAULTY;

   var rightSlime = {
      DEFAULTX: 560,
      DEFAULTY: 325,
      x: 0,
      y: 0,
      r: 40,
      vertS: 0,
      horzS: 0
   };
   rightSlime.x = rightSlime.DEFAULTX;
   rightSlime.y = rightSlime.DEFAULTY;

   var sceneVars = {
      fieldHeight: 75,
      goalHeight: 80,
      goalDepth: 40
   };

   /*
   * define the runAnimation boolean as an obect
   * so that it can be modified by reference
   */
   var runAnimation = {
   value: false
   };

   // WEB SOCKET
   var socket = io();

   /*
   **************GAME ACTOR DEFINITIONS***************
   */
   function drawScore(score, context){
      context.font = "48px serif";
      context.textAlign = "center";
      context.strokeText(score.left + " | " + score.right, (canvas.width / 2), 45);
      
      context.font = "48px serif";
      context.textAlign = "center";
      context.strokeText(score.winner, (canvas.width / 2), 100);
   }
   
   function drawBall(ball, context) {
         context.beginPath();
         context.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI, false);
         context.fillStyle = 'yellow';
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
      context.fillStyle = 'red';
      context.fill();
      context.strokeStyle = '#550000';
      context.stroke();
   }

   function drawRightSlime(rightSlime, context) {
      context.beginPath();
         context.arc(rightSlime.x, rightSlime.y, rightSlime.r, 0, Math.PI, true);
         context.closePath();
         context.lineWidth = 1;
         context.fillStyle = 'blue';
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
   function animate(lastTime, sceneVars, ball, leftSlime, rightSlime, runAnimation, canvas, context) {
   if(runAnimation.value) {
      // update
      var time = (new Date()).getTime();
      var timeDiff = time - lastTime;

      
      var gravA = -15;
      
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
      drawScore(score, context);

      // request new frame
      requestAnimFrame(function() {
      animate(time, sceneVars, ball, leftSlime, rightSlime, runAnimation, canvas, context);
      });
   }
   }
      
   // Re-draw
   drawScene(sceneVars, context);
   drawBall(ball, context);
   drawleftSlime(leftSlime, context);
   drawRightSlime(rightSlime, context);
   drawScore(score, context);
      


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

         // Control Left button handler
         $('#b_controlLeft').click(function(){
            if (!isControllingRight) {
            isControllingLeft = true;
            socket.emit('checkLeft', $('#user').val());
            }
         });
         
         // Control Right button handler
         $('#b_controlRight').click(function(){
            if (!isControllingLeft) {
            isControllingRight = true;
            socket.emit('checkRight', $('#user').val());
         }
         });


















      
      

         
         // Login button handler
         $('#b_login').click(function(){
            socket.emit('checkLogin', $('#user').val() + ':' + $('#pwd').val());
         //$('#user').val('');
         //$('#pwd').val('');
         return false;
         });
         
         // Logout button handler
         $('#b_logout').click(function(){
            socket.emit('logout', $('#user').val());
         document.getElementById('loginDiv').style.display = 'block';
            document.getElementById('mainDiv').style.display = 'none';
         $('#pwd').val('');
         return false;
         });
         
         // New User button handler
         $('#b_newUser').click(function(){
            
            var newUser = prompt("What be thy name?");
            var newPass= prompt("What be thy secret word?");
            if (newUser != null && newPass != null) {
               //forbidden characters
               if (newUser.indexOf(":") == -1 && newUser.indexOf("|") == -1 && newPass.indexOf(":") == -1 && newPass.indexOf("|") == -1){
                  socket.emit('newUser', newUser + ':' + newPass);
               } else {
                  alert("You used one of the forbidden characters");
               }
            }
         return false;
         });
         
         // Profile back button handler
         $('#b_profile2main').click(function(){
         document.getElementById('profileDiv').style.display = 'none';
            document.getElementById('mainDiv').style.display = 'block';
         return false;
         });
         
         //New Name button handler
         $('#b_newName').click(function(){
            
            var newName = prompt("What be thy NEW name?");
            var pass= prompt("What be thy secret word?");
            if (newName != null && pass != null) {
               if (newName != document.getElementById('user').value && pass == document.getElementById('pwd').value) {
                  if (newName.indexOf(":") == -1 && newName.indexOf("|") == -1){
                     var oldName = document.getElementById('user').value;
                     document.getElementById('user').value = newName;
                     document.getElementById('lblName').innerHTML = document.getElementById('user').value;
                     socket.emit('newUser', newName + ':' + document.getElementById('pwd').value);
                     socket.emit('deleteUser', oldName + ':' + document.getElementById('pwd').value);
                     socket.emit('notification', oldName + ' - is now - ' + newName);
                  } else {
                     alert("You used one of the forbidden characters");
                  }
               } else {
                  alert("Either you requested your current name or your Secret Word was incorrect");
               }
            }
         return false;
         });
         
         //New User button handler
         $('#b_newPassword').click(function(){
            
            var oldPass = prompt("What be thy OLD Secret Word?");
            var newPass= prompt("What be thy NEW secret word?");
            if (oldPass != null && newPass != null) {
               if (oldPass == document.getElementById('pwd').value && newPass != document.getElementById('pwd').value) {
                  if (newPass.indexOf(":") == -1 && newPass.indexOf("|") == -1){
                     document.getElementById('pwd').value = newPass;
                     socket.emit('newUser', document.getElementById('user').value + ':' + newPass);
                     socket.emit('deleteUser', document.getElementById('user').value + ':' + oldPass);
                     alert("Secret Word changed");
                  } else {
                     alert("You used one of the forbidden characters");
                  }
               } else {
                  alert("You did that wrong");
               }
            }
         return false;
         });
         
         // Profile button handler
         $('#b_profile').click(function(){
            document.getElementById('lblName').innerHTML = document.getElementById('user').value;
            document.getElementById('mainDiv').style.display = 'none';
            document.getElementById('profileDiv').style.display = 'block';
         return false;
         });
         
         // Message send handler
         $('#b_send').click(function(){
         var check = $('#m').val();
         if (document.getElementById('m').value != '')  {
            socket.emit('chatMessage', $('#user').val() + ': ' + $('#m').val());
            $('#m').val('');
         } 	
         return false;
         });
         
            
         //When receiving a login response
         socket.on('checkLogin', function(msg){
            
            //if login is good
            if (msg == "1") {
               socket.emit('chatRefresh');
            document.getElementById('loginDiv').style.display = 'none';
            document.getElementById('mainDiv').style.display = 'block';
            } else {
               $('#errorMessages').append($('<li>').text(msg));
            }
         });
         
         //When receiving a  notification
         socket.on('notification', function(msg){
         $('#notifications').append($('<li>').text(msg));
         });	

         //When receiving a forced chat refresh
         socket.on('forceChatRefresh', function(msg){
         socket.emit('chatRefresh');
         });	

         //When receiving a clear chat request
         socket.on('clearChat', function(msg){
         $('#messages').empty();
         });		   

         //When receiving a chat message
         socket.on('chatMessage', function(msg){
         $('#messages').append($('<li>').text(msg));
         });
         
         //When receiving a leftUp
         socket.on('leftUp', function(){
            if (leftSlime.y > canvas.height - sceneVars.fieldHeight - 3) {
               leftSlime.vertS = 400;
            }
         });
         
         //When receiving a leftLeft
         socket.on('leftLeft', function(){
            leftSlime.horzS = -400;
         });
         
         //When receiving a leftRight
         socket.on('leftRight', function(){
            leftSlime.horzS = 400;
         });
         
         //When receiving a leftLeftStop
         socket.on('leftLeftStop', function(){
         if (leftSlime.horzS < 0) {
            leftSlime.horzS = 0;
         }
         });

         //When receiving a leftRightStop
         socket.on('leftRightStop', function(){
         if (leftSlime.horzS > 0) {
            leftSlime.horzS = 0;
         }
         });
         
         //When receiving a rightUp
         socket.on('rightUp', function(){
            if (rightSlime.y > canvas.height - sceneVars.fieldHeight - 3) {
               rightSlime.vertS = 400;
            }
         });
         
         //When receiving a rightLeft
         socket.on('rightLeft', function(){
            rightSlime.horzS = -400;
         });
         
         //When receiving a leftRight
         socket.on('rightRight', function(){
            rightSlime.horzS = 400;
         });
         
         //When receiving a rightLeftStop
         socket.on('rightLeftStop', function(){
         if (rightSlime.horzS < 0) {
            rightSlime.horzS = 0;
         }
         });

         //When receiving a rightRightStop
         socket.on('rightRightStop', function(){
         if (rightSlime.horzS > 0) {
            rightSlime.horzS = 0;
         }
         });
         
         
         //When receiving a startGame
         socket.on('startGame', function(){
            runAnimation.value = true;
            var date = new Date();
            var time = date.getTime();
            animate(time, sceneVars, ball, leftSlime, rightSlime, runAnimation, canvas, context);
         });

         //When receiving a grantLeft
         socket.on('grantLeft', function(msg){
            document.getElementById('b_controlLeft').style.display = 'none';
            document.getElementById('b_leftControlled').value = msg + ' is controlling red slime';
            document.getElementById('b_leftControlled').style.display = 'block';
         });
         
         //When receiving a grantRight
         socket.on('grantRight', function(msg){
            document.getElementById('b_controlRight').style.display = 'none';
            document.getElementById('b_rightControlled').value = msg + ' is controlling blue slime';
            document.getElementById('b_rightControlled').style.display = 'block';
         });
         
         //When receiving a ballLocation
         socket.on('ballLocation', function(msg){
            runAnimation.value = false;
            var str = msg;
            var strBreak = str.indexOf('|');
            var x = str.substring(0, strBreak);
            var y = str.slice(strBreak + 1);
            //ball.x = x;
            //ball.y = y;
            runAnimation.value = true;
         });

         // When receiving a leftLocation
         socket.on('leftLocation', function(msg){
            runAnimation.value = false;
            var str = msg;
            var strBreak = str.indexOf('|');
            var lx = str.substring(0, strBreak);
            var ly = str.slice(strBreak + 1);
            //leftSlime.x = lx;
            //leftSlime.y = ly;
            runAnimation.value = true;
         });	

         // When receiving a rightLocation
         socket.on('rightLocation', function(msg){
            runAnimation.value = false;
            var str = msg;
            var strBreak = str.indexOf('|');
            var rx = str.substring(0, strBreak);
            var ry = str.slice(strBreak + 1);
            //rightSlime.x = rx;
            //rightSlime.y = ry;
            runAnimation.value = true;
         });

         // When receiving a collision
         socket.on('collision', function(msg){
            runAnimation.value = false;
            var str = msg;
            var strBreak = str.indexOf('|');
            var force = str.substring(0, strBreak);
            var angle = str.slice(strBreak + 1);
            ball.vertS = force * Math.cos(angle);
            ball.horzS = force * Math.sin(angle);
            runAnimation.value = true;
         });

         // When receiving a leftGoal
         socket.on('leftGoal', function(){
            //stop animation and increment score 
            runAnimation.value = false;
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
               runAnimation.value = true;
            }
         });

         // When receiving a rightGoal
         socket.on('rightGoal', function(){
            //stop animation and increment score 
            runAnimation.value = false;
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
               runAnimation.value = true;
            }
         });

         //When receiving a gameover
         socket.on('gameover', function(msg){
            score.winner = msg + " is the winner!";
            runAnimation.value = true;
            //reset game
            isControllingLeft = false;
            isControllingRight = false;
            document.getElementById('b_leftControlled').style.display = 'none';
            document.getElementById('b_controlLeft').style.display = 'block';
            document.getElementById('b_rightControlled').style.display = 'none';
            document.getElementById('b_controlRight').style.display = 'block';
            setTimeout(function(){
               runAnimation.value = false;
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