//==========================================
// DECLARING VARIABLES
//==========================================
var canvas = document.getElementById("canvas");
var pauseCanvas;
var draw; // canvas context
var pauseCtx; // pause canvas context
var width, height;
var fps;
var backgroundColor;
var floorHeight;
var score;
var hudFontSize;
var hudFont;
var pause, started, finished;
var enter, space, control;

function initializeVariables() {
    draw = canvas.getContext("2d");
    pauseCanvas = document.getElementById("pause");
    pauseCtx = pauseCanvas.getContext("2d");
    width = document.documentElement.clientWidth;
    height = document.documentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    pauseCanvas.width = width;
    fps = 60;
    backgroundColor = "#0DD";
    floorHeight = height/10;
    score = 0;
    hudFontSize = (width<height ? width: height)/10;
    hudFont = hudFontSize + "px Arial";
    pause = true;
    started = finished = false;
    enter = space = control = false;
}

//==========================================
// OBJECTS
//==========================================
var nube;
var player;
var wall;
var pauseButton;
var infoButton;
function initializeObjects() {
	// game objects
	nube = [];
	for(let i=0; i < 6; i++)
	    nube.push(new Nube({}));
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

class Nube {
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

//==========================================
// DRAW FUNCTIONS
//==========================================
function drawBackground() {
	draw.fillStyle = backgroundColor;
	draw.fillRect(0, 0, width, height);
}

function drawFloor() {
	draw.fillStyle = "#4B0";
	draw.fillRect(0, height-floorHeight, width, floorHeight);
}

function drawScore() {
	draw.fillStyle = "#840FFF";
	let text = score + "";
	let fontDiv = 1.7;
	draw.font = hudFont;
	let x = (width - hudFontSize*text.length/fontDiv)/2,
		y = height/20 + hudFontSize;
	let boxWidth = hudFontSize*(text.length+1)/fontDiv;
	draw.fillRect(x - hudFontSize/2/fontDiv, y - hudFontSize*5/4, (hudFontSize*text.length + hudFontSize)/fontDiv, hudFontSize*3/2)
	draw.fillStyle = "#FFF";
	draw.fillText(text, x, y);
}

function drawRect(rect, ctx) {
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
}

function drawCircle(obj, ctx) {
  ctx.fillStyle = obj.color;
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, obj.radius, 0, 2*Math.PI);
  ctx.fill();
}

function drawSmallButton(json) {
  drawCircle({
    x: json.x + json.radius,
    y: json.y + json.radius,
    radius: json.radius,
    color: json.color,
  }, pauseCtx);

  pauseCtx.fillStyle = json.innerColor;
  pauseCtx.font = json.font;
  pauseCtx.fillText(json.innerText, json.x+json.radius/3, json.y+json.radius/3*5);
}

function drawPauseButton() {
  const p = pauseButton;
  drawCircle({
    x: p.x + p.radius,
    y: p.y + p.radius,
    radius: p.radius,
    color: p.color,
  }, pauseCtx);

  pauseCtx.fillStyle = p.innerColor;
  if(finished) {
    pauseCtx.font = p.radius*1.8 + "px Arial";
    pauseCtx.fillText("R", p.x+p.radius/3, p.height-p.height/6);
  }
  else if(!pause) {
    let aux = pauseButton;
    let rect = {
      x: aux.x+aux.width/5,
      y: aux.y+aux.height/5,
      width: aux.width/5,
      height: aux.height/5*3,
    };
    drawRect(rect, pauseCtx);
    drawRect({
      x: rect.x+aux.width/5*2,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    }, pauseCtx);
  }
  else {
    let aux = pauseButton;
    pauseCtx.beginPath();
    pauseCtx.moveTo(aux.x+aux.width/4, aux.y+aux.height/5);
    pauseCtx.lineTo(aux.x+aux.width/4*3, aux.y+aux.height/2);
    pauseCtx.lineTo(aux.x+aux.width/4, aux.y+aux.height/5*4);
    pauseCtx.closePath();
    pauseCtx.fill();
  }
}

function drawButtons() {
	drawPauseButton();
	if(pause || !started || finished)
		drawSmallButton(infoButton);
	else {
		// Store the current transformation matrix
		pauseCtx.save();
		
		// Use the identity matrix while clearing the canvas
		pauseCtx.setTransform(1, 0, 0, 1, 0, 0);
		pauseCtx.clearRect(0, 0, pauseButton.x, pauseCanvas.height);
		
		// Restore the transform
		pauseCtx.restore();
	}
	draw.globalAlpha = pauseButton.alpha;
    draw.drawImage(pauseCanvas, 0, (height - pauseButton.height)/2);
    draw.globalAlpha = "1";
}

function render() {
	drawBackground();
	nube.forEach(function(n) {
		n.draw();
	});
	wall.forEach(function(w) {
		w.draw();
	});
	drawFloor();
	player.draw();
	drawScore();
	drawButtons();
	
	draw.fillStyle = "#000";
	draw.font = hudFontSize/2 + "px Arial";
	if(!started)
		draw.fillText("Tap the play button to start!", 0, height - floorHeight/10);
	else if(finished)
		draw.fillText("You lost :0!"
		+ "  Tap the R button to restart!", 0, height - floorHeight/10);
}

//==========================================
// GAME EVENTS
//==========================================
// single click event (works with touch and mouse)
canvas.addEventListener("click", function(click) {
  let p = {
    x: pauseButton.x,
    y: pauseButton.yFalse,
    width: pauseButton.width,
    height: pauseButton.height,
  };
  if(pointCollision(click.x, click.y, p)) {
    pause = !pause;
    started = true;
    render();
    
    if(finished)
    	restart();
    return;
  }
  let i = {
    x: infoButton.x,
    y: pauseButton.yFalse + infoButton.y,
    width: infoButton.width,
    height: infoButton.height,
  };
  if(pause || !started || finished)
    if(pointCollision(click.x, click.y, i)) {
      info();
      return;
    }
  
  if(pause)
  	return;
  // It wasn't a click on a button and there's no pause, then hop
  player.hop();
});

// key events, if the user have a keyboard
window.addEventListener("keydown", function(key) {
  console.log(key)
  if(key.key == "Enter" && !enter) {
    pause = !pause;
    started = true;
    render();
    
    if(finished)
    	restart();
    enter = true;
  }
  if((key.key == "I" || key.key == "i") && !control) { // don't show the information alert if the user try to inspect the game
    if(pause || finished || !started)
      info();
  }
  if((key.key == "R" || key.key == "r") && !control) { // don't restart if the user try to inspect the game
    if(finished) {
      restart();
      pause = true;
    }
  }
  if(key.key == "Control" && !control)
    control = true;
  if(key.keyCode == 32 && !space) {
    if(!pause) { // there's no hop if the user is on pause 8]
      player.hop();
      space = true;
    }
  }
});

window.addEventListener("keyup", function(key) {
  if(key.key == "Control")
    control = false;
  if(key.key == "Enter")
    enter = false;
  if(key.keyCode == 32)
    space = false;
});

//==========================================
// GAME THINGS
//==========================================
function restart() {
	finished = started = false;
	wall.forEach(function(w, index) {
		w.floatX = w.initialX;
		w.x = w.floatX;
		w.hole = w.initialHoleHeight;
		w.pointGiven = false;
	});
	score = 0;
}

function info() {
  let answer = prompt("Flappy Thing: just an awful Flappy Bird wannabe 8]"
  + "\nMade by: P_Luizon"
  + "\n\n"
  + "If you find any bug please feel free to tell me about it."
  + "\n\n"
  + "Enter \"sure\" if you'll do 8]"
  + "\n\nAlso, if you want to see some other projects, you can visit my Github. Write"
  + " \"github\" if you want to go there 8]", "Nah")
  if(answer == "sure") {
    // trying to redirect the user to the mail thing
    var mailMessage = "Hey dude, I found some things you have to fix in that Flappy Bird wannabe you made.";
    var subject = "Fix this bugs from your GitHub Flappy Thing, folk";
    document.location.href = "mailto:pluizoncv@gmail.com?"
    + "subject=" + encodeURIComponent(subject)
    + "&body=" + encodeURIComponent(mailMessage);
    
    return;
  }
  if(answer == "github") {
    // trying to redirect the user to my github
    document.location.href = "https://github.com/luizon";
  }
}

function collides(obj1, obj2) {
  let x11 = obj1.x,
    y11 = obj1.y,
    x12 = obj1.x + obj1.width,
    y12 = obj1.y + obj1.height,
    x21 = obj2.x,
    y21 = obj2.y,
    x22 = obj2.x + obj2.width,
    y22 = obj2.y + obj2.height;
  if((x11 >= x21 && x11 <= x22)
  || (x12 >= x21 && x12 <= x22)) {
    if(y11==y21 || y11==y22
    || y12==y21 || y12==y22)
      return true;
    if((y12 > y21 && y12 < y22)
    || (y11 > y21 && y11 < y22))
      return true;
    }
  return false;
}

function pointCollision(x, y, rect) {
  return (x>=rect.x && x<=rect.x+rect.width
    && y>=rect.y && y<=rect.y+rect.height);
}

function loop() {
	if(!pause && started) {
		wall.forEach(function(w) {
			w.move();
		});
	}
	// clouds don't give a damn 'bout pause 8]
	nube.forEach(function(n) {
		n.move();
	});
	
	// the flappy thing will know what to do by it self 8]
	player.move();
	
	// you need to draw the changes 8]
	render();
}

//==========================================
// IIFE
//==========================================
;(function() {
    initializeVariables();
    initializeObjects();
    setInterval(loop, 1000/fps);
})();