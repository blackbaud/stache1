angular.module('KitchenSink')
    .controller('MoneyInputTestController', ['$scope', function ($scope) {
        $scope.locals = {
            moneyFormattedValue: '$123,456.78',
            moneyValue: 12345678
        };
    }]);