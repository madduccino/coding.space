//Synth to speakers
var synth = new Tone.Synth().toDestination();

//key divs for color change
var cNote = document.getElementById("C")
var dNote = document.getElementById("D")
var eNote = document.getElementById("E")

//key press listeners
document.addEventListener('keydown', pressKey);
document.addEventListener('keyup', releaseKey);

//keydown callback
function pressKey(key) {
  //if key is pressed, trigger the synth and change the background color
  switch(key.code){
    case "KeyA":
      console.log("A is pressed!");
      //triggerAttackRelease recieves a string of the pitch name and a rhythm marker
      synth.triggerAttackRelease("C4", "8n");
      cNote.style.backgroundColor = "red"
      break;
    case "KeyS":
      console.log("S is pressed!");
      synth.triggerAttackRelease("D4", "8n");
      dNote.style.backgroundColor = "red"
      break;
    case "KeyD":
      console.log("D is pressed!");
      eNote.style.backgroundColor = "red"
      synth.triggerAttackRelease("E4", "8n");
  }
}

function releaseKey(key) {
  //if key is released, change the background color back to normal
  switch(key.code){
    case "KeyA":
      cNote.style.backgroundColor = "blue"
      break;
    case "KeyS":
      dNote.style.backgroundColor = "blue"
      break;
 case "KeyD":
      eNote.style.backgroundColor = "blue"
  }
}