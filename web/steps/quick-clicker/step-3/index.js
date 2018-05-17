
document.addEventListener('DOMContentLoaded', function() { 
    var numClicks = 0;
    var clickCountArea = document.querySelector('.num-clicks');

    function updateCount() {
        numClicks = numClicks + 1;
        clickCountArea.textContent = numClicks;
    }

    clickCountArea.textContent = numClicks;

    var clickButton = document.querySelector('.click-button');
    clickButton.addEventListener('click', updateCount);
    
    
}, false);