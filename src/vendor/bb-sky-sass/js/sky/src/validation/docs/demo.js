/*global angular */

angular.module('KitchenSink')
    .controller('ValidationTestController', ['$scope', function ($scope) {
        'use strict';
        
        $scope.locals = {
            email: ''
        };
        
    }]);