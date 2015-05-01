angular.module('KitchenSink')
    .controller('WaitDemoController', ['$scope', '$timeout', 'bbWait', function ($scope, $timeout, bbWait) {

        $scope.waitCount = 0;

        $scope.onWaitDiv = function () {
            $scope.waitDiv = true;

            $timeout(function () {
                $scope.waitDiv = false;
            }, 1000);
        };

        $scope.onWaitSpan = function () {
            $scope.waitSpan = true;

            $timeout(function () {
                $scope.waitSpan = false;
            }, 1000);
        };

        $scope.onWaitIncrement = function () {
            $scope.waitCount += 1;
        };

        $scope.onWaitDecrement = function () {
            if ($scope.waitCount > 0) {
                $scope.waitCount -= 1;
            }
        };

        $scope.onShowPageWait = function () {
            $scope.$emit("bbBeginWait");

            $timeout(function () {
                $scope.$emit("bbEndWait");
            }, 1000);
        };

        $scope.onShowNonblockingPageWait = function () {
            $scope.$emit("bbBeginWait", { nonblocking: true });

            $timeout(function () {
                $scope.$emit("bbEndWait", { nonblocking: true });
            }, 1000);
        };

    }]);