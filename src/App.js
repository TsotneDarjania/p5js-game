import style from "./app.module.css"
import P5 from "p5"
import { useEffect, useRef } from 'react';

import playerSourceImage from "./images/player.png"
import backgroundSourceImage from "./images/background.jpg"
import enemySourceImage from "./images/enemy.png"

import ml5 from "ml5"

import "./collider"


let p5;

let playerImage;
let backgroundImage;
let enemyImage;
let enemies = [];
let score = 0;

let playAgainButton;

let classifier;

const sketch = ( p ) => {

  const canvasWidth = 1200;
  const canvasHeight = 650;

  const minimumTimeForEnemey = 800;

  let player;

  p.preload = () => {
    const options = { probabilityThreshold: 0.95 };
    classifier = ml5.soundClassifier('SpeechCommands18w', options, modelReady);

    playerImage = p.loadImage(playerSourceImage)
    backgroundImage = p.loadImage(backgroundSourceImage)
    enemyImage = p.loadImage(enemySourceImage)
  }

  p.setup = () => {
    p5 = p;
    p.createCanvas(canvasWidth,canvasHeight)
    p.background(60)
    player = new Player();
    createEnemy();

    playAgainButton = p.createButton('play again');
    playAgainButton.style("background-color","rgb(231, 74, 26);")
    playAgainButton.style("width","200px")
    playAgainButton.style("height","60px")
    playAgainButton.style("border","2px solid rgb(198, 46, 0)")
    playAgainButton.style("color","black")
    playAgainButton.style("font-size","20px")
    playAgainButton.style("cursor","pointer")
    playAgainButton.style("display","none")
    playAgainButton.position(window.innerWidth/2-playAgainButton.width/2, window.innerHeight/2);
    playAgainButton.mousePressed(playAgain);
  };



  function modelReady() {
    // classify sound
    classifier.classify(gotCommand);
  }

  function gotCommand(error, result){
    if(error){
      console.error(error)
    }
    if(result[0].label === 'up'){
      player.jump();
    }
    
  }

  p.draw = () => {
    p.background(backgroundImage);

    for (let enemy of enemies){
      enemy.move();
      enemy.show();
      if(player.hits(enemy)){
        console.log("game over");
        playAgainButton.style("display","block")
        p.noLoop();
      }
    }

    p.textSize(70);
    p.text(score, 10, 60);
    p.fill("red");


    player.show();
    player.move();


  }

  function playAgain(){
    window.location = "";
  }

  function createEnemy(){
    setInterval(() => {
      if(p.random(1) < 0.5){
        enemies.push(new Enemy())
      }
    }, minimumTimeForEnemey);

  }

  p.keyPressed = () => {
    if(p.key === " "){
      player.jump();
    }
  }

};


class Player{
  constructor(){
    this.lineLength = 80;
    this.x = 80;
    this.y = 0;
    this.velocityY = 0;
    this.gravity = 1;
  }

  jump(){
    if(this.y === p5.height - this.lineLength-120){
      this.velocityY = -22;
    }
  }

  move(){
    this.y += this.velocityY;
    this.velocityY += this.gravity;
    this.y = p5.constrain(this.y,0,p5.height - this.lineLength-120)
  }

  show(){
    p5.image(playerImage,this.x,this.y,this.lineLength,this.lineLength)
  }

  hits(enemy){
    return p5.collideRectRect(this.x, this.y, this.lineLength, this.lineLength,  
       enemy.x, enemy.y, enemy.lineLength, enemy.lineLength);
  }
}

class Enemy {
  constructor(){
    this.lineLength = 70;
    this.x = p5.width;
    this.y = p5.height - this.lineLength-120;
    this.destroy = false;
  }

  move(){
    this.x -= 7;
    if(this.destroy === false && this.x < 0){
        score += 1;
        this.destroy = true;
    }
  }

  show(){
    p5.image(enemyImage,this.x,this.y,this.lineLength,this.lineLength)
  }
}

function App() {

  const canvasRef = useRef();

  useEffect(() => {
      const p5 = new P5(sketch,canvasRef.current)
      return () => {
          p5.remove();
      } 
  }, [])


  return (
    <div className={style.app}>
      <h2> Press Space or you can just say "Up" however very clear </h2>
      <div ref={canvasRef}> </div>
    </div>
  );
}

export default App;
