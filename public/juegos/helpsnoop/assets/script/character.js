//ROVANI ATTRIBUTES
var xRovani = 200;
var yRovani = 732;
var rovaniSpeed = 30;
var actorWidth = 55;
var actorHeight = 66;


function drawChar(){
  var rovani = new Image();
  rovani.src = 'assets/images/rovani.png';
  rovani.onload = function(){
    context.drawImage(rovani, xRovani, yRovani, actorWidth, actorHeight)
  }
}

 
//KEYBOARD
var left = 37;
var up = 38;
var right = 39;
var down = 40;



function moveChar(event){
  if (event.keyCode == left ){
    xRovani -= rovaniSpeed    
  }
  else if (event.keyCode == right){
    xRovani += rovaniSpeed
  }
  else if (event.keyCode == up){
    yRovani -= rovaniSpeed
  }
  else if (event.keyCode == down){
    yRovani += rovaniSpeed
  }
}

document.onkeydown = moveChar;

