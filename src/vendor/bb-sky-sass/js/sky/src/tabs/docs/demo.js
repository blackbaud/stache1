angular.module('KitchenSink').controller('TabsTestController', ['$scope', '$timeout', function ($scope, $timeout) {
    'use strict';

    $scope.locals = {
        proposalsHeader: {
            headerTitle: 'Proposals',
            headerCount: 13
        },
        delayedHeader: null
    };

    // Simulates loading a tab header from a remote data source.
    $timeout(function () {

        $scope.locals.delayedHeader = {
            headerTitle: 'Delayed Header',
            headerCount: 10000
        };

    }, 500);


}]);