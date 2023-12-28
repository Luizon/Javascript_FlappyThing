import { collides } from "./FlappyThing.js";

//==========================================
// OBJECTS
//==========================================
export function initializeObjects() {
	cloud = [];
	for(let i=0; i < 6; i++)
	    cloud.push(new Cloud({}));
	wall = [];
	for(let i=0; i < 2; i++) {
	    wall.push(new Wall({x: width+width/2*i}));
		wall[i].floatX+= wall[i].width/2*i;
		wall[i].initialX = wall[i].floatX;
	}
	player = new Player({});
	
	// json's
	let d = width<height?(width/3):(height/3);
	pauseButton = {
    	x: width/2 - d/2,
    	y: 0,
    	yFalse: 0,
    	width: d,
    	height: d,
    	radius: d/2,
    	color: "#420666",
    	innerColor: "#AAA",
    	alpha: "0.5",
    };
    pauseCanvas.height = pauseButton.radius*2;
    pauseButton.yFalse = (height - pauseButton.height)/2; // this one is the real position in the canvas "canvas", y is the position in the canvas "pauseCanvas"
    infoButton = {
    	x: (width - (width/2 + pauseButton.radius))/2 - d/4,
    	y: d/4,
    	width: d/2,
    	height: d/2,
    	radius: d/4,
    	color: "#210333",
    	innerColor: "#AAA",
    	font: d/10*4 + "px Arial",
    	innerText: " i",
    	alpha: "0.5",
	};
}

class Player {
	constructor(json) {
		var tam = width<height ? width: height;
		this.width = json.width || tam/6;
		this.height = json.height || this.width;
		this.x = json.x || width/4 - this.width/2;
		this.y = json.y || height/2 - this.height/2 - floorHeight/2;
		this.floatY = this.y;
		this.color = json.color || "#840";
		this.speed = 0;
		this.gravity = json.gravity || height/1000;
		this.maxSpeed = json.maxSpees || height/50;
		this.hopSpeed = json.hopSpeed || height/50;
		this.eyesPosition = this.y + this.height/2;
	}
	
	draw() {
		draw.fillStyle = this.color;
		let r = this.getRect();
		draw.fillRect(r.x, r.y, r.width, r.height);
		let newEyesPosition = r.y + Math.max(0, Math.min(r.height/2, r.height/5 + this.speed/this.maxSpeed*(r.height/2)));
		this.eyesPosition = newEyesPosition;
		draw.fillStyle = "#FFF";
		draw.fillRect(r.x+r.width/2, this.eyesPosition, r.width/5, r.height/2);
		draw.fillRect(r.x+r.width/2+r.width/10*3, this.eyesPosition, r.width/5, r.height/2);
	}
	
	getRect() {
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
		}
	}
	
	move() {
		if(started && pause || finished)
			return;
		
		this.speed = Math.min(this.maxSpeed, this.speed+this.gravity);
		this.floatY+= this.speed;
		this.y = this.floatY;
		
		if(!started)
			if(this.y > height/2)
				this.hop();
		
		if(started)
			if(this.y < 0 || this.y + this.height > height - floorHeight)
				finished = true;
	}
	
	hop() {
		this.speed =-this.hopSpeed;
	}
}

class Wall {
	constructor(json) {
		var tam = width<height ? width: height;
		this.width = json.width || tam/5;
		this.x = json.x || width;
		this.hole = json.hole || height/2;
		this.y = json.y || Math.min(height-floorHeight-height/15 - this.hole,
			Math.max(height/15, Math.random()*height-this.hole)
		);
		this.floatX = this.x;
		this.color = json.color || "#000";
		this.speed = json.speed || width/180;
		this.initialHoleHeight = this.hole;
		this.minHoleHeight = json.minHoleHeight || height/3;
		this.pointGiven = false;
		this.initialX = this.x;
	}
	
	draw() {
		draw.fillStyle = this.color;
		let r = this.getTopRect();
		draw.fillRect(r.x, r.y, r.width, r.height);
		r = this.getBottomRect();
		draw.fillRect(r.x, r.y, r.width, r.height);
	}
	
	move() {
		// if the player losed, the walls will run to their places
		if(finished) {
			if(this.x<this.initialX)
				this.x+=width/fps;
			return;
		}
		
		// if the wall has crossed the whole stage
		if(this.x < -this.width) {
			this.floatX = width;
			this.y = Math.min(height-floorHeight-height/15 - this.hole,
				Math.max(height/15, Math.random()*height-this.hole)
			);
			this.pointGiven = false;
		}
		
		// anyway, move the wall
		this.floatX-=this.speed;
		this.x = this.floatX;
		
		// this one is to reduce the hole height
		if(this.hole > this.minHoleHeight)
			this.hole = this.hole-height/1000/fps;
		
		// and, guess what? this one increases the score 8]
		if(this.x < player.x && !this.pointGiven) {
			score++;
			this.pointGiven = true;
		}
		
		// and finally, this one kills you
		let easierCollisionBox = { // a smaller hitbox for the walls, but not for the top and bottom
			x: player.getRect().x+player.getRect().width/4,
			y: player.getRect().y+player.getRect().height/4,
			width: player.getRect().width/2,
			height: player.getRect().height/2,
		};
		if(collides(easierCollisionBox, this.getTopRect())
		|| collides(easierCollisionBox, this.getBottomRect())) 
			finished = true;
	}
	
	getTopRect() {
		return {
			x: this.x,
			y: 0,
			width: this.width,
			height: this.y,
		}
	}
	
	getBottomRect() {
		return {
			x: this.x,
			y: this.y + this.hole,
			width: this.width,
			height: height,
		}
	}
}

class Cloud {
	constructor(json) {
		var tam = width<height ? width: height;
		this.width = json.width || tam/8+Math.random()*tam/4;
		this.height = json.height || this.width/2+Math.random()*this.width/4;
		this.x = json.x || Math.random()*width;
		this.floatX = this.x;
		this.y = json.y || Math.random()*height/3 - this.height;
		this.color = json.color || "#FFF";
		this.speed = json.speed || Math.max(1, Math.random()*3);
	}
	
	move() {
		if(this.x < -this.width) {
			this.floatX = width;
			this.y = Math.random()*height/3 - this.height;
			this.speed = 1 + Math.random()*3;
		}
		
		this.floatX-=this.speed;
		this.x = this.floatX;
	}
	
	draw() {
		draw.fillStyle = this.color;
		let r = this.getRect();
		draw.fillRect(r.x, r.y, r.width, r.height);
	}
	
	getRect() {
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
		}
	}
}