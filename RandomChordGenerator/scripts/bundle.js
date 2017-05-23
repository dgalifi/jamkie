(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="/scripts/angular.js" />
var routes = {
    init: function () {
        var routeModule = angular.module('routeModule', ['ngRoute']);

        routeModule.config([
            '$routeProvider', function ($routeProvider) {
                $routeProvider.
                    when('/', {
                        templateUrl: 'app/components/home/home.html',
                        controller: 'HomeController'
                    }).
                    when('/static-chord', {
                        templateUrl: 'app/components/static-chord/static-chord.html',
                        controller: 'StaticChordController'
                    }).
                    when('/feedback', {
                        templateUrl: 'app/components/feedback/feedback.html',
                        controller: 'FeedbackController'
                    }).
                    when('/chord-progression', {
                        templateUrl: 'app/components/chord-progression/chord-progression.html',
                        controller: 'ChordProgressionController'
                    }).
                    otherwise({
                        redirectTo: '/'
                    });
            }
        ]);
    }
};

module.exports = {
    init: routes.init
}
},{}],2:[function(require,module,exports){
var AudioBuffer = require('../../shared/buffer');
var notes = require('../../shared/services');

var TOT_BARS = 32;

var init = function () {
    var app = angular.module('chordProgression', ['directivesModule', 'serviceModule', 'appConfig']);

    app.controller('ChordProgressionController',
    [
        '$scope', 'metronome', 'config', '$rootScope', '$location', function ($scope, metronome, config, $rootScope, $location) {
            var buffer = {};

            renderPage();

            //************
            // EVENT EditChord
            // ***********
            $scope.editChord = function (position) {
                $scope.isChordOpen = true;
                $scope.position = position;

                var chord = $scope.chords[position];
               
                $scope.keySelected = $scope.getKey(chord);
                $scope.qualitySelected = $scope.getQuality(chord);
            }

            //************
            // EVENT closeChordPopup
            // ***********
            $scope.closeChordPopup = function() {
                $scope.chords[$scope.position] = $scope.keySelected + $scope.qualitySelected;
                $scope.isChordOpen = false;
            }

            //************
            // EVENT StarStop
            // ***********
            $scope.startStop = function () {
                if (!$scope.metronome.isOn) {

                    metronome.stop();

                    console.log('start');
                    $scope.metronome.isOn = true;
                    $scope.mButton = 'STOP';

                    var sounds = {
                        "stick": "/audio/stick.mp3"
                    };

                    // Loading chords
                    for (var i = 0; i < 8; i++) {
                        var chord = $scope.chords[i];
                        var key = $scope.getKey(chord);
                        var quality = $scope.getQuality(chord);

                        if (!sounds.hasOwnProperty(chord)) {
                            sounds[chord] = "/audio/piano/" + quality + "/" + key + ".mp3";
                        }
                    }

                    // creating buffer
                    buffer = new AudioBuffer(sounds, onLoad, onError);
                    $rootScope.buffer = buffer;
                    
                    var offset = (60 / $scope.metronome.tempo);

                    // Play on load
                    function onLoad() {
                        metronome.start($scope.metronome.tempo, function () {
                            $scope.metronome.position = metronome.position;
                            $scope.metronome.bar = metronome.bar;

                            if (!metronome.isOn) {
                                $scope.mButton = 'START';
                                metronome.stop();

                                $scope.metronome.position = metronome.position;
                                $scope.metronome.isOn = false;
                            }

                        }, TOT_BARS, 0);

                        for (var i = 0; i < TOT_BARS; i++) {
                            buffer.play("stick", 1, $scope.metronome.tempo, i, offset);

                            buffer.play($scope.chords[i % 8], 1, $scope.metronome.tempo, i, offset - 0.1);

                            buffer.play("stick", 5, $scope.metronome.tempo, i, offset);

                            buffer.play($scope.chords[i % 8], 8, $scope.metronome.tempo, i, offset - 0.1);
                            buffer.play("stick", 9, $scope.metronome.tempo, i, offset);

                            buffer.play("stick", 13, $scope.metronome.tempo, i, offset);
                        }
                    }

                    function onError() {
                        alert('Please check your internet connection');
                    }
                } else {
                    $scope.metronome.isOn = false;
                    $scope.mButton = 'START';
                    buffer.stop();

                    metronome.stop();
                    $scope.metronome.position = metronome.position;
                    $scope.metronome.bar = 0;
                };
            }

            $scope.addSpaces = function(word) {
                var ret = word;
                for (var i = 0; i < 4 - word.length; i++) {
                    ret += String.fromCharCode(160);
                }
                
                return ret;
            }

            //************
            // FUNC Render Page
            // ***********
            function renderPage() {
                $scope.isLoading = false;
                $scope.mButton = "START";
                $scope.isChordOpen = false;
                $scope.keys = notes.keys;
                $scope.qualities = notes.qualities;

                $scope.feedback_visible = config.feedbackVisible;

                $scope.metronome = {
                    position: -1,
                    isOn: false,
                    bar: 0
                };

                $scope.chords = initChordArray();

                // set scope Location
                if ($location.path() == '/home' || $location.path() == '/' || $location.path() == '')
                    $rootScope.location = 'home';
                else
                    $rootScope.location = $location.path();
            }

            function initChordArray() {
                return ['Cmaj7', 'Am7', 'Dm7', 'G7', 'Cmaj7', 'Am7', 'Dm7', 'G7']
            }

            $scope.getKey = function (chord) {
                var key = chord.substr(0, 1);

                if (chord.substr(1, 1) === 'b') {
                    key += 'b';
                }

                return key;
            }

            $scope.getQuality = function(chord) {
                var quality;
                if (chord.substr(1, 1) === 'b') {
                    quality = chord.substr(2);
                } else {
                    quality = chord.substr(1);
                }

                return quality;
            }
        }
    ]);
};

module.exports = {
    init: init
}
},{"../../shared/buffer":7,"../../shared/services":9}],3:[function(require,module,exports){
var init = function () {
    var feedBackModule = angular.module('feedback', ['appConfig']);

    feedBackModule.controller('FeedbackController', ['$scope', '$http', function ($scope, $http) {
            $scope.hideForm = false;
            $scope.isLoading = false;
            $scope.hiddenScore = 0;

            $scope.form = {
                score : 0
            };
            
        $scope.setScore = function(score) {
            $scope.form.score = score;
        }

        $scope.setHdnScore = function (score) {
            $scope.hiddenScore = score;
        }

        $scope.resetScore = function() {
            $scope.hiddenScore = $scope.form.score;
        }

            $scope.submit = function() {
                $scope.isLoading = true;

                $http({
                        method: 'POST',
                        url: '/api/feedback/SendFeedback',
                        data: {
                            "email": $scope.form.email,
                            "score": $scope.form.score,
                            "comment": $scope.form.comment
                        }
                    })
                    .success(function (data) {
                        console.log(data);
                        $scope.isLoading = false;
                        $scope.hideForm = true;
                    });
            }
        }
    ]);
}

module.exports = {
    init: init
}
},{}],4:[function(require,module,exports){
var home = {
    init: function () {
        var app = angular.module('home', []);

        app.controller('HomeController', ['$scope', '$rootScope', function ($scope, $rootScope) {
            $scope.setLocation = function (path) {
                $rootScope.location = path;
            };  
        }]);
    }
};

module.exports = {
    init: home.init
}
},{}],5:[function(require,module,exports){
var AudioBuffer = require('../../shared/buffer');
var notes = require('../../shared/services');

var TOT_BARS = 32;

var init = function() {

    var homeModule = angular.module('staticChord', ['appConfig', 'serviceModule', 'directivesModule']);

    homeModule.controller('StaticChordController', ['$scope', 'metronome', 'config', '$rootScope', '$location', function($scope, metronome, config, $rootScope, $location) {
        var keys = notes.keys;
        var qualities = notes.qualities;
        var s1 = {};

        renderPage();

        //************
        // EVENT StartStop
        // ***********
        $scope.startStop = function() {
            if (!$scope.metronome.isOn) {
                console.log('start');

                metronome.stop();

                $scope.metronome.isOn = true;
                $scope.mButton = 'STOP';

                var key = $scope.keySelected;
                var quality = $scope.qualitySelected;
                var chord = key + quality;

                var sounds = [];
                sounds = {
                    "stick": "/audio/stick.mp3"
                };

                sounds[chord] = "/audio/piano/" + quality + "/" + key + ".mp3";
                s1 = new AudioBuffer(sounds, onLoad, onError);
                $rootScope.buffer = s1;


                var offset = (60 / $scope.metronome.tempo);

                function onLoad() {
                    metronome.start($scope.metronome.tempo, function() {
                        $scope.metronome.position = metronome.position;
                        $scope.metronome.bar = metronome.bar;

                        if (!metronome.isOn) {
                            $scope.mButton = 'START';
                            metronome.stop();
                            s1.stop();
                            $scope.metronome.position = metronome.position;
                            $scope.metronome.isOn = false;
                        }

                    }, TOT_BARS, 0);

                    for (var i = 0; i < TOT_BARS; i++) {
                        s1.play("stick", 1, $scope.metronome.tempo, i, offset);
                        s1.play(chord, 1, $scope.metronome.tempo, i, offset - 0.1);

                        s1.play("stick", 5, $scope.metronome.tempo, i, offset);

                        s1.play(chord, 8, $scope.metronome.tempo, i, offset - 0.1);

                        s1.play("stick", 9, $scope.metronome.tempo, i, offset);

                        s1.play("stick", 13, $scope.metronome.tempo, i, offset);
                    }
                }

                function onError() {
                    alert('Please check your internet connection');
                }

            } else {
                $scope.metronome.isOn = false;
                $scope.mButton = 'START';
                s1.stop();

                metronome.stop();
                $scope.metronome.position = metronome.position;
            };
        };


        //************
        /// EVENT getRandomChord
        //************
        $scope.getRandomChord = function() {
            var keyRand = Math.floor((Math.random() * keys.length));
            var qualityRand = Math.floor((Math.random() * qualities.length));
            var form = Math.floor((Math.random() * (qualities[qualityRand]).length));

            var randKey = keys[keyRand];

            if (randKey.indexOf('b') > -1) {
                $scope.key = randKey.replace('b', '');
                $scope.flat = 'b';
            } else {
                $scope.key = randKey;
                $scope.flat = '';
            }

            $scope.quality = qualities[qualityRand];

            $scope.keySelected = randKey;
            $scope.qualitySelected = $scope.quality
        };

        //************
        //*** EVENT openChordPopup
        //************
        $scope.openChordPopup = function() {
            $scope.isChordOpen = true;
        }

        //************
        //*** EVENT closeChordPopup
        //************
        $scope.closeChordPopup = function() {
            if ($scope.keySelected.indexOf('b') > -1) {
                $scope.key = $scope.keySelected.replace('b', '');
                $scope.flat = 'b';
            } else {
                $scope.key = $scope.keySelected;
                $scope.flat = '';
            }

            $scope.quality = $scope.qualitySelected;
            $scope.isChordOpen = false;
        }

        //************
        // FUNC Render Page
        // ***********
        function renderPage() {
            $scope.title = 'Home page title';
            $scope.mButton = 'START';
            $scope.isLoading = false;
            $scope.feedback_visible = config.feedbackVisible;

            $scope.keys = keys;
            $scope.key = 'C';
            $scope.keySelected = 'C';
            $scope.qualities = qualities;
            $scope.quality = 'maj7';
            $scope.qualitySelected = 'maj7';

            $scope.metronome = {
                position: -1,
                isOn: false,
                bar: 0
            };

            // disable double tap zoom in mobile phones.
            $(".btnMetronome").nodoubletapzoom();

            // set scope Location
        if ($location.path() == '/home' || $location.path() == '/' || $location.path() == '')
            $rootScope.location = 'home';
            else
            $rootScope.location = $location.path();

            setElementsHeight();
        }
    }]);
};

function setElementsHeight() {
    // set block height
    var wi = $(".met-block").width();
    $(".met-block").height(wi);

    var btnW = $(".btnMetronome").width();
    var pad = btnW / 2 + 45;

    var tempoW = $("#divTempo").width();
}

module.exports = {
    init: init
}

},{"../../shared/buffer":7,"../../shared/services":9}],6:[function(require,module,exports){
///// <reference path="/scripts/angular.js" />
var routes = require('./app.routes.js');
var staticChord = require('./components/static-chord/static-chord.js');
var feedback = require('./components/feedback/feedback.js');
var chordProgression = require('./components/chord-progression/chord-progression.js');
var home = require('./components/home/home.js');

var services = require('./shared/services.js');
var utils = require('./shared/utils.js');

var directives = require('./shared/directives/directives.js');

var app = angular.module('mainModule', ['routeModule', 'chordProgression', 'feedback', 'staticChord', 'home']);

app.controller('mainController', ['$scope', '$location', '$rootScope',
    function($scope, $location, $rootScope) {
        $rootScope.menuHidden = true;

        /// SHOW MENU func
        $scope.showMenu = function() {
            $scope.menuHidden = false;
        };

       
        // set scope Location
        if ($location.path() == '/home' || $location.path() == '/' || $location.path() == '')
            $rootScope.location = 'home';
        else
            $rootScope.location = $location.path();

        $scope.setLocation = function (path) {
            $rootScope.location = path;

            if ($rootScope.buffer)
                $rootScope.buffer.stop();
        };
    }
]);

directives.init();

utils.init();
routes.init();
services.init();

//// Components
staticChord.init();
feedback.init();
chordProgression.init();
home.init();
},{"./app.routes.js":1,"./components/chord-progression/chord-progression.js":2,"./components/feedback/feedback.js":3,"./components/home/home.js":4,"./components/static-chord/static-chord.js":5,"./shared/directives/directives.js":8,"./shared/services.js":9,"./shared/utils.js":10}],7:[function(require,module,exports){
var bufferLoader;
var context;

function AudioBuffer(sounds, afterLoad, onError) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

    var buffer = this;
    bufferLoader = new BufferLoader(context, sounds,
        function onLoad(bufferList) {
            buffer.sources = {};
            buffer.bufferList = bufferList;

            afterLoad();
        }, onError);

    bufferLoader.load();
}



AudioBuffer.prototype.play = function (soundName, beat, tempo, bar, offset) {
    if (this.closed) {
        context = new AudioContext();
        console.log('created');
        this.closed = false;
    }

    this.sources[soundName] = context.createBufferSource();
    this.sources[soundName].buffer = this.bufferList[soundName];
    this.sources[soundName].connect(context.destination);

    var startTime = context.currentTime + offset;
    var sixthNote = (60 / tempo) / 4;
    var time = startTime + ((beat - 1) * sixthNote) + (bar * 4 * 60 / tempo);
    this.sources[soundName].start(time);
};

AudioBuffer.prototype.stop = function() {
    console.log('stop');
    context.close();
    this.closed = true;
}



function BufferLoader(context, sounds, callback, error) {
    this.context = context;
    this.sounds = sounds;
    this.onload = callback;
    this.error = error;
    this.bufferList = {};
    this.loadCount = 0;
}


BufferLoader.prototype.load = function () {
    for (var key in this.sounds) {

        // skip loop if the property is from prototype
        if (!this.sounds.hasOwnProperty(key))
            continue;

        this.loadBuffer(this.sounds[key], key);
    }
}


BufferLoader.prototype.loadBuffer = function (url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url , true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
            request.response,
            function(buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = buffer;

                var count = 0;
                for (var k in loader.sounds) {
                    if (loader.sounds.hasOwnProperty(k)) {
                        ++count;
                    }
                }

                if (++loader.loadCount == count)
                    loader.onload(loader.bufferList);
            },

            function (error) {
                loader.error();
                console.error('decodeAudioData error', error);
            }
        );
    }

    request.onerror = function() {
        loader.error();
    }

    request.send();
}

module.exports = AudioBuffer;
},{}],8:[function(require,module,exports){
var init = function () {

    var app = angular.module('directivesModule', ['ngAnimate']);

    app.directive('loader',
        function () {
            return {
                templateUrl: 'app/shared/directives/templates/loader.html',
                restrict: 'E',
                scope: {
                    loading: '=loading'
                }
            }
        });

    app.directive('feedbacklink',
        function () {
            return {
                templateUrl: 'app/shared/directives/templates/feedback-link.html',
                restrict: 'E',
                scope: {
                    isvisible: '=isvisible'
                }
            }
        });

    app.directive('startbutton', [function () {
        return {
            templateUrl: 'app/shared/directives/templates/start-button.html',
            restrict: 'E',
            scope: {
                text: '=text',
                func: '=func'
            }
        }
    }]);

    app.directive('chordpopup', [function () {
        return {
            templateUrl: 'app/shared/directives/templates/chord-popup.html',
            restrict: 'E',
            scope: {
                isChordOpen: '=isChordOpen',
                keys: '=keys',
                qualities: '=qualities',
                clickOk: '=clickOk',
                keySelected: '=keySelected',
                qualitySelected: '=qualitySelected'
            },
            controller: function ($scope, $element) {
            }

        }
    }]);

    app.directive('tempopanel', [function () {
        return {
            templateUrl: 'app/shared/directives/templates/tempo-panel.html',
            restrict: 'E',
            controller: function ($scope, $element) {
                $scope.isTempoOpen = false;
                $scope.tempo = 60;
                $scope.tempoPopup = 60;

                //************
                //*** EVENT openTempoPopup
                //************
                $scope.openTempoPopup = function () {
                    $scope.isTempoOpen = true;
                };

                //************
                //*** EVENT closeTempoPopup
                //************
                $scope.closeTempoPopup = function () {
                    $scope.isTempoOpen = false;
                };

                //************
                /// EVENT changeTempo
                //************
                $scope.changeTempo = function () {
                    var valid = $scope.tempoForm.$valid;

                    if (valid) {
                        $scope.tempo = $scope.tempoPopup;
                        $scope.isTempoOpen = false;
                    } else {
                        $scope.tempoPopup = $scope.tempo;
                    }
                }

                //************
                // EVENT Increase tempo
                // ***********
                $scope.increaseTempo = function () {
                    if ($scope.tempo < 150)
                        $scope.tempo = parseInt($scope.tempo) + 5;
                };

                //************
                // EVENT Decrease tempo
                // ***********
                $scope.decreaseTempo = function () {
                    if ($scope.tempo > 10)
                        $scope.tempo = parseInt($scope.tempo) - 5;
                };
            },
            scope: {
                tempo: '=tempo',
                tempoPopup: '=tempoPopup',
                changeTempo: '=changeTempo'
            }
        }
    }]);

    app.directive('menu', [function () {
        return {
            templateUrl: 'app/shared/directives/templates/menu.html',
            restrict: 'E',
            scope: {
                menuHidden: '=menuHidden'
            },
            controller: function ($scope, $location, $window, $rootScope) {
                $scope.hideMenu = function () {
                    $scope.menuHidden = true;
                }

                if ($location.path() === '/' || $location.path() === '/home') {
                    $scope.location = 'home';
                } else {
                    $scope.location = $location.path();
                }

                /**
                 ******* SET LOCATION
                 * @param {} path = string path
                 * @returns {} 
                 */

                $scope.setLocation = function (path) {
                    $scope.hideMenu();
                    $scope.location = path;

                    $location.path('/' + path);

                    if ($rootScope.buffer)
                        $rootScope.buffer.stop();
                }
            }
        }
    }]);

};

module.exports = {
    init: init
}

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
var utils = {
    init: function () {
        $.fn.nodoubletapzoom = function () {
            $(this).bind('touchstart', function preventZoom(e) {
                var t2 = e.timeStamp
                  , t1 = $(this).data('lastTouch') || t2
                  , dt = t2 - t1
                  , fingers = e.originalEvent.touches.length;
                $(this).data('lastTouch', t2);
                if (!dt || dt > 500 || fingers > 1) return; // not double-tap

                e.preventDefault(); // double tap - prevent the zoom
                // also synthesize click events we just swallowed up
                $(this).trigger('click').trigger('click');
            });
        };

        angular.module('appConfig', [])
            .constant('config', {
                soundFolder: '/audio/piano/',
                feedbackVisible : true
            });
    },
}

module.exports = {
    init: utils.init
}
},{}]},{},[6]);
