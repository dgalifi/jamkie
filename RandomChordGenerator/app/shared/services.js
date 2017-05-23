/// <reference path="/scripts/angular.js" />

var services = {
    init: function() {
        var services = angular.module('serviceModule', ['appConfig']);

        services.factory('metronome', [
            '$interval', '$timeout',
            function($interval, $timeout) {

                var metronome = {
                    isOn: false,
                    position: -1,
                    interval: {},
                    bar: 0,
                    start: function(speed, onTick, maxBars, delay) {
                        $timeout(function(metronome) {
                            var ms = 60000 / (speed);
                            metronome.isOn = true;

                            metronome.interval = $interval(function(m) {

                                if (m.bar < maxBars || m.position < 3) {
                                    m.position = (m.position + 1) % 4;

                                    if (m.position % 4 == 0)
                                        m.bar++;
                                } else {
                                    m.stop();
                                }

                                onTick();

                            }, ms, 0, true, metronome);
                        }, delay, true, this);
                    },
                    stop: function() {
                        this.position = -1;
                        this.isOn = false;
                        $interval.cancel(this.interval);
                        this.bar = 0;
                    },
                    pause: function() {
                        this.isOn = false;
                        $interval.cancel(this.interval);
                    }
                };

                return {
                    isOn: metronome.isOn,
                    position: metronome.position,
                    start: metronome.start,
                    stop: metronome.stop,
                    pause: metronome.pause,
                    bar: metronome.bar
                }
            }
        ]);
    }
}


module.exports = {
    init: services.init,

    keys: ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab'],

    qualities: ['maj7', 'm7', '7', 'm7b5']
}
