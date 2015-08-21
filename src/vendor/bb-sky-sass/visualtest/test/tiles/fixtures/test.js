/*global angular */
(function () {
    'use strict';
    
    function TileTestController($scope) {
        $scope.locals = {
            openSettings: angular.noop
        };
    }
    
    TileTestController.$inject = ['$scope'];
    
    angular.module('screenshots', ['sky'])
        .controller('TileTestController', TileTestController);
}());