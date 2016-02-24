(function (angular) {
    "use strict";


    /**
     * Highlights keywords in a string.
     */
    function FilterHighlight($sce) {
        return function (text, phrase) {
            if (phrase && text) {
                text = text.replace(new RegExp('(' + escapeRegEx(phrase) + ')', 'gi'), '<span class="highlighted">$1</span>');
            }
            return $sce.trustAsHtml(text);
        };
    }


    /**
     * Controller for Omnibar Search Results.
     */
    function OmnibarSearchController($scope, $timeout, bbOmnibarConfig, SearchService, OmnibarSearchSettings) {
        var omnibarScope,
            elemSearchInput,
            elemSearchResults,
            vm;

        // Stores a reference to the scope where Omnibar emits events.
        omnibarScope = $scope.$parent;

        vm = this;
        vm.messages = {
            searching: vm.searchingMessage || $scope.searchingMessage || "Searching...",
            noResults: vm.noResultsMessage || $scope.noResultsMessage || 'Unable to locate any results.'
        };
        vm.searching = false;
        vm.enabled = false;
        vm.query = '';


        /**
         * Run a blank search first, to make sure the resource exists.
         */
        function checkConnection() {
            SearchService.fetchPages().then(function (res) {
                if (res.error) {
                    vm.enabled = false;
                    hideSearch();
                } else {
                    vm.enabled = true;
                    $timeout(function () {
                        events();
                        setElements();
                    });
                }
            });
        }


        /**
         * Add events to DOM elements after Omnibar has loaded.
         */
        function events() {
            angular.element(document)

                // Hide the search results when the user clicks on the page.
                .on('click', function (e) {
                    if (vm.query && !elemSearchResults.is(e.target) && elemSearchResults.has(e.target).length === 0) {
                        reset();
                    }
                })

                // Hide the search results when the escape key is pressed.
                // Auto-focus on the search bar when the question mark key is pressed.
                .on('keyup', function (e) {
                    switch (e.keyCode) {

                        // Escape
                        case 27:
                        if (vm.query) {
                            reset();
                        }
                        break;

                        // Question mark (disabled for now)
                        case 191:
                        //elemSearchInput.focus();
                        break;

                        // Reposition the search results everytime a user types.
                        default:
                        positionElements();
                        break;
                    }
                });
        }


        /**
         * Hides the search bar if the resource does not exist.
         */
        function hideSearch() {

            // This removes a specific class from the search bar;
            // useful if the Omnibar has loaded already.
            angular.element(document.getElementsByClassName(OmnibarSearchSettings.getSearchFormClass())).removeClass(OmnibarSearchSettings.getSearchFormClass());

            // Sometimes, if our fetchPages request is faster than the Omnibar,
            // we can set this property before it gets built.
            bbOmnibarConfig.enableSearch = false;
        }


        /**
         * Sets search results elements and events.
         */
        function setElements() {

            // Set elements.
            elemSearchResults = angular.element(document.getElementById(OmnibarSearchSettings.getSearchResultsId()));
            elemSearchInput = angular.element(document.getElementById(OmnibarSearchSettings.getSearchInputId()));
            positionElements();

            // Watch for Window being resized.
            angular.element(window).bind('resize', function () {
                positionElements();
            });
        }

        /**
         * Positions the search results dropdown beneath the search bar.
         */
        function positionElements() {
            elemSearchResults.css({
                'left': elemSearchInput.position().left + 'px'
            });
        }


        /**
         * Cancels a search and removes the search results from the Omnibar.
         */
        function reset() {
            vm.query = omnibarScope.searchText = '';
            vm.searching = omnibarScope.searching = false;
            vm.results = [];
            $scope.$digest();
        }


        /**
         * Executes a search when the user types in the search box.
         */
        function searchBoxKeyUp() {

            // Set values.
            vm.searching = omnibarScope.searching = true;
            vm.query = omnibarScope.searchText;

            // Reset if query empty.
            if (vm.query === '' || vm.enabled === false) {
                reset();
                return;
            }

            // Ask the search service for page results based on the query.
            SearchService.search(vm.query).then(function (results) {
                if (results.error) {
                    hideSearch();
                    reset();
                    return;
                }
                vm.results = results;
                vm.searching = omnibarScope.searching = false;
            });
        }


        // Listen to events.
        omnibarScope.$on('searchBoxKeyUp', searchBoxKeyUp);
        $scope.$on('omnibarSearchLoaded', checkConnection);
    }


    /**
     * Merge settings.
     */
    function Run($rootScope, bbOmnibarConfig, OmnibarSearchSettings) {
        bbOmnibarConfig.enableSearch = OmnibarSearchSettings.getEnableSearch();
        bbOmnibarConfig.afterLoad = function () {
            angular.element(document).ready(function () {
                $rootScope.$broadcast('omnibarSearchLoaded');
            });
        };
    }


    /**
     * Fetches JSON object representative of searchable pages.
     * This service also searches the object against keywords.
     */
    function SearchService($q, $http, OmnibarSearchSettings) {
        var resultsBaseUri,
            data,
            service,
            resource;

        service = this;
        resultsBaseUri = OmnibarSearchSettings.getResultsBaseUri();
        resource = OmnibarSearchSettings.getResourceUrl();


        /**
         * An object to represent a search query.
         */
        function Query(options) {
            var defaults,
                results,
                settings;

            defaults = {
                keywords: ''
            };
            results = '';
            settings = angular.extend({}, defaults, options);


            /**
             * Initializer.
             */
            this.execute = function () {
                var defer = $q.defer();
                service.fetchPages().then(function (res) {
                    if (res.error) {
                        defer.resolve(res);
                        return;
                    }
                    results = filterPages(res);
                    results = sortPages(results);
                    defer.resolve(results);
                });
                return defer.promise;
            };


            /**
             * Only add those pages that have passed some level of criteria.
             */
            function filterPages(pages) {
                var i,
                    len,
                    page,
                    results;

                results = [];

                if (!angular.isArray(pages)) {
                    return results;
                }

                for (i = 0, len = pages.length; i < len; i++) {
                    page = pages[i];
                    page = weighPageAgainstKeywords(page);
                    if (page.weight > 0) {
                        results.push(page);
                    }
                }

                return results;
            }


            /**
             * Sorts an array of page data according to 'weight'.
             */
            function sortPages(pages) {
                pages.sort(function (a, b) {
                    return (a.weight > b.weight) ? 1 : (a.weight < b.weight ? -1 : 0);
                });
                return pages;
            }


            /**
             * Each page receives a 'weight' number depending on how closely they match the keywords.
             */
            function weighPageAgainstKeywords(page) {
                var fields,
                    regex;

                fields = [
                    {
                        type: 'description',
                        baseWeight: 100,
                        include: true
                    },
                    {
                        type: 'name',
                        baseWeight: 1000,
                        include: false
                    },
                    {
                        type: 'text',
                        baseWeight: 1,
                        include: true
                    }
                ];

                regex = new RegExp(escapeRegEx(settings.keywords), 'ig');

                page.weight = 0;
                page.match = '';

                fields.forEach(function (field) {
                    var data,
                        finalMatch,
                        match;

                    if (page[field.type]) {

                        data = page[field.type];
                        data = data.replace(/\n/g, ' ');

                        while ((match = regex.exec(data)) !== null) {

                            // For each match, increase the page's weight.
                            page.weight += field.baseWeight;

                            // Should this field be included in the matched text preview?
                            if (field.include) {
                                finalMatch = match;
                            }
                        }

                        // Get the strings that surround the keywords.
                        (function (match) {

                            var after,
                                afterIndex,
                                before,
                                beforeIndex;

                            if (match === undefined) {
                                page.weight = 0;
                                return;
                            }

                            // How many characters to capture before the keywords:
                            beforeIndex = match.index - 10;
                            if (beforeIndex < 0) {
                                beforeIndex = 0;
                            }

                            // How many characters to capture after the keywords:
                            afterIndex = match.index + 50;
                            if (afterIndex > data.length - 1) {
                                afterIndex = data.length - 1;
                            }

                            before = data.slice(beforeIndex, match.index);
                            after = data.slice(match.index, afterIndex);

                            // Prefix the description with an ellipsis.
                            if (beforeIndex > 0) {
                                before = '...' + (before.substr(2)).replace(/^ /, '');
                            }

                            page.match = (before + after).trim();

                        }(finalMatch));
                    }
                });

                return page;
            }
        }


        /**
         * Modifies the page's URIs to represent the site they live on.
         */
        function createGlobalUris() {
            var i,
                len,
                page;

            for (i = 0, len = data.length; i < len; i++) {
                page = data[i];
                page.uri = resultsBaseUri + page.uri;
            }
        }


        /**
         * Expose the search method to be used by controllers.
         */
        this.search = function (keywords) {
            var query = new Query({
                keywords: keywords
            });
            return query.execute();
        };


        /**
         * Get the external resource.
         */
        this.fetchPages = function () {
            var defer = $q.defer();
            if (data) {
                defer.resolve(data);
            } else {
                $http.get(resource, { cache: false })
                    .then(function (res) {
                        if (res.data && res.data.hasOwnProperty('pages')) {
                            data = res.data.pages;
                            createGlobalUris();
                            service.status = 'success';
                            defer.resolve(data);
                        } else {
                            service.status = 'error';
                            defer.resolve(res);
                        }
                    })
                    .catch(function (e) {
                       service.status = 'error';
                       defer.resolve({ error: e });
                    });
            }
            return defer.promise;
        };
    }


    /**
     * Allow other modules to configure the Omnibar Search Results.
     */
    function OmnibarSearchSettingsProvider() {
        var resultsBaseUri,
            enableSearch,
            resourceUrl,
            searchFormClass,
            searchInputId,
            searchResultsId,
            searchResultsTemplateUri;

        // Defaults.
        resultsBaseUri = '';
        enableSearch = true;
        resourceUrl = resultsBaseUri + '/content.json';
        searchFormClass = 'bb-omnibar-searchenabled';
        searchInputId = 'omnibar_searchbox';
        searchResultsId = 'bb-omnibar-search-results';
        searchResultsTemplateUri = '/assets/vendor/bb-omnibar-search/templates/bb-omnibar-search.hbs';

        // Available methods during config phase:
        this.setResultsBaseUri = function (value) {
            if (value === undefined) {
                return;
            }
            resultsBaseUri = value;
        };
        this.setEnableSearch = function (value) {
            enableSearch = (value === true);
        };
        this.setResourceUrl = function (value) {
            resourceUrl = value;
        };
        this.setSearchFormClass = function (value) {
            searchFormClass = value;
        };
        this.setSearchInputId = function (value) {
            searchInputId = value;
        };
        this.setSearchResultsId = function (value) {
            searchResultsId = value;
        };
        this.setSearchResultsTemplateUri = function (value) {
            searchResultsTemplateUri = value;
        };

        // Available after config phase:
        this.$get = function () {
            return {
                getResultsBaseUri: function () {
                    return resultsBaseUri;
                },
                getEnableSearch: function () {
                    return enableSearch;
                },
                getResourceUrl: function () {
                    return resourceUrl;
                },
                getSearchFormClass: function () {
                    return searchFormClass;
                },
                getSearchInputId: function () {
                    return searchInputId;
                },
                getSearchResultsId: function () {
                    return searchResultsId;
                },
                getSearchResultsTemplateUri: function () {
                    return searchResultsTemplateUri;
                }
            };
        };
    }


    /**
     * Directive for omnibar search results.
     * Usage: <bb-omnibar-search-results></bb-omnibar-search-results>
     */
    function bbOmnibarSearchResults(OmnibarSearchSettings) {
        return {
            restrict: 'AE',
            controller: 'OmnibarSearchController',
            controllerAs: 'ctrl',
            scope: {
                noResultsMessage: '@',
                searchingMessage: '@'
            },
            bindToController: true,
            templateUrl: OmnibarSearchSettings.getSearchResultsTemplateUri()
        };
    }


    /**
     * Escapes strings.
     */
    function escapeRegEx(pattern) {
        if (pattern === undefined || typeof pattern !== "string") {
            return "";
        }
        return pattern.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    }




    // Dependencies.
    FilterHighlight.$inject = [
        '$sce'
    ];

    OmnibarSearchController.$inject = [
        '$scope',
        '$timeout',
        'bbOmnibarConfig',
        'SearchService',
        'OmnibarSearchSettings'
    ];

    Run.$inject = [
        '$rootScope',
        'bbOmnibarConfig',
        'OmnibarSearchSettings'
    ];

    SearchService.$inject = [
        '$q',
        '$http',
        'OmnibarSearchSettings'
    ];

    bbOmnibarSearchResults.$inject = [
        'OmnibarSearchSettings'
    ];




    // Initialize.
    angular.module('OmnibarSearch', [
            'sky'
        ])
        .controller('OmnibarSearchController', OmnibarSearchController)
        .directive('bbOmnibarSearchResults', bbOmnibarSearchResults)
        .filter('highlight', FilterHighlight)
        .provider('OmnibarSearchSettings', OmnibarSearchSettingsProvider)
        .service('SearchService', SearchService)
        .run(Run);

}(window.angular));