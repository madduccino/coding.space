
document.addEventListener('DOMContentLoaded', function() { 
    var numClicks = 0;

    function updateCount() {
        numClicks = numClicks + 1;

        displayClicks(numClicks);
    }

    function displayClicks(clickCount) {
        var clickCountArea = document.querySelector('.num-clicks');

        clickCountArea.textContent = clickCount;
    }
    
    function setUpGame() {
        var clickButton = document.querySelector('.click-button')
        clickButton.addEventListener('click', updateCount);
    }

    
    setUpGame();
    
}, false);