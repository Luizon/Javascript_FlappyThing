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

export function render() {
	drawBackground();
	cloud.forEach(function(n) {
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