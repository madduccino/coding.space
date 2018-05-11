
document.addEventListener('DOMContentLoaded', function() { 
    var active = false;
    var firstGame = true;
    var numClicks = 0;
    var secondsLeft = 10;
    var updateInterval = null;

    function countDown() {
        if (active) {
            secondsLeft = secondsLeft - 1;

            displaySeconds(secondsLeft);

            if (secondsLeft === 0) {
                active = false;
                firstGame = false;
                clearInterval(updateInterval)
                setClickButtonText("Time's UP!!")
                setStartButtonText('Try again?')
                setPrompt('You can click quicker than that...');
            }
        }
    }

    function updateCount() {
        if (active) {
            numClicks = numClicks + 1;
        }

        displayClicks(numClicks);
    }

    function startGame() {
        setPrompt('Quick! Click!');

        setClickButtonText('Click Me!');

        if (updateInterval) {
            clearInterval(updateInterval);
        }

        if (firstGame) {

        }
        
        firstGame = false;
        active = true;
        secondsLeft = 10;
        numClicks = 0;

        displaySeconds(secondsLeft);
        displayClicks(numClicks);

        updateInterval = setInterval(countDown, 1000);
    }

    function displayClicks(clickCount) {
        var clickCountArea = document.querySelector('.num-clicks');

        clickCountArea.textContent = clickCount;
    }

    function displaySeconds(secondsCount) {
        var secondsDisplayArea = document.querySelector('.seconds-left');

        secondsDisplayArea.textContent = secondsCount;
    }


    function setPrompt(text) {
        var prompt = document.querySelector('.prompt')
        prompt.textContent = text;
    }

    function setClickButtonText(text) {
        var clickButton = document.querySelector('.click-button');
        clickButton.textContent = text;
    }

    function setStartButtonText(text) {
        var startButton = document.querySelector('.start-button');
        startButton.textContent = text;
    }
    
    function setUpGame() {
        setPrompt('How quick can you click?')

        var startButton = document.querySelector('.start-button');
        var clickButton = document.querySelector('.click-button')

        startButton.addEventListener('click', startGame);
        setStartButtonText('Try it out!');

        clickButton.addEventListener('click', updateCount);
    }

    
    setUpGame();
    
}, false);