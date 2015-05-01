angular.module('KitchenSink')
    .controller('DateRangePickerDemoController', ['$scope', 'bbDateRangePicker', function ($scope, bbDateRangePicker) {

        var locals = $scope.locals = {
            bbDateRangePicker: bbDateRangePicker,
            dateRangePickerValue: {
                dateRangeType: bbDateRangePicker.dateRangeTypes.TOMORROW
            },
            dateRangePickerOptions: {}
        };

        $scope.selectToday = function () {
            locals.dateRangePickerValue = {
                dateRangeType: bbDateRangePicker.dateRangeTypes.TODAY
            };
        };

        $scope.reset = function () {
            locals.dateRangePickerValue = {};
        };

        $scope.$watch('locals.options.pastonly', function (newVal) {
            if (newVal === true) {
                locals.dateRangePickerOptions.availableDateRangeTypes = bbDateRangePicker.pastDateRangeOptions;
            } else {
                locals.dateRangePickerOptions.availableDateRangeTypes = bbDateRangePicker.defaultDateRangeOptions;
            }
        });

    }]);