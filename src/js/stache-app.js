/*jslint browser: true, es5: true*/
/*global jQuery */
(function () {
    'use strict';

    function Config($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('search', {
                controller: 'SearchController as searchController',
                url: '/search?q&p',
                templateUrl: '/views/view-search.html'
            });

        // This is a temporary fix to supports backwards compatabiliy
        if (window.location.href.indexOf('/search/') > -1) {
            $urlRouterProvider.otherwise('/search');
        }
    }

    function OmnibarController($scope, $timeout, $document, bbOmnibarConfig, SearchService) {
        var vm = this;

        vm.cancel = function () {
            $scope.searchText = vm.query = '';
            $scope.searching = false;
            $timeout(function () {
                vm.results = '';
            });
        };

        // Listens to the search box events
        $scope.$on('searchBoxKeyUp', function (event, keyCode) {
            vm.query = $scope.searchText;

            if (vm.query === '') {
                vm.cancel();
            } else {

                // Positions the search results popup under the search box
                angular.element(bbOmnibarConfig.selectorResults).css({
                    'left': angular.element(bbOmnibarConfig.selectorInput).position().left + 'px'
                });

                $scope.searching = true;
                SearchService.search(vm.query).then(function (results) {
                    vm.results = results;
                    $scope.searching = false;
                });
            }
        });

        // Close our search when click outside or escape key
        $scope.$on('stacheOmnibarLoaded', function () {
            var searchResults = angular.element(bbOmnibarConfig.selectorResults),
                searchInput = angular.element(bbOmnibarConfig.selectorInput);
            $document
                .on('click', function (e) {
                    if (vm.query && !searchResults.is(e.target) && searchResults.has(e.target).length === 0) {
                        vm.cancel();
                    }
                })
                .on('keyup', function (e) {
                    if (vm.query && e.keyCode === 27) {
                        vm.cancel();
                    } else if (e.keyCode === 191) {
                        searchInput.focus();
                    }
                });
        });
    }

    function SearchController($state, $stateParams, SearchService) {
        var vm = this;

        vm.search = function () {
            $state.go('search', {
                q: vm.query,
                p: 1
            });
        };

        if ($stateParams.q) {
            vm.sent = {
                query: $stateParams.q
            };
            SearchService
                .search(vm.sent.query)
                .then(
                    function (results) {
                        console.log(results);
                        vm.sent.results = results;
                    },
                    function () {
                        vm.sent.error = 'Error loading searchable content.';
                    }
                );
        }
    }

    function SearchService($q, $http) {
        var searchContent;

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

        function search(query) {
            var results = [],
                regex,
                item,
                i,
                j;

            if (angular.isArray(searchContent.pages)) {
                regex = new RegExp(escapeRegEx(query), 'ig');
                for (i = 0, j = searchContent.pages.length; i < j; i++) {
                    item = searchContent.pages[i];
                    item.match = '';
                    item.weight = 0;
                    item = nittygritty(query, regex, item, 'text', 1, true);
                    item = nittygritty(query, regex, item, 'description', 100, true);
                    item = nittygritty(query, regex, item, 'name', 1000, false);
                    if (item.weight > 0) {
                        results.push(item);
                    }
                }
            }

            results.sort(function (a, b) {
                return a.weight > b.weight ? 1 : (a.weight < b.weight ? -1 : 0);
            });

            return results;
        }

        return {
            search: function (query) {
                var defer = $q.defer();

                if (searchContent) {
                    defer.resolve(search(query));
                } else {
                    $http.get('/content.json', { cache: false }).then(
                        function (result) {
                            searchContent = result.data;
                            defer.resolve(search(query));
                        }
                    );
                }

                return defer.promise;
            }
        };
    }

    function escapeRegEx(pattern) {
        return pattern.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
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


    function FilterHighlight($sce) {
        return function (text, phrase) {
            if (phrase) {
                text = text.replace(new RegExp('(' + escapeRegEx(phrase) + ')', 'gi'), '<span class="highlighted">$1</span>');
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

    Config.$inject = [
        '$stateProvider',
        '$urlRouterProvider'
    ];
    OmnibarController.$inject = [
        '$scope',
        '$timeout',
        '$document',
        'bbOmnibarConfig',
        'SearchService'
    ];
    SearchController.$inject = [
        '$state',
        '$stateParams',
        'SearchService'
    ];
    SearchService.$inject = [
        '$q',
        '$http'
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
        .controller('OmnibarController', OmnibarController)
        .controller('SearchController', SearchController)
        .service('SearchService', SearchService)
        .directive('stacheEnter', DirectiveStacheEnter)
        .filter('truncate', FilterTruncate)
        .filter('highlight', FilterHighlight);
}());
