import { initializeObjects } from "./Objects.js";
import { render } from "./Drawing.js";

//==========================================
// DECLARING VARIABLES
//==========================================
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
  // console.log(key)
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
    + "\n\nIf you want to see this and other open source code, you can visit my Github. "
    + "Write \"github\" if you want to go there 8]",
  "Nah")

  if(answer == "sure") {
    var mailMessage = "Hey dude, I found some stuff you have to fix in that Flappy Bird wannabe you made.";
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

export function collides(obj1, obj2) {
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

  cloud.forEach(function(n) {
		n.move();
	});
	
	player.move();
	
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