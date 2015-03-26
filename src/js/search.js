/*jslint browser: true, es5: true*/
/*global jQuery */
'use strict';

/**
*
**/
var stache = angular.module('stache', [
  'ui.router',
  'ngSanitize'
]);

/**
*
**/
stache.config(function($stateProvider, $urlRouterProvider) {  
  $stateProvider.state('search', {
    controller: 'SearchController',
    url: '?q&p',
    templateUrl: '/views/view-search.html'
  });
  //$urlRouterProvider.otherwise('search');
});

/**
*
**/
stache.controller('SearchController', ['$scope', '$http', '$state', '$stateParams', function($scope, $http, $state, $stateParams) {
  
  function nittygritty(query, regex, item, key, baseWeight, include) {
    if (item[key]) {
      var context = 35;
      var padding = context / 2;
      var count = 1;
      var match;
      
      while ((match = regex.exec(item[key])) !== null) {
        item.weight += (count * baseWeight);
        if (include) {
          
          var before = item[key].substr(0, match.index);
          var after = item[key].substr(match.index);
          before = before.substr(before.lastIndexOf('.') + 1);
          after = after.substr(0, after.indexOf('.'));
          
          item.match += before + after;
          item.match += '...';
        }
      }
    }
    
    return item;
  }
  
  // Load content
  $http.get('/content.json', { cache: true }).success(function(response) {

    if ($stateParams.q) {
      $scope.page = $stateParams.p;
      $scope.query = $stateParams.q;
      $scope.results = [];
      
      if (angular.isArray(response.pages)) {
        
        var regex = new RegExp($scope.query, 'ig');        
        for (var i = 0, j = response.pages.length; i < j; i++) {
          
          var item = response.pages[i];
          item.match = '';
          item.weight = 0;
          item = nittygritty($scope.query, regex, item, 'text', 1, true);
          item = nittygritty($scope.query, regex, item, 'description', 100, true);
          item = nittygritty($scope.query, regex, item, 'name', 1000, false);
          
          if (item.weight > 0) {
            $scope.results.push(item);
          }
          
        }
      }
    }
    
  }).error(function() {
    $scope.error = 'Error loading searchable content.';
  });
  
  // Expose search functionality
  $scope.search = function(query) {
    $state.go('search', {
      q: query,
      p: 1
    });    
  }
  
}]);

/**
* http://stackoverflow.com/questions/15417125/submit-form-on-pressing-enter-with-angularjs
**/
stache.directive('stacheEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        scope.$apply(function(){
          scope.$eval(attrs.stacheEnter, {'event': event});
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
    if (phrase) {
      text = text.replace(new RegExp('('+phrase+')', 'gi'), '<span class="highlighted">$1</span>');
    }
    return $sce.trustAsHtml(text)
  }
});

stache.filter('truncate', function () {
  return function (text, length, end) {
    if (isNaN(length)) {
      length = 10;
    }
    if (end === undefined) {
      end = "...";
    }
    
    if (text.length <= length || text.length - end.length <= length) {
      return text;
    } else {
      return String(text).substring(0, length-end.length) + end;
    }
  };
});