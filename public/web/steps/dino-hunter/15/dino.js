var zSpritesheet = "/web/code/images/raptorspritesheet.png";
var raptorSprite = new Image();
raptorSprite.src = zSpritesheet;
var bSpritesheet = "/web/code/images/trispritesheet.png";
var triSprite = new Image();
triSprite.src = bSpritesheet;
var oSpritesheet = "/web/code/images/babyspritesheet.png";
var babySprite = new Image();
babySprite.src = oSpritesheet;
var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");
var state = {WALKING:0,JUMPING:1,DYING:2}
var type = {RAPTOR:0,TRI:1,BABY:2}
var babyCharacters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
var dictionary = [];
var dictionaryLoaded = false;
var triRoar = new Audio('/web/code/audio/triroar.wav');
var raptorKill = new Audio('/web/code/audio/raptorkill.wav');
var babyKill = new Audio('/web/code/audio/babykill.wav');
var triKill = new Audio('/web/code/audio/triroar.wav');
var bite = new Audio('/web/code/audio/bite.wav');
var music = new Audio('/web/code/audio/Chee Zee Jungle.mp3');
//music.autoplay = true;
music.loop = true;
var go = false;
var kills = 0;
var health = 10;

fetch('misc/words.txt')
  .then((response) => {
  
     response.text().then((data)=>{
       dictionary = data.split("\n");
       dictionaryLoaded = true;
     })
     .then(()=>{start();})
  })
var bg = new Image();
bg.src = "/web/code/images/dinobg.png";
var renderList = [];
var Dino = function(options){
  
  var z = {};
  z.type = type.RAPTOR;
  z.image = raptorSprite;
  z.word = dictionary[Math.floor(Math.random()*dictionary.length)]
  z.oWordLength = z.word.length;
  z.state = options&&options.state? options.state : state.WALKING;
  
  z.x = options&&options.x? options.x:0;
  z.y = options&&options.y? options.y:0;
  z.w = options&&options.w? options.w:100;
  z.h = options&&options.h? options.h:150;
  z.p = options&&options.p? options.p:1000;
  z.v = Math.max(0.1,Math.min(0.7,Math.sqrt(500/z.p)));
  z.cycle = 0;
  
  z.scale = options&&options.scale? options.scale:1;
  z._a = 0;
  z._salt = Math.floor(Math.random()*z.p);
  z.move = function(){
    if((z.word.length < z.oWordLength/2) && z.state != state.JUMPING && z.state != state.DYING){
       
       z.setState(state.JUMPING);
     }
     if(z.state == state.WALKING ){
       z.y+= z.v;
     }
     else if(z.state == state.JUMPING){
       if(z.cycle%2==1){
         z.y+= 3*z.v;
       }
     }
     if(z.y > (canvas.height-z.h*3/4)){
       z.destroy();
       bite.play();
       health-=1;
     }
  }
  z.draw = function(){
    var d = new Date();
    var n = (d.getTime() + z._salt)%z.p;

    ctx.globalAlpha = z._a;
    if(z.state === state.WALKING){
      //console.log(z.image.src)
      z.cycle = Math.floor(n*6/z.p);
      ctx.drawImage(z.image,211 + 32.5*z.cycle,30,37,70,z.x,z.y,z.w,z.h);
    }
    if(z.state === state.JUMPING){
      z.cycle = Math.floor(n*2/z.p);
      ctx.drawImage(z.image,632 - 34*z.cycle, 30,37,70,z.x,z.y,z.w,z.h);
    }
    if(z.state === state.DYING){
      
      z.cycle = Math.floor(n*5/z.p);
      //console.log(z.cycle);
      switch(z.cycle){
        case 0:ctx.drawImage(z.image,730,30,70,70,z.x,z.y,z.w,z.h);break;
        case 1:ctx.drawImage(z.image,730,96,70,60,z.x,z.y,z.w,z.h);break;
        case 2:ctx.drawImage(z.image,730,156,60,55,z.x,z.y,z.w,z.h);break;
        case 3:ctx.drawImage(z.image,730,211,40,45,z.x,z.y,z.w,z.h);break;
        case 4:z.destroy();break;
    
      }
      
    }
    /*if(z.word.length > 0){
      var w = ctx.measureText(z.word).width+10;
      ctx.fillStyle = "#000000"
      ctx.fillRect((z.x+z.w/2)-w/2,z.y + 25,w,25);
      ctx.strokeStyle = "#FF0000";
      ctx.beginPath();
      ctx.moveTo((z.x+z.w/2)-w/2, z.y+25);
      ctx.lineTo((z.x+z.w/2)-w/2 + w, z.y+25);
      ctx.lineTo((z.x+z.w/2)-w/2 + w, z.y+50);
      ctx.lineTo((z.x+z.w/2)-w/2,z.y+50);
      ctx.lineTo((z.x+z.w/2)-w/2,z.y+25);
      ctx.stroke();
      ctx.font="10pt VT323";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(z.word,(z.x+z.w/2)-w/2 + 5,z.y+40);
    
    }*/
    
    if(z._a*z.p < z.p ){
        z._a += 10/z.p;
      }
    ctx.globalAlpha = 1;
  }
  z.setState = function(newState){
    var d = new Date();
    var n = d.getTime()%z.p;
    
    z._salt = z.p - n;
    z.state = newState;
    if(newState === state.DYING){
      kills++;
    }
  }
  renderList.push(z);
  z.destroy = function(){
   for( var i = 0; i < renderList.length; i++){ 
     if ( renderList[i] == z) {
       renderList.splice(i, 1); 
     }
     //raptorKill.play();
    }
  }
  return z;
}
var BigDino = function(options){
  var z = Dino(options)
  z.image = triSprite;
  z.w = options&&options.w? options.w:200;
  z.h = options&&options.h? options.h:300;
  z.word = dictionary[Math.floor(Math.random()*dictionary.length)] + " " +
           dictionary[Math.floor(Math.random()*dictionary.length)] + " " +
           dictionary[Math.floor(Math.random()*dictionary.length)];
  //z.v *= 0.5;
  z.move = function(){   
    if(z.state != state.DYING){
      z.y+= z.v;
      if(z.y > (canvas.height-z.h*3/4)){
        z.destroy();
        bite.play();
        health-=1;
      }
    }
    else{
      z.y-= z.v;
      if(z.y < 0){
        z.destroy();
      }
    }
       
  }
  z.draw = function(){
    var d = new Date();
    var n = (d.getTime() + z._salt)%z.p;
    z.cycle = Math.floor(n*4/z.p);
    ctx.globalAlpha = z._a;
    ctx.drawImage(z.image,5 + 64*z.cycle,20,64,100,z.x,z.y,z.w,z.h);
    if(z.state === state.DYING && z.y < 75){
      z._a -= z._a*0.1
    }
    if(z.word.length < 0){
      var w = ctx.measureText(z.word).width+10;
      ctx.fillStyle = "#000000"
      ctx.fillRect((z.x+z.w/2)-w/2,z.y + 125,w,25);
      ctx.strokeStyle = "#FF0000";
      ctx.beginPath();
      ctx.moveTo((z.x+z.w/2)-w/2, z.y+125);
      ctx.lineTo((z.x+z.w/2)-w/2 + w, z.y+125);
      ctx.lineTo((z.x+z.w/2)-w/2 + w, z.y+150);
      ctx.lineTo((z.x+z.w/2)-w/2,z.y+150);
      ctx.lineTo((z.x+z.w/2)-w/2,z.y+125);
      ctx.stroke();
      ctx.font="10pt VT323";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(z.word,(z.x+z.w/2)-w/2 + 5,z.y+140);
    
    }
    if(z._a*z.p < z.p ){
        z._a += 10/z.p;
      }
    ctx.globalAlpha = 1;
  }
  z.destroy = function(){
   for( var i = 0; i < renderList.length; i++){ 
     if ( renderList[i] == z) {
       renderList.splice(i, 1); 
     }
     //triKill.play();
    }
  }
  
}
var BabyDino = function(options){
  var z = Dino(options)
  z.image = babySprite;
  z.w = options&&options.w? options.w:50;
  z.h = options&&options.h? options.h:50;
  z.word = babyCharacters[Math.floor(Math.random()*babyCharacters.length)]
  z.direction = Math.random()*180 + 180;
  z._pick = true;
  z.move = function(){   
    if(z.cycle == 0 && !z._pick){
      z.direction = Math.random()*180 + 180;
      z._pick = true;
    }
    if(z.cycle!=0)
      z._pick = false;
    if(z.state != state.DYING){
      z.y+= z.v//*0.5*Math.abs(Math.sin(z.direction*Math.PI/180));
      //z.x+= z.v*Math.cos(z.direction*Math.PI/180);
      if(z.x < 50)
        z.x = 50;
      if(z.x > canvas.width - 50)
        z.x = canvas.width - 50;
      if(z.y > (canvas.height-z.h*3/4)){
        z.destroy();
        bite.play();
        health-=1;
      }
    }
    
       
  }
  z.draw = function(){
    var d = new Date();
    var n = (d.getTime() + z._salt)%z.p;
    z.cycle = Math.floor(n*4/z.p);
    ctx.globalAlpha = z._a;
    if(true ){//z.state === state.WALKING && Math.abs(z.direction-270) < 30){
      //console.log(z.image.src)
      z.cycle = Math.floor(n*3/z.p);

      ctx.drawImage(babySprite,16 + 21*z.cycle,68,15,18,z.x,z.y,z.w*0.85,z.h);
      
    }
    else if(z.state === state.WALKING && Math.abs(z.direction-270) < 60){
      //console.log(z.image.src)
      
      z.cycle = Math.floor(n*3/z.p);
      switch(Math.sign(z.direction-270)){
        case -1:ctx.drawImage(babySprite,6 + 26*z.cycle,18,25,20,z.x,z.y,z.w,z.h); break;
        case 1:
        default:ctx.drawImage(babySprite,85 + 26*z.cycle,43,25,20,z.x,z.y,z.w,z.h); break;
        
      }
      
    }
    else if(z.state === state.WALKING && Math.abs(z.direction-270) <= 90){
      //console.log(z.image.src)
      
      z.cycle = Math.floor(n*3/z.p);
      switch(Math.sign(z.direction-270)){
        case -1: ctx.drawImage(babySprite,85 + 27*z.cycle,68,25,20,z.x,z.y,z.w,z.h);break;
        case 1:
        default: ctx.drawImage(babySprite,4 + 27*z.cycle,43,25,20,z.x,z.y,z.w,z.h);
      }
      
    }
    else if(z.state === state.DYING){
      
      z.cycle = Math.floor(n*4/z.p);

      //console.log(z.cycle);
      switch(z.cycle){
        case 0:
        case 1:
        case 2:ctx.drawImage(babySprite,158,18 + 22*z.cycle,25,22,z.x + z.cycle*5,z.y+z.cycle*5,z.w*(4 - z.cycle)/4,z.h*(4 - z.cycle)/4);break;
        case 3:z.destroy();break;
    
      }
      
    }
    if(z.word.length < 0){
      var w = ctx.measureText(z.word).width+10;
      ctx.fillStyle = "#000000"
      ctx.fillRect((z.x+z.w/2)-w/2,z.y-15,w,25);
      ctx.strokeStyle = "#FF0000";
      ctx.beginPath();
      ctx.moveTo((z.x+z.w/2)-w/2, z.y-15);
      ctx.lineTo((z.x+z.w/2)-w/2 + w, z.y-15);
      ctx.lineTo((z.x+z.w/2)-w/2 + w, z.y+10);
      ctx.lineTo((z.x+z.w/2)-w/2,z.y+10);
      ctx.lineTo((z.x+z.w/2)-w/2,z.y-15);
      ctx.stroke();
      ctx.font="10pt VT323";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(z.word,(z.x+z.w/2)-w/2 + 5,z.y+0);
    
    }
    if(z._a*z.p < z.p ){
        z._a += 10/z.p;
      }
    ctx.globalAlpha = 1;
  }
  z.destroy = function(){
   for( var i = 0; i < renderList.length; i++){ 
     if ( renderList[i] == z) {
       renderList.splice(i, 1); 
     }
     //babyKill.play();
    }
  }
  
}

var physics = function(){
  for(var i=0; i < renderList.length;i++){
    renderList[i].move();

    
  }
  /*if(health<=0){
    console.log("Game Over");
    gameMessage = ["YOU HAVE BEEN CONSUMED","Your score was " + kills + " Dino kills"];
    for(var j = 0; j < renderList.length; j++)
    {
      renderList[j].destroy();
    }
    go = true;
    //window.location.href = goURL;
  }*/
}

var draw = function(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(bg,0,0,canvas.width,canvas.height);
  ctx.font="10pt VT323";
  ctx.fillStyle = "#FFFFFF";
  var killsText= "Dino Kills: " + kills;
  ctx.fillText(killsText,canvas.width/2-ctx.measureText(killsText).width/2,50);
  var healthText= "Health: " + health;
  ctx.fillText(healthText,canvas.width/2-ctx.measureText(healthText).width/2,25);
  ctx.font = "40pt VT323";
  
  for(var i =0;i < gameMessage.length;i++)
  {
    var m = ctx.measureText(gameMessage[i])
    ctx.fillText(gameMessage[i], canvas.width/2-m.width/2,i*(60) + canvas.height/2);
  }
  ctx.font = "10pt VT323";

  for(var i = 0; i < renderList.length;i++){
    renderList[i].draw();
  }

  requestAnimationFrame(draw);
  //zombie.draw();
}
var diff = 0;
var spawner = function(){
  if(go)return;
  diff++;
  if((diff >= 300 - kills)){
    diff = 0;
    var dOptions = {};
    dOptions.x = Math.max(Math.min(Math.random()*canvas.width,0.8*canvas.width),0.1*canvas.width);
    dOptions.y = 0;
    dOptions.p = Math.floor(Math.random()*1500) + 1000;
    if(Math.random() > (0.55-kills/1000)){
      BigDino(dOptions);
      //triRoar.play();
    }
    else
      Dino(dOptions);
    dOptions.x = Math.max(Math.min(Math.random()*canvas.width,0.9*canvas.width),0.1*canvas.width);
    dOptions.y = 0;
    dOptions.p = Math.floor(Math.random()*1500) + 1000;
    BabyDino(dOptions);

  }
      
}
var gameMessage = "";
function start(){
  
  if (canvas.getContext && dictionaryLoaded)
  {
    //gameMessage = ["DINO HUNTER","Type the words above the Dinos as fast as possible","Hunt. Survive. Type."];
    /*setTimeout(()=>{
      gameMessage=[];
    },5000)*/
    setInterval(spawner,10);
    setInterval(physics, 10);
    //new Dino();
    requestAnimationFrame(draw);
    //console.log(zombie)
    
  }

}
window.onkeypress = function(e){
  if(music.paused)
    //music.play();
  for(var i = 0; i < renderList.length;i++){

    if(e.key === renderList[i].word.substring(0,1)){
      renderList[i].word = renderList[i].word.substring(1);
      if(renderList[i].word.length===0 && renderList[i].state != state.DYING){
        console.log("setDying");
        renderList[i].setState(state.DYING);
      }
    }
  }
}
