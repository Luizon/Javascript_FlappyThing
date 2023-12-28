// UI objects
  var canvas = document.getElementById("canvas"),
      pauseCanvas;
  var draw, // canvas context
      pauseCtx; // pause canvas context

// UI stuff
  var fps;
  var backgroundColor;
  var score;
  var hudFontSize;
  var hudFont;
  var width,
      height;
  var floorHeight;

// flags
  var pause,
      started,
      finished;
  var enter,
      space,
      control;

// game objects
  var cloud;
  var player;
  var wall;
  var pauseButton;
  var infoButton;
