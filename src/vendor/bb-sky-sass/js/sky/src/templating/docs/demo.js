angular.module('KitchenSink').controller('TemplateTestController', ['$scope', function ($scope) {
    $scope.locals = {
        template: '{0} is an important number. {1} is important, too, but not as important as {0}.',
        number1: '39,210',
        number2: '78'
    };
}]);