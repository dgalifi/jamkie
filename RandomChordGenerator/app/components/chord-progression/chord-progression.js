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