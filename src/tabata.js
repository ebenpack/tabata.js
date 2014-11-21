/**
 * Configurable interval timer.
 *
 */
function Tabata(timer, delay, options){
    var events = {};
    var second = 0;
    var lastUpdate = 0;
    var timeoutId;
    var delay = typeof delay === 'undefined' ? 200 : delay;
    var defaults = {
        finalRound: false
    };
    var eventQueue = [];
    var eventCursor = 0;
    var self = this;
    self.time = 0;

    if (typeof options === 'undefined'){
        options = defaults;
    } else {
        for (var op in defaults){
            if (typeof options[op] === 'undefined'){
                options[op] = defaults[op];
            }
        }
    }

    // TODO: parse timer object to create event queue.
    //
    // Update total elapsed time.
    // Fire 'second' events every second-ish while running.
    // Also check for and fire other events.
    function init(){
        parseTimer();
        // Other stuff
    }
    function update(){
        var now = Date.now();
        var elapsed = now - lastUpdate;
        self.time += elapsed;
        var timeSeconds = Math.floor(self.time / 1000);
        if (timeSeconds - second >= 1){
            second = timeSeconds;
            self.fire('second');
            // TODO: Check next item in event queue and fire events
        }
        lastUpdate = now;
        timeoutId = window.setTimeout(update, delay);
    }
    function parseTimer(){
        // TODO: Keep running total in order to record events relative to start
        for (var i = 0, len = timer.length; i < len; i++){
            var current = timer[i];
            var on = typeof current.on === 'number' ? current.on : parseTime(current.on);
            var off = typeof current.off === 'number' ? current.off : parseTime(current.off);
            var rounds = typeof current.rounds === 'number' ? current.rounds : 1;
            for (var j = 0; j < rounds; j++){
                eventQueue.push(on);
                // Do not add a final 'off' round.
                if (options.finalRound ||  j < (rounds - 1) && i < (len - 1)){
                    eventQueue.push(off);
                }
            }
        }
    }
    function parseTime(time){
        var re = /(\d*\.?\d*)([hms])/g;
        var match = re.exec(time);
        var miliseconds = 0;
        while (match){
            if (match[2] === 's'){
                miliseconds += parseFloat(match[1]) * 1000;
            } else if (match[2] === 'm'){
                miliseconds += parseFloat(match[1]) * 60000;
            } else if (match[2] === 'h'){
                miliseconds += parseFloat(match[1]) * 3600000;
            }
            match = re.exec(time);
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
        timeoutId = update();
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
    init();
}
