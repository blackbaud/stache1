angular.module('KitchenSink')
      .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('TabState1', {
                url: 'tabsref'
            })
            .state('TabState2', {
                url: 'tabsref/tab2'
            })
            .state('TabState3', {
                url: 'tabsref/tab3'
            })
    }])
    .controller('TabSrefTestController', ['$scope', function ($scope) {
        'use strict';

    }]);