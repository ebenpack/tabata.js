(function(){
    var body = document.getElementsByTagName('body')[0];
    var time = document.getElementById('time');
    var timeRemainging = document.getElementById('timeRemaining');
    var roundTime = document.getElementById('roundTime');
    var roundtimeRemainging = document.getElementById('roundTimeRemaining');
    var timer = new Tabata(
        [{
            'events': [{'warmup': '10s'}]
        }, {
            'events': [{
                'on': '20s'
            }, {
                'off': '10s'
            }],
            'rounds': 8
        }, {
            'events': [{'cooldown': '10s'}]
        }], 100, {});
    document.getElementById('start').addEventListener('click', timer.start);
    document.getElementById('stop').addEventListener('click', timer.stop);
    document.getElementById('reset').addEventListener('click', timer.reset);
    timer.on('init second end', function(evt){
        time.textContent = timer.timeElapsed();
        timeRemaining.textContent = timer.timeRemaining();
        roundTime.textContent = timer.roundTimeElapsed();
        roundTimeRemaining.textContent = timer.roundTimeRemaining();
    });
    timer.on('on', function(evt){
        body.style.background = 'green';
    });
    timer.on('off', function(evt){
        body.style.background = 'red';
    });

    // Build progress bar
    var progress = document.getElementById('progress');
    var progressbar = document.getElementById('progressbar');
    var totalTime = 0;
    for (var i = 0; i < timer.eventQueue.length; i++){
        totalTime += timer.eventQueue[i].duration;
    }
    var count = 1;
    for (var i = 0; i < timer.eventQueue.length; i++){
        var evt = timer.eventQueue[i];
        var newEvent = document.createElement('div');
        newEvent.className = evt.event;
        if (evt.event === 'on'){
            newEvent.textContent = count;
            count += 1;
        }
        newEvent.style.width = (evt.duration / totalTime * 100) + "%";
        progress.appendChild(newEvent);
    }

    timer.on('second end', function(evt){
        progressbar.style.width = this.percentComplete() + "%";
    });

    timer.fire('init');
})();