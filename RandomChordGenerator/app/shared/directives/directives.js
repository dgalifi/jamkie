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
