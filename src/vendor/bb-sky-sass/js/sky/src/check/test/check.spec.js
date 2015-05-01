/*jshint browser: true, jasmine: true */
/*global angular, inject, module */

describe('Check directive', function () {
    'use strict';
    
    var $compile,
        $scope,
        $timeout;

    beforeEach(module('ngMock'));
    beforeEach(module('sky.check'));

    beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_) {
        $compile = _$compile_;
        $scope = _$rootScope_;
        $timeout = _$timeout_;
    }));

    describe('checkbox', function () {
        var el;

        beforeEach(function () {
            el = angular.element('<input type="checkbox" bb-check ng-model="isChecked" />');

            $compile(el)($scope);
            
            $timeout.flush();
        });

        it('should update the ng-model when the user clicks the checkbox', function () {
            el.iCheck('check');

            expect($scope.isChecked).toBe(true);

            el.iCheck('uncheck');

            expect($scope.isChecked).toBe(false);
        });

        it('should update its UI when its ng-model value changes', function () {
            $scope.isChecked = true;
            $scope.$digest();

            expect(el).toBeChecked();

            $scope.isChecked = false;
            $scope.$digest();

            expect(el).not.toBeChecked();
        });

        it('should have the appropriate CSS class', function () {
            expect(el.parent()).toHaveClass('bb-check-checkbox');
        });
    });

    describe('radio button', function () {
        var el1,
            el2;

        beforeEach(function () {
            el1 = angular.element('<input type="radio" bb-check ng-value="1" ng-model="selectedValue" />');
            el2 = angular.element('<input type="radio" bb-check ng-value="2" ng-model="selectedValue" />');

            $compile(el1)($scope);
            $compile(el2)($scope);
            
            $timeout.flush();
        });

        it('should update the ng-model when the user clicks the checkbox', function () {
            el1.iCheck('check');

            expect($scope.selectedValue).toBe(1);

            el2.iCheck('check');
            
            expect($scope.selectedValue).toBe(2);
        });
        
        it('should uncheck the other radio button when checked', function () {
            el1.iCheck('check');
            
            expect(el1).toBeChecked();
            expect(el2).not.toBeChecked();
            
            el2.iCheck('check');
            
            expect(el1).not.toBeChecked();
            expect(el2).toBeChecked();
        });
        
        it('should update its UI when its ng-model value changes', function () {
            $scope.selectedValue = 1;
            $scope.$digest();

            expect(el1).toBeChecked();
            expect(el2).not.toBeChecked();
            
            $scope.selectedValue = 2;
            $scope.$digest();

            expect(el1).not.toBeChecked();
            expect(el2).toBeChecked();
        });

        it('should have the appropriate CSS class', function () {
            expect(el1.parent()).toHaveClass('bb-check-radio');
        });
    });
});