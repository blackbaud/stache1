/*jslint browser: true, es5: true*/
/*global jQuery */
(function () {
    'use strict';

    function Run($rootScope, bbWait) {
        $rootScope.$on('bbBeginWait', function (e, opts) {
            e.stopPropagation();
            bbWait.beginPageWait(opts);
        });

        $rootScope.$on('bbEndWait', function (e, opts) {
            e.stopPropagation();
            bbWait.endPageWait(opts);
        });
    }

    function Config($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('search', {
                controller: 'SearchController as searchController',
                url: '/search?q&p',
                templateUrl: '/views/view-search.html'
            });
    }

    function SearchController($scope, $http, $state, $stateParams) {
        function nittygritty(query, regex, item, key, baseWeight, include) {
            var context = 35,
                padding = context / 2,
                count = 1,
                match,
                before,
                after;

            if (item[key]) {
                while ((match = regex.exec(item[key])) !== null) {
                    item.weight += (count * baseWeight);
                    if (include) {
                        before = item[key].substr(0, match.index);
                        before = before.substr(before.lastIndexOf('.') + 1);
                        after = item[key].substr(match.index);
                        after = after.substr(0, after.indexOf('.'));
                        item.match += before + after;
                        item.match += '...';
                    }
                }
            }

            return item;
        }

        // Load content
        $http.get('/content.json', { cache: true }).then(
            function (response) {
                var regex,
                    item,
                    i,
                    j;

                if ($stateParams.q) {
                    $scope.page = $stateParams.p;
                    $scope.query = $stateParams.q;
                    $scope.results = [];
                    if (angular.isArray(response.pages)) {
                        regex = new RegExp($scope.query, 'ig');
                        for (i = 0, j = response.pages.length; i < j; i++) {
                            item = response.pages[i];
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

            }, function () {
                $scope.error = 'Error loading searchable content.';
            }
        );

        // Expose search functionality
        $scope.search = function (query) {
            $state.go('search', {
                q: query,
                p: 1
            });
        };
    }

    /**
    * http://stackoverflow.com/questions/15417125/submit-form-on-pressing-enter-with-angularjs
    **/
    function DirectiveStacheEnter() {
        return function (scope, element, attrs) {
            element.bind('keydown keypress', function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.stacheEnter, {'event': event});
                    });
                    event.preventDefault();
                }
            });
        };
    }


    function FilterHighlight() {
        return function (text, phrase) {
            if (phrase) {
                text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>');
            }
            return $sce.trustAsHtml(text);
        };
    }

    function FilterTruncate() {
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
                return String(text).substring(0, length - end.length) + end;
            }
        };
    }


    Run.$inject = [
        '$rootScope',
        'bbWait'
    ];
    Config.$inject = [
        '$stateProvider',
        '$urlRouterProvider'
    ];
    FilterHighlight.$inject = [
        '$sce'
    ];
    angular.module('stache', [
        'sky',
        'ui.router',
        'ui.bootstrap',
        'ui.select',
        'ngAnimate',
        'ngSanitize'
    ]);

    angular.module('stache')
        .config(Config)
        .controller('NavController', angular.noop)
        .controller('SearchController', SearchController)
        .directive('stacheEnter', DirectiveStacheEnter)
        .filter('truncate', FilterTruncate)
        .filter('highlight', FilterHighlight)
        .run(Run);
}());
