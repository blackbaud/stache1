/*jslint browser: true, es5: true*/
/*global jQuery */
'use strict';

/**
*
**/
var stache = angular.module('stache', [
  'ui.router'
]);

/**
*
**/
stache.config(function($stateProvider, $urlRouterProvider) {  
  $stateProvider.state('search', {
    controller: 'SearchController',
    url: '/search/:query/:page',
    templateUrl: '/views/view-search.html'
  });
  $urlRouterProvider.when('', 'search//');
});

/**
*
**/
stache.controller('SearchController', ['$scope', '$http', '$state', '$stateParams', function($scope, $http, $state, $stateParams) {
  
  // Load content
  $http.get('/content.json', { cache: true }).success(function(response) {
    $scope.response = response;
  }).error(function() {
    $scope.error = 'Error loading searchable content.';
  });
  
  // Expose search functionality
  $scope.search = function(query) {
    $state.go('search', {
      query: query,
      page: 1
    });
  }
  
  // Load search results
  if ($stateParams.query) {
    $scope.page = $stateParams.page;
    $scope.query = $stateParams.query;
  }
  
}]);

/**
* http://stackoverflow.com/questions/15417125/submit-form-on-pressing-enter-with-angularjs
**/
stache.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        scope.$apply(function(){
          scope.$eval(attrs.ngEnter, {'event': event});
        });
        event.preventDefault();
      }
    });
  };
});

/**
*
**/
stache.filter('highlight', function($sce) {
  return function(text, phrase) {
    if (phrase) text = text.replace(new RegExp('('+phrase+')', 'gi'),
      '<span class="highlighted">$1</span>')

    return $sce.trustAsHtml(text)
  }
});