angular.module('KitchenSink')
    .run(['$templateCache', function ($templateCache) {
        // Typically this would either point to a URL or generated using a Grunt task like html2js.  For demo
        // purposes we'll just manually put the template in the cache.
        $templateCache.put('bbTooltip/samples/sampletooltip.html',
            '<div class="tooltip-container">' +
                '<div class="title">' +
                    '{{tooltipTitle}}' +
                    '<hr />' +
                '</div>' +
                '<div>{{tooltipMessage}}</div>' +
            '</div>');
    }])
    .controller('TooltipTestController', ['$scope', function ($scope) {
        $scope.tooltipTitle = 'Tooltip title';
        $scope.tooltipMessage = 'Tooltip content.';
    }]);