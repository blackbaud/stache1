/*global angular, describe, beforeEach, module, inject, it, expect, spyOn*/
(function () {
    "use strict";

    describe('OmnibarSearchController', function () {

        var $scope,
            SearchService,
            bbOmnibarConfig,
            createController,
            ctrl,
            ctrlDeferred,
            deferred;

        // Initialize module.
        beforeEach(module('OmnibarSearch'));

        // Injections.
        beforeEach(inject(function ($injector) {
            var $q;

            bbOmnibarConfig = $injector.get('bbOmnibarConfig');
            $q = $injector.get('$q');
            deferred = $q.defer();
            ctrlDeferred = $q.defer();
            $scope = $injector.get('$rootScope').$new();
            SearchService = $injector.get('SearchService');
            spyOn(SearchService, 'search').and.returnValue(deferred.promise);
            spyOn(SearchService, 'fetchPages').and.returnValue(ctrlDeferred.promise);
            $scope.$digest();
        }));

        // Instantiate the controller.
        beforeEach(inject(function ($injector) {
            createController = function () {
                return $injector.get('$controller')('OmnibarSearchController', {
                    $scope: $scope,
                    $timeout: $injector.get('$timeout'),
                    bbOmnibarConfig: bbOmnibarConfig,
                    SearchService: SearchService
                });
            };
            ctrl = createController();
            $scope.$parent.$broadcast('omnibarLoaded');
            $scope.$digest();
        }));

        it('should approach the external resource immediately, to see if it exists', function () {
            ctrlDeferred.resolve({});
            $scope.$digest();
            expect(ctrl.enabled).toBe(true);
        });
        it('should hide the search box if the external resource does not exist', function () {
            createController();
            $scope.$parent.$broadcast('omnibarLoaded');
            $scope.$digest();
            ctrlDeferred.resolve({ error: "ERROR" });
            $scope.$digest();
            expect(bbOmnibarConfig.enableSearch).toBe(false);
        });
        it('should start a search when a key is pressed in the search box', function () {
            var results = [{}, {}];

            ctrlDeferred.resolve({});
            $scope.$digest();

            // Trigger the keyUp event.
            $scope.$parent.searchText = 'getting started';
            $scope.$parent.$broadcast('searchBoxKeyUp');
            expect(ctrl.searching).toBe(true);

            // Resolve any promises.
            deferred.resolve(results);
            $scope.$digest();

            expect(ctrl.searching).toBe(false);
            expect(ctrl.results).toEqual(results);
        });
        it('should not search when the query is empty', function () {
            $scope.$parent.searchText = '';
            $scope.$parent.$broadcast('searchBoxKeyUp');
            expect(ctrl.results).toEqual([]);
        });
    });
}());