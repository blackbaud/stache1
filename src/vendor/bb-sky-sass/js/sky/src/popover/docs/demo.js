angular.module('KitchenSink')
    .run(['$templateCache', function ($templateCache) {
        // Typically this would either point to a URL or generated using a Grunt task like html2js.  For demo
        // purposes we'll just manually put the template in the cache.
        $templateCache.put('bbPopoverTemplate/samples/samplepopover.html',
            '<div class="tooltip-container">' +
                '<div>Select a beverage:</div>' +
                '<div><select ng-model="$parent.selectedItem" ng-options="item as item for item in items"></select></div>' +
                '<a ng-click="hide()">Close me</a>' +
            '</div>');
    }])
    .controller('PopoverTestController', ['$scope', function ($scope) {
        $scope.items = ['Coke', 'Sprite', 'Dr Pepper', 'Pibb'];
        $scope.selectedItem = 'Coke';
    }]);