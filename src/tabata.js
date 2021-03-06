/**
 * Configurable interval timer.
 *
 */
function Tabata(timer, optionalDelay, options){
    var events = {};
    var totalTimeElapsed = 0;
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
    var playing = false;
    var currentEvent = null;
    var nextEvent = null;
    self.eventQueue = [];

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
        if (!currentEvent){
            self.fire('begin');
        }
        var now = Date.now();
        var elapsed = now - lastUpdate;
        milliseconds += elapsed;
        var timeSeconds = Math.floor(milliseconds / 1000);
        currentEvent = self.eventQueue[eventIndex];
        nextEvent = self.eventQueue[eventIndex];
        if (currentEvent && timeSeconds - totalTimeElapsed >= 1){
            var secondsElapsed = timeSeconds - totalTimeElapsed;
            totalTimeElapsed = timeSeconds;
            while (currentEvent && currentEvent.time <= totalTimeElapsed){
                self.fire(currentEvent.event);
                eventIndex += 1;
                currentEvent = self.eventQueue[eventIndex];
                roundTimeElapsed = 0;
            }
            if (currentEvent){
                roundTimeElapsed += secondsElapsed;
                self.fire(currentEvent.event + '.second');
                if (totalTimeElapsed === currentEvent.time - 3){
                    self.fire(currentEvent.event + '.three');
                } else if (totalTimeElapsed === currentEvent.time - 2){
                    self.fire(currentEvent.event + '.two');
                } else if (totalTimeElapsed === currentEvent.time - 1){
                    self.fire(currentEvent.event + '.one');
                }
            }
        }
        lastUpdate = now;
        if (currentEvent && playing){
            timeoutId = setTimeout(update, delay);
        }
    }
    // Parse event timer object and
    // build event queue
    function parseTimer(timer){
        var offset = 0;
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
    // Parse a time string consisting of hours, minutes, seconds, and return the
    // total number of seconds.
    function parseTime(time){
        var timeRe = /(\d*\.?\d*)([hms])/g;
        var match = timeRe.exec(time);
        var seconds = 0;
        while (match){
            if (match[2] === 's'){
                seconds += parseFloat(match[1]);
            } else if (match[2] === 'm'){
                seconds += parseFloat(match[1]) * 60;
            } else if (match[2] === 'h'){
                seconds += parseFloat(match[1]) * 3600;
            }
            match = timeRe.exec(time);
        }
        return seconds;
    }
    // Return a formatted time (in the
    // format MM:SS) from the given number of seconds
    function formatTime(time) {
        return pad(Math.floor(time / 60), 2) + ":" + pad(time % 60, 2);
    }
    // Pad a number with leading zeroes.
    function pad(num, size){
        var numStr = num.toString();
        while (numStr.length < size) {
            numStr = '0' + numStr;
        }
        return numStr;
    }
    self.timeElapsed = function(){
        return formatTime(totalTimeElapsed);
    };
    self.timeRemaining = function(){
        return formatTime(totalTime - totalTimeElapsed);
    };
    self.roundTimeElapsed = function(){
        return formatTime(roundTimeElapsed);
    };
    self.roundTimeRemaining = function(){
        return formatTime(self.eventQueue[eventIndex].time - totalTimeElapsed);
    };
    self.centisecond = function(){
        return formatTime(parseFloat((milliseconds / 1000).toFixed(2)));
    };
    self.start = function(){
        self.fire('start');
        playing = true;
        lastUpdate = Date.now();
        update();
    };
    self.stop = function(){
        self.fire('stop');
        playing = false;
        clearTimeout(timeoutId);
    };
    self.reset = function(){
        self.fire('reset');
        self.stop();
        lastUpdate = 0;
        totalTime = 0;
        milliseconds = 0;
        currentEvent = null;
        nextEvent = null;
        roundTimeElapsed = 0;
        roundTimeRemaining = 0;
    };
    self.percentComplete = function(){
        return (totalTimeElapsed / totalTime) * 100;
    };
    self.on = function(evts, fn, that, args){
        var eventArray = evts.split(' ');
        if (typeof that === 'undefined'){
            that = self;
        }
        for (var i = 0, len = eventArray.length; i < len; i++){
            var event = eventArray[i];
            if (typeof events[event] === 'undefined'){
                events[event] = [];
            }
            events[event].push([fn, that, args]);
        }
    };
    self.fire = function(evts){
        // Build array of events to fire
        var eventArray = [];
        var tmpArray1 = evts.split(' ');
        for (var i = 0; i < tmpArray1.length; i++){
            var e = tmpArray1[i]
            while (e){
                eventArray.push(e);
                var index = e.lastIndexOf('.')
                if (index > 0){
                    eventArray.push(e.substr(index + 1));
                    e = e.substring(0, index);
                } else {
                    break;
                }
            }
        }
        // Fire events
        for (var i = 0; i < eventArray.length; i++){
            var current = events[eventArray[i]];
            if (typeof current !== 'undefined'){
                for (var j = 0, len = current.length; j < len; j++){
                    var evt = current[j];
                    var args = evt[2] ? evt[2] : [];
                    args.unshift({name: eventArray[i]});
                    evt[0].apply(evt[1], args);
                }
            }
        }
    };
    function init(){
        parseTimer(timer);
    }
    init();
}
