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