	function goBack() {
	 var back = document.createElement("a");
	  back.href = "./";
	  back.id = "back";
	  back.innerHTML = "Back"
	  var h1 = document.querySelector("h1");
	  document.querySelector(".container").insertBefore(back, document.querySelector(".container").firstChild)
	}
	
	
	function loadiframe(id, el) {
	  
	  var iframe = document.getElementById(id);
	  var data = iframe.getAttribute("data-src");
	  iframe.setAttribute("src", data); 
	  
	  var block;

	  if (el) {
	  	el.style.display = "none";
	  	block = el.parentNode;;
	  } else {
	  	block = document.querySelector(".block");
	  }
	 
	  var x = document.createElement("p");
      x.innerHTML = '<img id="loading" src="./images/costume1.svg"><br>Loading...';

      block.insertBefore(x, block.lastElementChild);
	  
       
      iframe.onload = function() { 
      	
      	block.removeChild(x)
      	iframe.style.display = "block";
      	iframe.style.width = "100%";
        iframe.style.height = "402px";

      };
	
	}
	
	
	window.onload = function() {
		loadiframe("full");
		goBack();
	}
