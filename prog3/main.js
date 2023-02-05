let spriteSheet;
let walkers;


function preload(){
    spriteSheet = loadImage("./assets/SpelunkyGuy.png");
    
    // WalkingSprite(spiteSheet, tilingWidth, tilingHeight, numFramesInAnimation, drawingWidth, drawingHeight, xPos, yPos)
    walkers = [ new WalkingSprite(spriteSheet,80,80,9,80,80,200,100),
                new WalkingSprite(spriteSheet,80,80,9,80,80,200,300),]
}


function setup(){
    createCanvas(400,400);
    imageMode(CENTER);
}

function draw(){
    background(220);
    walkers.forEach( function (item,index){
        item.draw();
    });

}

function keyPressed(){
    walkers.forEach( function (item,index){
        item.keyPressed();
    });
}


function keyReleased(){
    walkers.forEach( function (item,index){
        item.keyReleased();
    });
}

class WalkingSprite{
    
    constructor(spriteSheet, tileWidth, tileHeight, numAnimationFrames, height, width,  xPos,yPos,  ){
        this.spriteSheet = spriteSheet;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.numAnimationFrames = numAnimationFrames;
        this.height = height;
        this.width = width;
        this.xPos = xPos;
        this.yPos = yPos;

        this.currentFrame = 0;

        // xDirection 1 means that the sprite is facing the right, -1 = left
        this.xDirection = 1;

        this.tileRowIterator = 0;
        this.tileColumnIterator = 0;

        this.moveSpeed = 0;
    }

    draw(){

        this.tileColumnIterator = this.currentFrame % this.numAnimationFrames;
        
        push();
        // Translating so that (0,0) corresponds to the sprites top left
        translate(this.xPos,this.yPos);
        
        // Scaling to flip sprite if xDirection == -1
        scale(this.xDirection,1);
        
        // Start at location 0 0 because of the translate  
        image(this.spriteSheet,0,0,this.height,this.width,this.tileColumnIterator*this.tileWidth,this.tileRowIterator*this.tileHeight,this.tileWidth, this.tileHeight);
        pop();
        
        // Only update frame every 6 p5 draw ticks and only if character moving
        if(frameCount % 6 == 0 && this.moveSpeed != 0){
            this.currentFrame++;
        }
        
        // Change xPos by the move speed of the walker
        this.xPos += this.moveSpeed;
    }

    keyPressed(){
        if (keyCode === RIGHT_ARROW){
            this.moveSpeed = 2;
            this.xDirection = 1;
            this.currentFrame = 1;
        } 
        else if (keyCode === LEFT_ARROW){
            this.moveSpeed = -2;
            this.xDirection = -1;
            this.currentFrame = 1;
        } 
    }

    
    keyReleased(){
        if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW){
            this.moveSpeed = 0;
            this.currentFrame = 0;
        } 
    }
}