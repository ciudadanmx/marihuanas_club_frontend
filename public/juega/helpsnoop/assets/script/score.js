//SCORE ATTRIBUTES
var score = 0;


var scoreOnScreen = document.querySelector('.score__images__container');
var myScore = document.createElement('img');
myScore.src = 'assets/images/weed.png';


function makeScore(){
  
  if (yRovani <= 20){
    xRovani = 200;
    yRovani = 732;

    pointSound.play();
    
    scoreUp();
    
    console.log(score)
  }
}

function scoreUp(){
    score ++
    myScore = document.createElement('img');
    myScore.classList.add("score__image");
    myScore.src = 'assets/images/weed.png';
    scoreOnScreen.appendChild(myScore);
} 

function scoreDown(){
  score --
  document.querySelector('.score__image').remove()

} 



function checkColision(){
  for (var i = 0; i < yCars.length; i++){
    for (var count = 0; count <= actorHeight; count++){ 
      for (var c = 0; c <= actorHeight; c++){
        for (var counter = 0; counter <= actorWidth; counter++){
          if (xCars[i] == xRovani + counter
              && yCars[i] + count == yRovani + c){
            xRovani = 200;
            yRovani = 732;

            crashSound.play();

            scoreDown();

            console.log(score)
          }
        }
      }
    }
  }
}

window.addEventListener("keydown", function(e) {
  if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
      e.preventDefault();
  }
}, false);