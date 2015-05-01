angular.module('KitchenSink')
.controller('ToastTestController', ['$scope', 'bbToast', '$templateCache', function ($scope, bbToast, $templateCache) {
    $templateCache.put('bbToast/samples/complexToast.html',
        '<div>' +
        'Open for <span>{{timeOpen}}</span> seconds' +
        '</div>' +
        '<br />' +
        '<div>{{message}}</div');

    $scope.openMessage = function () {
        bbToast.open({ message: "A simple message in which <html> is ignored." });
    };

    $scope.openTemplate = function () {
        bbToast.open({
            templateUrl: "bbToast/samples/complexToast.html",
            controller: 'TemplatedToastController',
            resolve: {
                message: function () {
                    return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed commodo, massa ac sollicitudin vestibulum, nulla nulla faucibus.';
                }
            }
        });
    };
}])
.controller('TemplatedToastController', ['$scope', '$interval', 'message', function ($scope, $interval, message) {
    $scope.timeOpen = 0;
    $scope.message = message;

    $interval(function () {
        $scope.timeOpen += 1;
    }, 1000);
}]);