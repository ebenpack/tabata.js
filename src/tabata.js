/**
 * Configurable interval timer.
 *
 */
function Tabata(timer, optionalDelay, options){
    var timeRe = /(\d*\.?\d*)([hms])/g;
    var events = {};
    var second = -1; // Total seconds elapsed
    var lastUpdate = 0;
    var timeoutId;
    var totalTime = 0;
    var delay = typeof optionalDelay === 'undefined' ? 200 : optionalDelay;
    var defaults = {};
    // Use eventIndex to avoid popping from the queue,
    // so it doesn't need to be rebuilt on reset.
    var eventIndex = 0;
    var roundTimeElapsed = 0;
    var milliseconds = 0;
    var self = this;
    self.eventQueue = [];
    var currentEvent;

    // Extend defaults with options.
    if (typeof options === 'undefined'){
        options = defaults;
    } else {
        for (var op in defaults){
            if (typeof options[op] === 'undefined'){
                options[op] = defaults[op];
            }
        }
    }

    // Update total elapsed time.
    // Fire 'second' events every second-ish while running.
    // Also check for and fire other events.
    function update(){
        var now = Date.now();
        var elapsed = now - lastUpdate;
        milliseconds += elapsed;
        var timeSeconds = Math.floor(milliseconds / 1000);
        currentEvent = self.eventQueue[eventIndex];
        if (currentEvent && timeSeconds - second >= 1){
            second = timeSeconds;
            roundTimeElapsed += Math.floor(elapsed / 1000);
            self.fire('second');
            if (second === currentEvent.time - 3){
                self.fire('three');
            } else if (second === currentEvent.time - 2){
                self.fire('two');
            } else if (second === currentEvent.time - 1){
                self.fire('one');
            }
            while (currentEvent && currentEvent.time <= second){
                self.fire(currentEvent.event);
                eventIndex += 1;
                currentEvent = self.eventQueue[eventIndex];
                roundTimeElapsed = 0;
            }
        }
        lastUpdate = now;
        if (currentEvent){
            timeoutId = setTimeout(update, delay);
        }
    }
    function parseTimer(timer){
        var offset = 0;
        self.eventQueue.push({time: 0, duration: 0, event: 'start'});
        for (var i = 0, len = timer.length; i < len; i++){
            var current = timer[i];
            var rounds = current.hasOwnProperty('rounds') ? current.rounds : 1;
            for (var j = 0; j < rounds; j++){
                for (var k = 0; k < current.events.length; k++){
                    for (var evt in current.events[k]){
                        var currentEvent = current.events[k];
                        var duration = typeof currentEvent[evt] === 'number' ? currentEvent[evt] : parseTime(currentEvent[evt]);
                        self.eventQueue.push({time: offset, duration: duration, event: evt});
                        offset += duration;
                    }
                }
            }
        }
        self.eventQueue.push({time: offset, duration: 0, event: 'end'});
        totalTime = offset;
    }
    function parseTime(time){
        timeRe.lastIndex = 0;
        var match = timeRe.exec(time);
        var milliseconds = 0;
        while (match){
            if (match[2] === 's'){
                milliseconds += parseFloat(match[1]);
            } else if (match[2] === 'm'){
                milliseconds += parseFloat(match[1]) * 60;
            } else if (match[2] === 'h'){
                milliseconds += parseFloat(match[1]) * 3600;
            }
            match = timeRe.exec(time);
        }
        return milliseconds;
    }
    function formatTime(time) {
        return pad(Math.floor(time / 60), 2) + ":" + pad(time % 60, 2);
    }
    function pad(num, size){
        var numStr = num.toString();
        while (numStr.length < size) {
            numStr = '0' + numStr;
        }
        return numStr;
    }
    self.timeElapsed = function(){
        return formatTime(second);
    };
    self.timeRemaining = function(){
        return formatTime(totalTime - second);
    };
    self.roundTimeElapsed = function(){
        return roundTimeElapsed;
    };
    self.roundTimeRemaining = function(){
        return formatTime(self.eventQueue[eventIndex].time - second);
    };
    self.centisecond = function(){
        return formatTime(parseFloat((milliseconds / 1000).toFixed(2)));
    };
    self.start = function(){
        lastUpdate = Date.now();
        update();
    };
    self.stop = function(){
        clearTimeout(timeoutId);
    };
    self.on = function(event, fn){
        if (typeof events[event] === 'undefined'){
            events[event] = [];
        }
        events[event].push(fn);
    };
    self.fire = function(event){
        // TODO: Remove debug statement
        console.log(event);
        if (typeof events[event] !== 'undefined'){
            for (var i = 0, len = events[event].length; i < len; i++){
                events[event][i]();
            }
        }
    };
    function init(){
        parseTimer(timer);
        // Other stuff?
    }
    init();
}
