angular.module('KitchenSink')
    .controller('DateFieldDemoController', ['$scope', '$q', function ($scope, $q) {

        // Initial values...
        $scope.testdate1 = "5/17/1985";
        $scope.testdate2 = "02/05/2003";

        // Custom date formatting method
        $scope.dateFieldOptions = {
            formatValue: function (value) {
                return $q(function (resolve, reject) {
                    var formattedValue = value,
                        formattingErrorMessage;

                    if (value.toUpperCase() !== value) {
                        formattingErrorMessage = "Any letters should be capitalized.";
                    } else {
                        formattedValue = "[" + value.toUpperCase() + "]";
                    }
                    resolve({
                        formattedValue: formattedValue,
                        formattingErrorMessage: formattingErrorMessage
                    });
                });
            }
        };
    }]);