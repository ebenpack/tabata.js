/**
 * Configurable interval timer.
 *
 */
function Tabata(timer, delay, options){
    var timeRe = /(\d*\.?\d*)([hms])/g;
    var events = {};
    var second = -1;
    var lastUpdate = 0;
    var timeoutId;
    var delay = typeof delay === 'undefined' ? 200 : delay;
    var defaults = {
        finalRound: false
    };
    var eventQueue = [];
    // Use eventIndex to avoid popping from the queue,
    // so it doesn't need to be rebuilt on reset.
    var eventIndex = 0;
    var self = this;
    self.time = 0;

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
        self.time += elapsed;
        var timeSeconds = Math.floor(self.time / 1000);
        if (timeSeconds - second >= 1){
            second = timeSeconds;
            self.fire('second');
            var nextEvent = eventQueue[eventIndex];
            if (second === nextEvent.time - 3){
                self.fire('three');
            } else if (second === nextEvent.time - 2){
                self.fire('two');
            } else if (second === nextEvent.time - 1){
                self.fire('one');
            } else if (second >= nextEvent.time){
                self.fire(nextEvent.event);
                eventIndex += 1;
            }
        }
        lastUpdate = now;
        timeoutId = window.setTimeout(update, delay);
    }
    function parseTimer(){
        var offset = 0;
        for (var i = 0, len = timer.length; i < len; i++){
            var current = timer[i];
            var on = typeof current.on === 'number' ? current.on / 1000 : parseTime(current.on);
            var off = typeof current.off === 'number' ? current.off / 1000 : parseTime(current.off);
            var rounds = typeof current.rounds === 'number' ? current.rounds : 1;
            for (var j = 0; j < rounds; j++){
                eventQueue.push({time: offset, event: 'on'});
                offset += on;
                // Do not add a final 'off' round.
                if (j < (rounds - 1) && i < (len - 1)){
                    if (options.finalRound){
                        eventQueue.push({time: offset, event: 'off'});
                        offset += off;
                    }
                    eventQueue.push({time: offset, event: 'finish'});
                } else {
                    eventQueue.push({time: offset, event: 'off'});
                    offset += off;
                }
            }
            eventQueue.push({time: offset, event: 'roundover'});
        }
    }
    function parseTime(time){
        timeRe.lastIndex = 0;
        var match = timeRe.exec(time);
        var miliseconds = 0;
        while (match){
            if (match[2] === 's'){
                miliseconds += parseFloat(match[1]);
            } else if (match[2] === 'm'){
                miliseconds += parseFloat(match[1]) * 60;
            } else if (match[2] === 'h'){
                miliseconds += parseFloat(match[1]) * 3600;
            }
            match = timeRe.exec(time);
        }
        return miliseconds;
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
    self.second = function(){
        return formatTime(second);
    };
    self.centisecond = function(){
        return formatTime(parseFloat((self.time / 1000).toFixed(2)));
    };
    self.start = function(){
        lastUpdate = Date.now();
        update();
    };
    self.stop = function(){
        window.clearTimeout(timeoutId);
    };
    self.on = function(event, fn){
        if (typeof events[event] === 'undefined'){
            events[event] = [];
        }
        events[event].push(fn);
    };
    self.fire = function(event){
        if (typeof events[event] !== 'undefined'){
            for (var i = 0, len = events[event].length; i < len; i++){
                events[event][i]();
            }
        }
    };
    function init(){
        parseTimer();
        // Other stuff?
    }
    init();
}
