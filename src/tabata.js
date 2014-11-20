/**
 * Configurable interval timer.
 *
 */
function Tabata(timer){
    var events = {};
    var second = 0;
    var lastUpdate = 0;
    var timeoutId;
    var self = this;
    self.time = 0;
    // Run updates every second-ish while running.
    var update = function(){
        var now = Date.now();
        var elapsed = now - lastUpdate;
        self.time += elapsed;
        var timeSeconds = self.second();
        if (timeSeconds - second >= 1){
            second = timeSeconds;
            self.fire('second');
        }
        lastUpdate = now;
        timeoutId = window.setTimeout(update);
    };
    self.second = function(){
        return Math.floor(self.time / 1000);
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
