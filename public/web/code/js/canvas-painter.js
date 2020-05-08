var colors=["Tomato","MediumSeaGreen","CornFlowerBlue","Crimson","LightCoral","LightGreen","Navy","PaleVioletRed"];
var myCanvas = document.getElementById("game");
var myContext = myCanvas.getContext("2d");
myCanvas.addEventListener("mousemove",function(){
  drawRect(event.pageX,event.pageY);
  },true);
function randomColor(){
  return colors[Math.floor(Math.random() * 8)];
}
function drawRect(mX,mY){
  myContext.fillStyle=randomColor();
  var h=Math.floor(Math.random() * 30)+20;
  var w=Math.floor(Math.random() * 30)+20;
  myContext.fillRect(mX-10,mY-80,w,h);
}