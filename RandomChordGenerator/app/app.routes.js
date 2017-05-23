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