// Create empty array to store list items
var items = [];

// Save list and text input content in variables
var todo = document.getElementById("to-do");
var input = document.getElementById("input");

// For each items in local storage, create li element
// Set li element's inner HTML to storage item
if (localStorage.getItem("list")) {
  var storage = localStorage.getItem("list").split(",");
  storage.forEach(item => {
    var node = document.createElement("LI");
    node.innerHTML = item;
    todo.appendChild(node);
   })
 }

// When getting local storage, if cross-out class exists, check the box
for (var i = 0; i < todo.children.length; i++) {
   if (todo.children[i].firstChild.className == "cross-out") {
     todo.children[i].firstChild.nextSibling.checked = true;
   }
 }

// Create function to add list elements to page
function addListElement(val) {
  var item = document.createElement("LI");
  
  // Create checkbox
  var check = document.createElement("INPUT");
  check.type = "checkbox";
  
  // Create trash can
  var close = document.createElement("IMG");
  close.src =
    "../images/trash.png";
  
  // Create span element to contain input text
  var task = document.createElement("SPAN");

  task.textContent = val.value;
  check.className = "done";
  close.className = "trash";

  item.append(task);
  item.append(check);
  item.append(close);

  todo.appendChild(item);
  val.value = "";
}

// Call list elements function when enter key pressed
document.getElementById("textBox").addEventListener("keydown", function(e) {
  if (e.keyCode == 13 && this.value.length > 0) {
    addListElement(this);    
  }
});

// Call list elements function when add item button pressed
document.getElementById("add").addEventListener("click", function() {
  var text = document.getElementById("textBox");
  if (text.value.length > 0) {
    addListElement(text)
  }
})

// Check to see if the trash image or checkbox is clicked
document.body.addEventListener("click", function(e) {
  if (e.target.className == "trash") {
    document.getElementById("to-do").removeChild(e.target.parentNode);
    items.splice(items.indexOf(e.target.innerHTML));                                         
  }
  if (e.target.checked) {
    items.splice(items.indexOf(e.target.parentNode.innerHTML));
    e.target.parentNode.firstChild.className = "cross-out";
  } 
  else {
  if (e.target.type == "checkbox") {
    items.splice(items.indexOf(e.target.parentNode.innerHTML));
    e.target.parentNode.firstChild.classList.remove("cross-out");
   }
  }
});

// Push each li element's inner HTML into items array
// Set local storage array items when save button clicked
document.getElementById("save").addEventListener("click", function() {
  if (typeof Storage !== "undefined") {
     for (var i = 0; i < todo.children.length; i++) {
       if (items.indexOf(todo.children[i].innerHTML) == -1) {
        items.push(todo.children[i].innerHTML);
       }
      }
     }  
    localStorage.setItem("list", items);
 });


