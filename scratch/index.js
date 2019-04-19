	function loadiframe(step, el) {
	  var iframe = document.getElementById(step);
	  iframe.style.display = "block";
	  el.style.display = "none";
	  var data = iframe.getAttribute("data-src");
      iframe.setAttribute("src", data); 
	}
	
	
	function loadfirst() {
	  var iframe = document.getElementById("full");
	  var data = iframe.getAttribute("data-src");
      iframe.setAttribute("src", data); 
	}
	
	window.onload = loadfirst;