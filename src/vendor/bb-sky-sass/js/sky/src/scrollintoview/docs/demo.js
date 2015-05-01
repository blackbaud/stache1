angular.module('KitchenSink').controller('ScrollIntoViewTestController', ['bbModal', '$scope', function (bbModal, $scope) {
    $scope.resources = {
        tile_header: 'Tile header'
    };
    
    $scope.locals = {
        is_collapsed: false,
        scrollIntoView: function () {
            $scope.scrollIntoViewCount = ($scope.scrollIntoViewCount || 0) + 1;
        },
        scrollParentIntoView: function () {
            $scope.scrollParentIntoViewCount = ($scope.scrollParentIntoViewCount || 0) + 1;
        }
    };
}]);