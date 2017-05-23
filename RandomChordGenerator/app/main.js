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