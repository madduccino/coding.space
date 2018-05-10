new Vue({
	el: '.app',

	data: {	
		active: false,
        firstGame: true,
		numClicks: 0,
		secs: 10,
        interval: null
	},

	methods: {
        updateCount: function () {
            if (this.active) {
                    this.numClicks = this.numClicks + 1;
            }
        },
    
        start: function() {
            if (this.interval) {
                clearInterval(this.interval);
            }
            
            this.firstGame = false;
            this.active = true;
            this.secs = 10;
            this.numClicks = 0;

            this.interval = setInterval(() => {
                if (this.active) {
                    this.secs = this.secs - 1;
                    if (this.secs === 0) {
                        this.active = false;
                        this.firstGame = false;
                        clearInterval(this.interval)
                    }
                }
            }, 1000);
        }
    }
})
