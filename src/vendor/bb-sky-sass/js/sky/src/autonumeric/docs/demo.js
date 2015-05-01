angular.module('KitchenSink')
    .config(['bbAutonumericConfig', function (bbAutonumericConfig) {
        // Globally override money options for the entire application here.
        bbAutonumericConfig.money.aSep = ',';
    }])
    .controller('AutonumericInputTestController', ['$scope', function ($scope) {
        $scope.locals = {
            moneyValue: 12345678,
            numberValue: 87654321,
            customSettings: {
                // Options may also be overridden here on a one-off basis.
                aSign: '$'
            }
        };
    }]);