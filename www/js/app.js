
// This uses require.js to structure javascript:
// http://requirejs.org/docs/api.html#define

// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

define(function(require) {
    // Zepto provides nice js and DOM methods (very similar to jQuery,
    // and a lot smaller):
    // http://zeptojs.com/
    var $ = require('zepto');

    // Need to verify receipts? This library is included by default.
    // https://github.com/mozilla/receiptverifier
    require('receiptverifier');

    // Want to install the app locally? This library hooks up the
    // installation button. See <button class="install-btn"> in
    // index.html
    require('./install-button');

    // Simple input library for our game
    var input = require('./input');

    // Create the canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = 512;
    canvas.height = 480;
    document.body.appendChild(canvas);

    // The player's state
    var playerL = {
        x: 0,
        y: 10,
        sizeX: 20,
        sizeY: 70,
        color: "blue",
        speed: 250,
        score: 0
    };
    
    // The player  state
    var playerR = {
        x: 20,
        y: 60,
        sizeX: 20,
        sizeY: 70,
        color: "red",
        speed: 250,
        score: 0
    };
    
    var ball = {
        x: 256,
        y: 200,
        sizeX: 10,
        sizeY: 10,
        color: "yellow",
        speedX: 200,
        speedY: 200
    };

    // Reset game to original state
    function reset() {
        playerL.x = playerL.sizeX;
        playerL.y = canvas.height/2.0 - playerL.sizeY/2.0;
        
        playerR.x = canvas.width - 2*playerR.sizeX ;
        playerR.y = canvas.height/2.0 - playerR.sizeY/2.0;
        
        ball.x = canvas.width /2.0 - ball.sizeX/2.0;
        ball.y = canvas.height/2.0 - ball.sizeY/2.0;
    };

    // Pause and unpause
    function pause() {
        running = false;
    }

    function unpause() {
        running = true;
        then = Date.now();
        main();
    }
    
    function collision(A,B) { 
        // returns "no" => no collision
        //         "top" => collision top
        //         "left" => collision left
        //         "right" => collision right
        //         "bottom" => collision bottom
        
        var w = 0.5 * (A.sizeX + B.sizeX);
        var h = 0.5 * (A.sizeY + B.sizeY);
        var dx = (A.x+A.sizeX/2.0) - (B.x+B.sizeX/2.0);
        var dy = (A.y+A.sizeY/2.0) - (B.y+B.sizeY/2.0);
        
        if ( Math.abs(dx) <= w && Math.abs(dy) <= h ) {
            // collision!
            var wy = w * dy;
            var hx = h * dx;

            if (wy > hx) {
                if (wy > -hx) {
                    /* collision at the top */
                    return "top";
                }
                else {
                    /* on the left */
                    return "left";
                }
            }
            else
            {
                if (wy > -hx) {
                    /* on the right */
                    return "right";
                }
                else {
                    /* at the bottom */
                    return "bottom";
                }
            }
        }
        return "no";
    }
    
    // Update game objects
    function update(dt) {
        // Speed in pixels per second
        
        CollplayerLBall=collision(playerL,ball)
        if(input.isDown('S') && 
           playerL.y < canvas.height - playerL.sizeY && CollplayerLBall != "top") {
            // dt is the number of seconds passed, so multiplying by
            // the speed gives u the number of pixels to move
            playerL.y += playerL.speed * dt;
        }
        
        if(input.isDown('W') && playerL.y > 0  && CollplayerLBall != "bottom" ) {
            playerL.y -= playerL.speed * dt;
        }

        if(input.isDown('A') && playerL.x >= 0 && CollplayerLBall != "right" ) {
            playerL.x -= playerL.speed * dt;
        }

        if(input.isDown('D') && playerL.x < canvas.width/2.0 - 2*playerL.sizeX && CollplayerLBall != "left" ) {
            playerL.x += playerL.speed * dt;
        }
        
        // Speed in pixels per second
        CollplayerRBall=collision(playerR,ball)
        if(input.isDown('DOWN')  && playerR.y < canvas.height - playerR.sizeY && CollplayerRBall != "top") {
            // dt is the number of seconds passed, so multiplying by
            // the speed gives u the number of pixels to move
            playerR.y += playerR.speed * dt;
        }

        if(input.isDown('UP') && playerR.y >= 0 && CollplayerRBall != "bottom") {
            playerR.y -= playerR.speed * dt;
        }

        if(input.isDown('LEFT') && playerR.x > canvas.width/2.0 && CollplayerRBall != "right") {
            playerR.x -= playerR.speed * dt;
        }

        if(input.isDown('RIGHT') && playerR.x <= canvas.width - playerR.sizeX  && CollplayerRBall != "left") {
            playerR.x += playerR.speed * dt;
        }
        
        
        ball.x += ball.speedX *dt;
        ball.y += ball.speedY *dt;
        
        if (ball.x <= 0 ) {
            playerR.score += 1;
            playerR.sizeY += 2;
            playerL.sizeY -= 2;
            ball.x = canvas.width /2.0 - ball.sizeX/2.0;
            ball.y = Math.random()*canvas.height - ball.sizeY/2.0;
            ball.speedX *= -1;
        }
        
        if (ball.x + ball.sizeX > canvas.width) {
            playerL.score += 1;
            playerL.sizeY += 2;
            playerR.sizeY -= 2;
            ball.x = canvas.width /2.0 - ball.sizeX/2.0;
            ball.y = Math.random()*canvas.height - ball.sizeY/2.0;
            ball.speedX *= -1;
        }
        /*
        if (ball.x + ball.sizeX > canvas.width || ball.x <= 0) {
            ball.speedX *= -1;
        }
        */
        
        if (ball.y <= 0 ) {
            ball.speedY = Math.abs(ball.speedY)
        }
        if (ball.y + ball.sizeY >= canvas.height ) {
            ball.speedY = - Math.abs(ball.speedY);
        }
        
        
        // Collision detector:
        CollisionRBall = collision(playerR,ball);
        if (CollisionRBall == "top") {
            ball.speedY = - Math.abs(ball.speedY);
        }
        if (CollisionRBall == "bottom") {
            ball.speedY = Math.abs(ball.speedY);
        }
        if (CollisionRBall == "right") {
            ball.speedX = - Math.abs(ball.speedX);
        }
        if (CollisionRBall == "left") {
            ball.speedX = Math.abs(ball.speedX);
        }
        
        CollisionLBall = collision(playerL,ball);
        if (CollisionLBall == "top") {
            ball.speedY = - Math.abs(ball.speedY);
        }
        if (CollisionLBall == "bottom") {
            ball.speedY = Math.abs(ball.speedY);
        }
        if (CollisionLBall == "right") {
            ball.speedX = - Math.abs(ball.speedX);
        }
        if (CollisionLBall == "left") {
            ball.speedX = Math.abs(ball.speedX);
        }
        
        
    };

    // Draw everything
    function render() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = playerL.color;
        ctx.fillRect(playerL.x, playerL.y, playerL.sizeX, playerL.sizeY);
        
        ctx.fillStyle = playerR.color;
        ctx.fillRect(playerR.x, playerR.y, playerR.sizeX, playerR.sizeY);
        
        ctx.fillStyle = ball.color;
        ctx.fillRect(ball.x, ball.y, ball.sizeX, ball.sizeY);
        
        ctx.fillStyle = "white";
        ctx.fillText(playerL.score + ' - ' + playerR.score,canvas.width/2 - 20,20);
        
    };

    // The main game loop
    function main() {
        if(!running) {
            return;
        }
        
        var now = Date.now();
        var dt = (now - then) / 1000.0;

        update(dt);
        render();

        then = now;
        requestAnimFrame(main);
    };

    // Don't run the game when the tab isn't visible
    window.addEventListener('focus', function() {
        unpause();
    });

    window.addEventListener('blur', function() {
        pause();
    });

    // Let's play this game!
    reset();
    var then = Date.now();
    var running = true;
    main();
});
