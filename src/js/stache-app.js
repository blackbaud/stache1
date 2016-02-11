/*global window, angular */
(function (window, angular) {
    'use strict';

    /**
     *
     */
    function Config($stateProvider, $urlRouterProvider) {
        // Currently no registered routes
    }

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
     * Injects Window constants into our app.
     */
    function Constants() {
        var constants = {};
        try {
            constants = window.STACHE.config;
        }
        catch (e) {}
        return constants;
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
    Config.$inject = [
        '$stateProvider',
        '$urlRouterProvider'
    ];
    ConfigOmnibar.$inject = [
        'OmnibarSearchSettingsProvider',
        'bbOmnibarConfig',
        'stacheConfig'
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
        .constant('stacheConfig', Constants.call())
        .config(Config)
        .config(ConfigOmnibar)
        .controller('NavController', angular.noop)
        .controller('SearchController', SearchController)
        .directive('stacheEnter', DirectiveStacheEnter)
        .filter('truncate', FilterTruncate)
        .run(Run);
}(window, window.angular));