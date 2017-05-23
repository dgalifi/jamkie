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
