import { initializeObjects } from "./Objects.js";
import { render } from "./Drawing.js";
var loadingMessage;

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
  let L = {
    x: loginButton.x,
    y: pauseButton.yFalse + loginButton.y,
    width: loginButton.width,
    height: loginButton.height,
  };
  if(pause || !started || finished) {
    if(pointCollision(click.x, click.y, i)) {
      info();
      return;
    }
    if(pointCollision(click.x, click.y, L)) {
      login();
      return;
    }
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
  if(key.key == " " && !space) {
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
  if(key.key == " ")
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
  bootbox.alert({
    message: "<h3>Flappy Thing</h3> just an awful Flappy Bird wannabe 8]"
    + "<br><br><i>Made by: P_Luizon</i>",
    onEscape: true,
    backdrop: true,
    className: 'no-title',
  });
}

function login() {
  let form = $("<div><label id='writeAlphanumeric' for='login-form' class='form-label text-danger' hidden>Please, write only alphanumeric characters (underscores _ are allowed).</label></div>")
  let inputNickname = $('<div class="mb-3"><label for="nickname" class="form-label">Username</label><input class="form-control" type="text" id="nickname" placeholder="Username" required=""><i class="validation"><span></span><span></span></i></div>');
  let inputPass = $('<div class="mb-3"><label for="password" class="form-label">Password</label><input class="form-control" type="password" id="password" placeholder="Password" required=""><i class="validation"><span></span><span></span></i></div>');
  let divLogin = $('<div class="mb-3"></div>');
  let btnLogin = $('<button class="btn btn-primary">Login</button>');
  form.append(inputNickname);
  form.append(inputPass);
  divLogin.append(btnLogin);
  form.append(divLogin);
  
  let divCreateAccount = $('<div class="justify-content-center d-flex"></div>');
  let divSignUp = $('<div><span>First time here? </span></div>');
  let btnSignUp = $('<button class="btn btn-secondary">Create a new account</button>');
  divSignUp.append(btnSignUp);
  divSignUp.append($("<span> using this info</span>"));
  divCreateAccount.append(divSignUp);
  form.append(divCreateAccount);
 
  inputNickname.on("keypress", e => { onlyAlphanumeric(e.key, e); });
  
  bootbox.dialog({
    title: "Login",
    message: form,
    onEscape: true,
    backdrop: true,
  });

  setTimeout(e => $("#nickname").focus(), 666);

  btnLogin.on('click', evt => {
    loadingMessage = bootbox.dialog({
      onEscape: false,
      backdrop: false,
      closeButton: false,
      className: 'no-title',
      message: "<span class='text-center'>Loading...</span>"
    });
    loginAjax();
  });

  btnSignUp.on('click', evt => {
    loadingMessage = bootbox.dialog({
      onEscape: false,
      backdrop: false,
      closeButton: false,
      className: 'no-title',
      message: "<span class='text-center'>Signing up...</span>"
    });
    signUpAjax();
  });
}

function loginAjax() {
  $.ajax({
    url: 'https://flappything-api.luizon.com/login',
    method: 'POST',
    dataType: 'json',
    success: e => {
      bootbox.alert({
        onEscape: false,
        backdrop: false,
        title: 'Ebic',
        message: "You are real."
            + "<br>Congratulations.",
        callback: e => loadingMessage.modal('hide'),
      });
      console.log(e);
    },
    error: e => {
      console.log(e);
      bootbox.alert({
        onEscape: false,
        backdrop: false,
        title: 'Error',
        message: "Something went wrong. Looks like our server is dead or something."
            + "<br>Try again.",
        callback: e => loadingMessage.modal('hide'),
      });
    }
  });
}

function signUpAjax() {
  $.ajax({
    url: 'https://flappything-api.luizon.com/login',
    method: 'POST',
    dataType: 'json',
    success: e => {
      bootbox.alert({
        onEscape: false,
        backdrop: false,
        title: 'Ebic',
        message: "NOW you are real."
            + "<br>Congratulations.",
        callback: e => loadingMessage.modal('hide'),
      });
      console.log(e);
    },
    error: e => {
      console.log(e);
      bootbox.alert({
        onEscape: false,
        backdrop: false,
        title: 'Error',
        message: "Something went wrong. Looks like our server is dead or something."
            + "<br>Try again.",
        callback: e => loadingMessage.modal('hide'),
      });
    }
  });
}

function onlyAlphanumeric(key, e) {
	var letters = /^\w+$/gi; //i means ignorecase
	if (!(key).match(letters)) {
    $("#writeAlphanumeric")[0].hidden = false;
    e.preventDefault();
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