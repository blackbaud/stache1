angular.module('KitchenSink').controller('HelpWidgetTestController', ['$scope', function ($scope) {

    $scope.open = function () {
        window.BBHELP.HelpWidget.open('bb-gifts.html');
    };

    $scope.close = function () {
        window.BBHELP.HelpWidget.close();
    };
}]);