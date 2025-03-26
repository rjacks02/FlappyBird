//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;
let birdFrameID = 0;
let birdFrames = ["./assets/flappybird0.png", "./assets/flappybird1.png", "./assets/flappybird2.png", "./assets/flappybird3.png"]

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipe speed
let velocityY = 0; //bird jump speed
let gravity = .4;

//stats
let gameOver = false;
let score = 0;
let highScore = 0;

//jump mechanics
let prevTime = -1;
let touchHandled = false; //flag to prevent double jump on mobile

window.onload = function() {
    //context
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");
    
    //bird
    birdImg = new Image();
    birdImg.src = "./assets/flappybird.png"
    birdImg.src = birdFrames[birdFrameID];
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    //pipes
    topPipeImg = new Image();
    topPipeImg.src = "./assets/toppipe.png";
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./assets/bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //1500ms = 1.5s
    setInterval(updateBirdFrameID, 500);

    document.addEventListener("keydown", moveBird);

    document.addEventListener("mousedown", function(e) {
        if (prevTime != e.timeStamp) {
            moveBird(e);
        }
    });

    document.addEventListener("touchstart", moveBird);
    document.addEventListener("touchend", function(e){
        prevTime = e.timeStamp;
    });
}

function update() {
    requestAnimationFrame(update);
    if (gameOver){
        context.textAlign = 'center';
        context.fillText("GAME OVER", boardWidth/2, boardHeight/2);
        context.textAlign = 'left';
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    bird.y = Math.max(bird.y+velocityY, 0); //upper height limit
    birdImg.src = birdFrames[birdFrameID];
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height){
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++){
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width){
            score += .5;
            pipe.passed = true;
            if (score > highScore){
                highScore = score;
            }
        }
        if (detectCollision(bird, pipe)){
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth){
        pipeArray.shift();
    }

    //score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText("High Score: " + highScore, 5, 45);
    context.fillText("Score: " + score, 5, 95);

    if (gameOver){
        context.textAlign = 'center';
        context.fillText("GAME OVER", boardWidth/2, boardHeight/2);
        context.textAlign = 'left';
    }
}

function placePipes(){
    if (gameOver){
        return;
    }
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(bottomPipe);
}

function updateBirdFrameID(){
    birdFrameID = (birdFrameID + 1) % 4;
}

function moveBird (e) {
    let t = String(e.type);
    let ts = String(e.timeStamp);
    console.log(t);
    console.log(ts);
    if (e.type == "mousedown" || e.type == "touchstart" || e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX"){
        velocityY = -6;
        prevTime = e.timeStamp;
    }

    //reset game
    if (gameOver){
        bird.y = birdY;
        pipeArray = [];
        score = 0;
        gameOver = false;
    }
}

function detectCollision(a, b){
    return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}