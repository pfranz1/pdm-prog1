let mainGuySpriteSheet;
let walkers;
let bg;

let canvasWidth = 500;
let canvasHeight = 900;

let padding = 50;

let ripple;

let gameScore = 2;
let topScore = gameScore;

let startTime = 30;
let timeRemaining = startTime;


var hoverXPos = 500;
let hoverYPos = 500;
let hoverDiameter = 100;

let hoverMS = 10;

let connected = false;
const encoder = new TextEncoder();
const decorder = new TextDecoder();
let writer, reader;
let sensorData = {};


function incScore(){
    gameScore++;
    print("Game score:", gameScore);
}
var soundEffectManager;

function preload(){
    bugWalking = loadImage("./assets/Water-Skipper.png");
    bugTwitch = loadImage("./assets/dead-skipper.png");
    scoreIcon = loadImage("./assets/crossed-skipper.png");
    timeIcon = loadImage("./assets/time-icon.png");
    musicOn = loadImage("./assets/music-on.png");
    musicOff = loadImage("./assets/music-off.png");

    soundEffectManager = new SoundEffectManager();


    spawnBugs();
    ripple = new Ripple(-100,-100,0,10,0);
}


function spawnBugs(){
    // BugSprite(spiteSheet, tilingWidth, tilingHeight, numFramesInAnimation, drawingWidth, drawingHeight, xPos, yPos)
    let numBugs = 30;
    walkers = [];

    
    for (let i = 0; i < numBugs; i++) {
        walkers.push(new BugSprite(bugWalking,bugTwitch,32,32,9,3,75,75,random(padding,windowWidth - padding),random(padding,windowHeight - padding), incScore, soundEffectManager ));
    }
}


var musicManager;
var isMusicPlaying = false;

var showStartScreen = true;

function setup(){
    musicManager = new MusicManager(isMusicPlaying);

    musicManager.setup();

    cnv = createCanvas(windowWidth,windowHeight);
    cnv.style('display', 'block');

    centerCanvas();
    imageMode(CENTER);
    colorMode('hsb');
}

function centerCanvas() {
    var x = (windowWidth - width) / 2;
    var y = (windowHeight - height) / 2;
    cnv.position(x, y);
    cnv.style('display', 'block');

  }


function windowResized() {
    if(hasButtonInit){
        button.remove();
        hasButtonInit = false;
    }

    resizeCanvas(windowWidth, windowHeight);
    centerCanvas();
  }

function endGame(){
    timeRemaining = -1;
    print("end game");
    topScore = max(gameScore, topScore);
    musicManager.onGameEnd();
    drawScoreScreen();
    // spawnBugs();
}

function startGame(){
    gameScore = 0;
    timeRemaining = startTime;
    musicManager.onGameStart();
    spawnBugs();
}

function draw(){
    if(showStartScreen){
        drawStartScreen();
        drawMusicIcon();
    } 
    else if(timeRemaining == -1){
        drawScoreScreen();
        drawMusicIcon();

    } else {
        background(236,70,100);
        drawMusicIcon();


        timeRemaining -= deltaTime / 1000;
        if (timeRemaining < 0) {
            endGame();
        } else {
            drawGame();
        }
    }

}

var soundToggleSize = 50;

function drawMusicIcon(){
    push();
    imageMode("corner");
    image(isMusicPlaying ? musicOn : musicOff,0,0,soundToggleSize,soundToggleSize);
    pop();
}

function toggleMusic(){
    isMusicPlaying = !isMusicPlaying;
    musicManager.onPlayMusicToggle();
}

function drawGame(){
    if (reader) {
        serialRead();
    }
    // {"xChange":0,"yChange":0,"didTap":false}

    
    if(sensorData.didTap != null && sensorData.didTap){
        console.log("TAP");
        onGameTap(hoverXPos,hoverYPos);
        sensorData.didTap = false;
    }

    if(sensorData.xChange != null && sensorData.xChange != 0){
        console.log("Hover x pos: ", hoverXPos, sensorData.xChange);
        hoverXPos += sensorData.xChange * hoverMS;
        sensorData.xChange = 0;
    }


    if(sensorData.yChange != null && sensorData.yChange != 0){
        console.log("Hover y pos: ", hoverYPos, sensorData.YChange);
        hoverYPos += sensorData.yChange * hoverMS;
        sensorData.yChange = 0;
    }


    // hoverXPos = Math.min(hoverXPos,width);

    

    // print('draw ripple');
    ripple.draw();

    // Want the ripple not to cover text, but want bugs to crawl on text
    textSize(50);
    fill(200,0,100);
    textAlign("RIGHT");
    text(gameScore, width-110,padding);

    push();

    imageMode('corner');
    let iconPadding = 50;
    // Magic numbers <3
    translate(width-iconPadding - 32, -20);
    scale(0.5);
    image(scoreIcon,48,48);
    pop();

    push();
    textAlign(RIGHT);
    imageMode('corner');

    translate(width-iconPadding - 20, 40);
    scale(0.4);
    image(timeIcon,48,48);
    pop();

    text(ceil(timeRemaining),width-110,padding+50);
    

    walkers.forEach( function (item,index){
        item.draw();
    });

    push();
    console.log(hoverXPos,hoverYPos);
    fill(50,25,0,0.5);
    circle(hoverXPos,hoverYPos,hoverDiameter);
    pop();
}

var button;

var hasButtonInit = false;

function drawScoreScreen(){
    background(236,70,100);

    push();

    let textStartY = canvasHeight * 0.30; 

    textAlign('center');

    textSize(48);
    text("Game Over!", windowWidth / 2, textStartY);

    textSize(32);
    text("Score: " + gameScore, (windowWidth / 2), (textStartY)+60)


    textSize(32);
    text("Top: " + topScore, (windowWidth / 2), (textStartY)+100)


    if(hasButtonInit == false){
        hasButtonInit = true;
        button = createButton('Again!');
        button.position((windowWidth / 2) - 75, (textStartY) + 240 );
        button.size(150);
        button.mousePressed( ()=>  { hasButtonInit = false; button.remove(); startGame();});
    }



    pop();
}

async function serialRead() {
    while(true) {
      const { value, done } = await reader.read();
      if (done) {
        reader.releaseLock();
        break;
      }
      console.log(value);
      sensorData = JSON.parse(value);
    }
}

async function connect() {
    Tone.start();

    port = await navigator.serial.requestPort();

    await port.open({ baudRate: 9600 });

    writer = port.writable.getWriter();

    reader = port.readable
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new TransformStream(new LineBreakTransformer()))
        .getReader();
    
    connected = true;
    hasButtonInit = false;

}

function drawStartScreen(){
    background(236,70,100);

    push();
    fill(200,0,100);

    let textStartY = canvasHeight * 0.30; 

    textAlign('center');

    textSize(48);
    text("Bug Squish", windowWidth / 2, textStartY);

    textSize(32);
    text("By: Peter Franz ", (windowWidth / 2), (textStartY)+60)

    if(hasButtonInit == false){
        if ("serial" in navigator && connected == false) {
            hasButtonInit = true;
            // The Web Serial API is supported.
            let button = createButton("Connect");
            button.position((windowWidth / 2) - 75, (textStartY) + 240 );
            button.mousePressed(()=>{button.remove();connect();});
        } else {
            hasButtonInit = true;
            button = createButton('Start');
            button.position((windowWidth / 2) - 75, (textStartY) + 240 );
            button.size(150);
            button.mousePressed( ()=>  { hasButtonInit = false; button.remove(); showStartScreen = false; startGame();});
        }
    }

    walkers.forEach( function (item,index){
        item.draw();
    });

    pop();
}
// This function has the side effect of toggling the music on or off
function checkMusicToggle(xPos,yPos){
    if(xPos < soundToggleSize && yPos  < soundToggleSize){
        toggleMusic();
        return true;
    } 

    return false;
}

function onGameTap(xPos,yPos){
    if(timeRemaining > 0 && showStartScreen == false){
        
        var didEscape = false;
        
        let squishedCounter = 0; 
        walkers.forEach( function (item,index){
            tapResult = item.tapOccurred(xPos,yPos);
            squishedCounter += tapResult == "squish" ? 1 : 0;
            didEscape = didEscape || tapResult == "escape"
        });

        // If it wasn't the music being toggled and no bugs were squished
        if(checkMusicToggle(xPos,yPos) == false && squishedCounter <=  0) {
            // Create new ripple
            // print("new ripple created at ", mouseX,mouseY);
            ripple = new Ripple(xPos,yPos,50,150,50);
            soundEffectManager.doSplash();

            if(didEscape){
                soundEffectManager.doEscapeSound();
            }
        }
    }
}

// function mouseReleased(){
//     if(timeRemaining > 0 && showStartScreen == false){
//         //TODO: read from bugs if a tap occurred and dont do ripple if so

//         var didEscape = false;
        
//         let squishedCounter = 0; 
//         walkers.forEach( function (item,index){
//             tapResult = item.tapOccurred(mouseX,mouseY);
//             squishedCounter += tapResult == "squish" ? 1 : 0;
//             didEscape = didEscape || tapResult == "escape"
//         });

//         // If it wasn't the music being toggled and no bugs were squished
//         if(checkMusicToggle() == false && squishedCounter <=  0) {
//             // Create new ripple
//             // print("new ripple created at ", mouseX,mouseY);
//             ripple = new Ripple(mouseX,mouseY,50,150,50);
//             soundEffectManager.doSplash();

//             if(didEscape){
//                 soundEffectManager.doEscapeSound();
//             }
//         }
//     } else {
//         checkMusicToggle();
//     }

// }

function keyPressed(){
    // walkers.forEach( function (item,index){
    //     item.keyPressed();
    // });
}


function keyReleased(){
    // walkers.forEach( function (item,index){
    //     item.keyReleased();
    // });
}


class LineBreakTransformer {
    constructor() {
      // A container for holding stream data until a new line.
      this.chunks = "";
    }
  
    transform(chunk, controller) {
      // Append new chunks to existing chunks.
      this.chunks += chunk;
      // For each line breaks in chunks, send the parsed lines out.
      const lines = this.chunks.split("\n");
      this.chunks = lines.pop();
      lines.forEach((line) => controller.enqueue(line));
    }
  
    flush(controller) {
      // When the stream is closed, flush any remaining chunks out.
      controller.enqueue(this.chunks);
    }
  }