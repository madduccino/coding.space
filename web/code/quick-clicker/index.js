
document.addEventListener('DOMContentLoaded', function() { 
    var active = false;
    var firstGame = true;
    var numClicks = 0;
    var secondsLeft = 10;
    var updateInterval = null;

    function countDown() {
        if (active) {
            secondsLeft = secondsLeft - 1;
            if (secondsLeft === 0) {
                active = false;
                firstGame = false;
                clearInterval(updateInterval)
            }
        }
    }

    function updateCount() {
        if (active) {
            numClicks = numClicks + 1;
        }
    }

    function startGame() {
        setPrompt('Quick! Click!');

        if (updateInterval) {
            clearInterval(updateInterval);
        }
        
        firstGame = false;
        active = true;
        secondsLeft = 10;
        numClicks = 0;

        updateInterval = setInterval(countDown, 1000);
    }

    function setPrompt(text) {
        var prompt = document.querySelector('.prompt')
        var promptText = document.createTextNode(text);
        prompt.appendChild(promptText) 
    }
    
    function setUpGame() {
        setPrompt('How quick can you click?')
        var startButton = document.querySelector('.start-button');
        startButton.addEventListener('click', startGame);
    }

    
    setUpGame();
    
}, false);