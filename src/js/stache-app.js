/*global window, document */
(function (window, angular, $) {
    'use strict';

    /**
     * Configures the Omnibar.
     */
    function ConfigOmnibar(OmnibarSearchSettingsProvider, bbOmnibarConfig, stacheConfig) {
        // Configure Omnibar
        bbOmnibarConfig.serviceName = stacheConfig.omnibar.serviceName;
        bbOmnibarConfig.enableSearch = stacheConfig.omnibar.enableSearch;
        bbOmnibarConfig.enableHelp = stacheConfig.omnibar.enableHelp;
        bbOmnibarConfig.signInRedirectUrl = stacheConfig.omnibar.signInRedirectUrl;
        bbOmnibarConfig.signOutRedirectUrl = stacheConfig.omnibar.signOutRedirectUrl;
        bbOmnibarConfig.url = stacheConfig.omnibar.url;
        OmnibarSearchSettingsProvider.setSearchFormClass(stacheConfig.omnibarSearch.searchFormClass);
        bbOmnibarConfig.appLookupUrl = stacheConfig.omnibar.appLookupUrl;

        // Configure search results.
        OmnibarSearchSettingsProvider.setSearchInputId(stacheConfig.omnibarSearch.searchInputId);
        OmnibarSearchSettingsProvider.setSearchResultsId(stacheConfig.omnibarSearch.searchResultsId);
        OmnibarSearchSettingsProvider.setSearchResultsTemplateUri(stacheConfig.omnibarSearch.resultsTemplateUri);
        OmnibarSearchSettingsProvider.setResultsBaseUri(stacheConfig.omnibarSearch.resultsBaseUri);
        OmnibarSearchSettingsProvider.setResourceUrl(stacheConfig.omnibarSearch.resourceUrl);
        OmnibarSearchSettingsProvider.setSearchFormClass(stacheConfig.omnibarSearch.searchFormClass);
    }

    /**
     *
     */
    function Run($rootScope, bbOmnibarConfig, stacheConfig) {

        // Do stuff to the omnibar after it's been added to the screen.
        $rootScope.$on('omnibarSearchLoaded', function () {
            angular.element(document).ready(function () {

                // Look into making this mirror the Angular directive:
                $('.productmenucontainer').append($('.navbar .navbar-nav').clone().toggleClass('nav-items bb-omnibar-productmenu'));

                if (stacheConfig.omnibar.enableServiceNameLink) {
                    $('.bb-omnibar-serviceheader-servicename').wrapInner('<a id="omnibar-link" href="' + stacheConfig.omnibar.serviceNameLink + '"></a>');
                }

                if (stacheConfig.omnibar.delegationUri) {
                    $('a.bb-omnibar-signinheader-signin').attr('href', stacheConfig.omnibar.delegationUri);
                }

                // Let others tie into this method
                $rootScope.$broadcast('stacheOmnibarLoaded');
            });
        });
    }

    /**
     *
     */
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
                        vm.sent.results = results;
                    },
                    function () {
                        vm.sent.error = 'Error loading searchable content.';
                    }
                );
        }
    }

    /**
    * http://stackoverflow.com/questions/15417125/submit-form-on-pressing-enter-with-angularjs
    */
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

    /**
     *
     */
    function DirectiveStacheEqualHeight($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {

                // Add a timeout so that this executes at the end of a digest.
                $timeout(function () {
                    var items,
                        len;

                    items = element[0].querySelectorAll('.equal-height-item');
                    len = items.length;

                    function addClass(name, element) {
                        var classesString;
                        classesString = element.className || "";
                        if (classesString.indexOf(name) === -1) {
                            element.className += " " + name;
                        }
                    }

                    function setHeight() {
                        var h,
                            height,
                            i;

                        height = 0;

                        // First, make sure no explicit heights are set.
                        for (i = 0; i < len; ++i) {
                            items[i].style.height = 'auto';
                        }

                        // Second, determine the max height of the children.
                        for (i = 0; i < len; ++i) {
                            h = items[i].offsetHeight;
                            height = (h > height) ? h : height;
                        }

                        // Finally, set all children's height to the max height.
                        for (i = 0; i < len; ++i) {
                            items[i].style.height = height + 'px';
                        }

                        addClass("on", element[0]);
                    }

                    // Set the heights when the page loads.
                    setHeight();

                    // Set the heights when the page is resized.
                    angular.element(window).bind('resize', setHeight);
                });
            }
        };
    }

    /**
     *
     */
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

    // Dependencies.
    ConfigOmnibar.$inject = [
        'OmnibarSearchSettingsProvider',
        'bbOmnibarConfig',
        'stacheConfig'
    ];
    DirectiveStacheEqualHeight.$inject = [
        '$timeout'
    ];
    Run.$inject = [
        '$rootScope',
        'bbOmnibarConfig',
        'stacheConfig'
    ];
    SearchController.$inject = [
        '$state',
        '$stateParams',
        'SearchService'
    ];
    angular.module('stache', [
        'sky',
        'ui.router',
        'ui.bootstrap',
        'ui.select',
        'ngAnimate',
        'ngSanitize',
        'OmnibarSearch',
        'OmnibarSearch.templates'
    ]);

    angular.module('stache')
        .config(ConfigOmnibar)
        .controller('NavController', angular.noop)
        .controller('SearchController', SearchController)
        .directive('stacheEnter', DirectiveStacheEnter)
        .directive('stacheEqualHeight', DirectiveStacheEqualHeight)
        .filter('truncate', FilterTruncate)
        .run(Run);
}(window, window.angular, window.jQuery));
