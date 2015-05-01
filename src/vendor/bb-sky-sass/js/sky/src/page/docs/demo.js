/*global angular */

angular.module('KitchenSink')
    .controller('PageTestController', ['$scope', '$timeout', 'bbPage', function ($scope, $timeout, bbPage) {
        'use strict';
        var locals,
            testLoading = false;

        function simulateLoading() {
            testLoading = true;
            locals.pageStatus = bbPage.pageStatuses.LOADING;
            $scope.$emit('bbBeginWait');

            $timeout(function () {
                testLoading = false;
                locals.pageStatus = bbPage.pageStatuses.LOADED;
                $scope.$emit('bbEndWait');
            }, 1500);
        }

        function simulateNotAuthorized() {
            locals.pageStatus = bbPage.pageStatuses.NOT_AUTHORIZED;
        }

        locals = $scope.locals = {};

        $scope.$on('bbBeginWait', function (event) {
            if (!testLoading) {
                event.stopPropagation();
            }
        });

        locals.pageStatus = bbPage.pageStatuses.LOADED;
        locals.simulateLoading = simulateLoading;
        locals.simulateNotAuthorized = simulateNotAuthorized;
    }]);