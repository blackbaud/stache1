angular.module('KitchenSink').controller('TabscrollTestController', ['$scope', '$timeout', function ($scope, $timeout) {
    $scope.locals = {
        replay: function () {
            $scope.locals.ready = false;
            $timeout(function () {
                $scope.locals.ready = true;
            }, 200);
        }
    };
    
    $timeout(function () {
        $scope.locals.ready = true;
    }, 2000);
}]);