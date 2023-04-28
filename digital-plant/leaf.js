class Leaf {
    constructor(spriteSheet, tileWidth, tileHeight, myHeight,myWidth, position, rotationStruct){
        this.spriteSheet = spriteSheet;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.height = myHeight;
        this.width = myWidth;
        this.pos = position;

        this.rot = rotationStruct;

    }




    draw(){
        push();

        // rotateX(this.xRot);

        // translate(500,20);
        translate(this.pos.x,this.pos.y);

        textSize(15);
        fill(0,0,0);
        // // let startX = this.width / 2 * -1;
        // text(this.xRot,-30,this.height / 2 * -1);
        // text(this.yRot,0,this.height / 2 * -1);
        // text(this.zRot ,30,this.height / 2 * -1);



        // rotateX(this.xRot);
        // rotateY(this.yRot);
        // rotateZ(this.zRot);

        rotate(this.rot.z);
        shearX(this.rot.x);
        shearY(this.rot.y);


        image(this.spriteSheet, 0,0,this.width,this.height,0,0,this.tileWidth,this.tileHeight);

        // rotateX(this.xRot);
        // rotateY(this.yRot);
        // rotateZ(this.zRot);


        // translate(this.xPos,this.yPos);

        // // square(this.xPos - this.width / 2,this.yPos, this.height);

        // translate(0, (this.height / 2) * 0.90);

        // // console.log(this.xRot, this.yRot,this.zRot);


        pop();
    }


    rotateBasedOnAngleToRoot(angle){
        let yRot = angle * 0.65 * -1;
        let xRot = angle * (2/6);
        return new RotationStruct(xRot,yRot,angle);
    }


    updateRotation(angleToRoot){
        this.rot = this.rotateBasedOnAngleToRoot(angleToRoot);
    }
}