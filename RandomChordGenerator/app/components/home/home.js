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