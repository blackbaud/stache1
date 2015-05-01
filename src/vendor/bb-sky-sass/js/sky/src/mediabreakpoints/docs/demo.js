angular.module('KitchenSink').controller('MediaBreakpointsTestController', ['$scope', 'bbMediaBreakpoints', function ($scope, bbMediaBreakpoints) {
    function mediaBreakpointCallback(breakpoint) {
        var p;

        for (p in breakpoint) {
            if (breakpoint.hasOwnProperty(p) && breakpoint[p]) {
                $scope.locals.status = p;
                break;
            }
        }
    }

    $scope.locals = {};

    bbMediaBreakpoints.register(mediaBreakpointCallback);

    $scope.$on('$destroy', function () {
        bbMediaBreakpoints.unregister(mediaBreakpointCallback);
    });

}]);