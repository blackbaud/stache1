/*global angular */

angular.module('KitchenSink').controller('SearchfieldLocalTestController', ['$scope', function ($scope) {
    'use strict';

    $scope.data = {
        color_id: '2',
        color_ids: ['2', '5', '9']
    };

    $scope.resources = {
        watermark_single: 'Search for a color',
        watermark_multiple: 'Search for a color(s)'
    };

    $scope.locals = {
        colors: [
            { id: '1', name: 'Aqua' },
            { id: '2', name: 'Blue' },
            { id: '3', name: 'Brown' },
            { id: '4', name: 'Gold' },
            { id: '5', name: 'Gray' },
            { id: '6', name: 'Green' },
            { id: '7', name: 'Navy' },
            { id: '8', name: 'Pink' },
            { id: '9', name: 'Purple' },
            { id: '10', name: 'Silver' },
            { id: '11', name: 'White' },
            { id: '12', name: 'Yellow' }
        ]
    };
}]);

angular.module('KitchenSink').controller('SearchfieldRemoteTestController', ['$scope', '$http', function ($scope, $http) {
    'use strict';

    $scope.data = {
        address: { place_id: 'ChIJ9yZhkfVv_ogRtSl1eM278GI', formatted_address: '2000 Daniel Island Drive, Charleston, SC 29492, USA' },
        addresses: [
            { place_id: 'ChIJ9yZhkfVv_ogRtSl1eM278GI', formatted_address: '2000 Daniel Island Drive, Charleston, SC 29492, USA' },
            { place_id: 'ChIJ37HL3ry3t4kRv3YLbdhpWXE', formatted_address: 'The White House, 1600 Pennsylvania Avenue Northwest, Washington, DC 20500, USA' }
        ]
    };

    $scope.resources = {
        watermark_single: 'Search for an address',
        watermark_multiple: 'Search for an address(es)'
    };

    $scope.locals = {
        singleSearchResults: [],
        multipleSearchResults: [],
        addressSearch: function (search, searchType) {
            //Only call the remote server if the search text is not empty.
            if (search && search.length > 0) {
                var params;

                params = {
                    address: search,
                    sensor: false
                };

                return $http.get(
                    'http://maps.googleapis.com/maps/api/geocode/json',
                    { params: params }
                ).then(function (response) {
                    if (searchType === 'single') {
                        $scope.locals.singleSearchResults = response.data.results;
                    } else {
                        $scope.locals.multipleSearchResults = response.data.results;
                    }

                    //This event MUST be raised to tell the control that we've received results from the remote server,
                    //and then control can properly display the "No results" message when necessary.
                    $scope.$broadcast('bbSearchFinished');
                });
            }
        }
    };

}]);