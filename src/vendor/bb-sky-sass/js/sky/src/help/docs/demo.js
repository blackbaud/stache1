angular.module('KitchenSink').controller('HelpTestController', ['$scope', 'bbHelp', function ($scope, bbHelp) {

    $scope.open = function () {
        bbHelp.open('bb-gifts.html');
    };

    $scope.close = function () {
        bbHelp.close();
    };
}]);