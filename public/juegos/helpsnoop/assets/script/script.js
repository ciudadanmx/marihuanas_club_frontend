var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');



//SOUNDS
var backgroundSound = new Audio('assets/sounds/backgroundSound.mp3');
var crashSound = new Audio('assets/sounds/crashSound.wav');
var pointSound = new Audio('assets/sounds/pointSound.mp3');

function playMusic(){
  backgroundSound.play();
}

//ROAD ATTRIBUTES
function drawRoad(){
  var roadImage = new Image();
  roadImage.src = 'assets/images/road.png';
  roadImage.onload = function(){
    context.drawImage(roadImage, 0, 0, 1000, 800)
  }
}
//WEED ATTRIBUTES
function drawWeed(){
  var weed = new Image();
  weed.src = 'assets/images/weed.png';
  weed.onload = function(){

    for (var i=-20; i<1000; i += 75){
      context.drawImage(weed, i, -10, 75, 90)
    }
}
}

/* function clearScreen(){
  context.clearRect(0, 0, 1000, 800);
} */

function draw (){
 // clearScreen()
  drawRoad();
  drawCars();
  drawChar();
  drawWeed();

  moveCar();
  backToPosition();
  checkColision();

  makeScore();
}

setInterval(playMusic, 50);
setInterval(draw, 20);
















