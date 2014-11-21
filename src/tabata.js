/**
 * Configurable interval timer.
 *
 */
function Tabata(timer, delay){
    var events = {};
    var second = 0;
    var lastUpdate = 0;
    var timeoutId;
    var delay = typeof delay === 'undefined' ? 200 : delay;
    var eventQueue = [];
    var eventCursor = 0;
    var self = this;
    self.time = 0;

    // TODO: parse timer object to create event queue.
    //
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
            // TODO: Check next item in event queue and fire events
        }
        lastUpdate = now;
        timeoutId = window.setTimeout(update, delay);
    }
    function parseTimer(){
        for (var i = 0, len = timer.length; i < len; i++){
            // Parse some stuff
        }
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
}
