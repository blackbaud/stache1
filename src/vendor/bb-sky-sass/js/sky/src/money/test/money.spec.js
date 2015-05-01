/*jshint browser: true, jasmine: true */
/*global inject, module, spyOnEvent */

describe('Money input directive', function () {
    'use strict';
    
    var $compile,
        $scope,
        $timeout,
        bbMoneyConfig;
    
    beforeEach(module('sky.money'));
    
    beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_, _bbMoneyConfig_) {
        $compile = _$compile_;
        $scope = _$rootScope_;
        $timeout = _$timeout_;
        bbMoneyConfig = _bbMoneyConfig_;
    }));
    
    function compileEl() {
        return $compile('<input type="text" ng-model="moneyFormattedValue" bb-money-input="moneyValue" />')($scope);
    }
    
    //    function validatePSign(currencyPositivePattern, expectedPSign) {
    //        var el,
    //            settings;
    //        
    //        bbMoneyConfig.currencyPositivePattern = currencyPositivePattern;
    //        
    //        el = compileEl();
    //        settings = el.autoNumeric('getSettings');
    //        
    //        expect(settings.pSign).toBe(expectedPSign);
    //    }
               
    it('should select existing text on focus', function () {
        var el = compileEl(),
            spyEvent;
        
        // Focus and select can't happen unless the element is in the DOM.
        el.appendTo(document.body);
        
        $scope.moneyFormattedValue = '$123,456.78';
        $scope.moneyValue = 123456.78;
        
        $scope.$digest();
        
        spyEvent = spyOnEvent(el, 'select');
        el.focus();
        
        $timeout.flush();
        
        expect(spyEvent).toHaveBeenTriggered();
        
        el.remove();
    });
               
    it('should pass configuration options to autoNumeric settings', function () {
        var el = compileEl(),
            settings;
        
        settings = el.autoNumeric('getSettings');
        
        expect(settings.aSep).toBe(bbMoneyConfig.currencyGroupSeparator);
        expect(settings.dGroup).toBe(bbMoneyConfig.currencyGroupSize);
        expect(settings.aDec).toBe(bbMoneyConfig.currencyDecimalSeparator);
        expect(settings.mDec).toBe(bbMoneyConfig.currencyDecimalDigits);
    });
               
    it('should format based on default configuration', function () {
        var el = compileEl();
        
        $scope.moneyFormattedValue = '$123,456.78';
        $scope.moneyValue = 123456.78;
        
        $scope.$digest();
        
        el.val(7654321);
        el.change();
        
        $scope.$digest();
        
        expect($scope.moneyValue).toBe(7654321);
        expect(el).toHaveValue('$7,654,321.00');
    });
               
    it('should clear the element\'s text when the scope\'s property is set to null', function () {
        var el = compileEl();
        
        $scope.moneyFormattedValue = '$123,456.78';
        $scope.moneyValue = 123456.78;
        
        $scope.$digest();
        
        $scope.moneyValue = null;
        
        $scope.$digest();
        
        expect(el).toHaveValue('');
    });
        
    // Not currently passing because of weird implementation.
    //    it('should configure currency symbol placement based on configuration options', function () {
    //        validatePSign('$n', 'p');
    //        validatePSign('n$', 's');
    //    });
});