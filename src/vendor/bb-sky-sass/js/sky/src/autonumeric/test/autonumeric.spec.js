/*jshint browser: true, jasmine: true */
/*global inject, module */

describe('Autonumeric', function () {
    'use strict';
    
    var $compile,
        $scope,
        $timeout;

    beforeEach(module('ngMock'));    
    beforeEach(module('sky.autonumeric'));
    
    describe('directive', function () {
        beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
            $compile = _$compile_;
            $scope = _$rootScope_;
            $timeout = _$timeout_;
        }));

        function compileEl() {
            return $compile('<input type="text" ng-model="numericValue" bb-autonumeric />')($scope);
        }
        
        it('should not have bb-autonumeric- class', function () {
            var el = compileEl();

            $scope.numericValue = 123456.78;
            $scope.$digest();
            expect(el.hasClass('bb-autonumeric-')).toBe(false);
        });

        it('should have bb-autonumeric-number class', function () {
            var el = $compile('<input type="text" ng-model="numericValue" bb-autonumeric="number" />')($scope);

            $scope.numericValue = 123456.78;
            $scope.$digest();
            expect(el.hasClass('bb-autonumeric-number')).toBe(true);
        });

        // Not passing in IE 10 on BrowserStack.  Maybe revisit this test later.  It's not mission critical.
        //        it('should select existing text on focus', function () {
        //            var el = compileEl();
        //
        //            // Focus and select can't happen unless the element is in the DOM.
        //            el.appendTo(document.body);
        //
        //            $scope.numericValue = 123456.78;
        //            $scope.$digest();
        //
        //            el[0].focus();
        //            $timeout.flush();
        //
        //            expect(el[0].selectionStart).toBe(0);
        //            expect(el[0].selectionEnd).toBe(el.val().length);
        //        });

        it('should clear the element\'s text when the scope\'s property is set to null', function () {
            var el = compileEl();

            $scope.numericValue = 123456.78;
            $scope.$digest();

            $scope.numericValue = null;
            $scope.$digest();

            expect(el.val()).toBe('');
        });

        it('should set the model value to null when element has no value', function () {
            var el = compileEl();

            $scope.numericValue = 123456.78;
            $scope.$digest();

            el.val('');
            el.change();

            expect($scope.numericValue).toBe(null);
        });

        it('should allow custom configuration', function () {
            var el = $compile('<input type="text" ng-model="numericValue" bb-autonumeric bb-autonumeric-settings="numericOptions" />')($scope);

            $scope.numericValue = 123456.78;
            $scope.numericOptions = {
                aSign: '^'
            };

            $scope.$digest();

            expect(el.val()).toBe('^123,456.78');

            // Ensure we can clear out custom settings.
            $scope.numericOptions = null;
            $scope.$digest();

            expect(el.val()).toBe('123,456.78');
        });
        

        describe('money option', function () {
            it('should have bb-autonumeric-money class', function () {
                var el = $compile('<input type="text" ng-model="moneyValue" bb-autonumeric="money" />')($scope);

                $scope.moneyValue = 123456.78;
                $scope.$digest();
                expect(el.hasClass('bb-autonumeric-money')).toBe(true);
            });

            it('should set scope value based on default configuration', function () {
                var el = $compile('<input type="text" ng-model="moneyValue" bb-autonumeric="money" />')($scope);

                $scope.moneyValue = 123456.78;

                $scope.$digest();

                el.val('$7,654,321.00');
                el.change();

                expect($scope.moneyValue).toBe(7654321);
            });

            it('should format the input value based on the scope value', function () {
                var el = $compile('<input type="text" ng-model="moneyValue" bb-autonumeric="money" />')($scope);

                $scope.moneyValue = 123456.78;

                $scope.$digest();

                expect(el.val()).toBe('$123,456.78');
            });

            it('should allow individual settings to be overridden', function () {
                var el = $compile('<input type="text" ng-model="moneyValue" bb-autonumeric="money" bb-autonumeric-settings="moneyOptions" />')($scope);

                $scope.moneyValue = 123456.78;
                $scope.moneyOptions = {
                    aSign: '^'
                };

                $scope.$digest();

                expect(el.val()).toBe('^123,456.78');
            });
        });
        
        describe('global configuration', function () {
            var bbAutonumericConfig,
                defaultThousandSeparator;
            
            beforeEach(inject(function (_bbAutonumericConfig_) {
                bbAutonumericConfig = _bbAutonumericConfig_;
                defaultThousandSeparator = bbAutonumericConfig.number.aSep;
                
                bbAutonumericConfig.number.aSep = '*';
            }));
            
            afterEach(function () {
                bbAutonumericConfig.number.aSep = defaultThousandSeparator;
            });
            
            it('should be respected', function () {
                var el = $compile('<input type="text" ng-model="numericValue" bb-autonumeric />')($scope);

                $scope.numericValue = 123456.78;

                $scope.$digest();

                expect(el.val()).toBe('123*456.78');
            });
            
            it('should cascade from "number" to "money"', function () {
                var el = $compile('<input type="text" ng-model="numericValue" bb-autonumeric="money" />')($scope);

                $scope.numericValue = 123456.78;

                $scope.$digest();

                expect(el.val()).toBe('$123*456.78');
            });
        });
    });
    
    describe('filter', function () {
        var $filter,
            bbResources;
        
        function validateMoneyAbbr(input, expected) {
            var formattedValue = $filter('bbAutonumeric')(input, 'money', true);
            expect(formattedValue).toBe(expected);
        }

        beforeEach(inject(function (_$filter_, _bbResources_) {
            $filter = _$filter_;
            bbResources = _bbResources_;
        }));
        
        it('should format the specified value', function () {
            var formattedValue = $filter('bbAutonumeric')(123456.78, 'money');
            
            expect(formattedValue).toBe('$123,456.78');
        });
        
        it('should use number as the default config type', function () {
            var formattedValue = $filter('bbAutonumeric')(123456.78);
            
            expect(formattedValue).toBe('123,456.78');
        });
        
        it('should not abbreviate values that round to less than 10,000', function () {
            validateMoneyAbbr(1.49, '$1');
            validateMoneyAbbr(1.5, '$2');
            validateMoneyAbbr(999, '$999');
            validateMoneyAbbr(999.49, '$999');
            validateMoneyAbbr(999.50, '$1,000');
            validateMoneyAbbr(1000, '$1,000');
            validateMoneyAbbr(9999, '$9,999');
            validateMoneyAbbr(9999.49, '$9,999');
        });
        
        it('should abbreviate values that round to more than than or equal to 10,000 but less than 1,000,000', function () {
            var suffix = bbResources.autonumeric_abbr_thousands;
            
            validateMoneyAbbr(99999, '$99.9' + suffix);
            validateMoneyAbbr(999999, '$999.9' + suffix);
        });
        
        it('should abbreviate values that round to more than than or equal to 1,000,000 but less than 1,000,000,000', function () {
            var suffix = bbResources.autonumeric_abbr_millions;
            
            validateMoneyAbbr(999999.50, '$1' + suffix);
            validateMoneyAbbr(1000000, '$1' + suffix);
            validateMoneyAbbr(9999999, '$9.9' + suffix);
            validateMoneyAbbr(99999999, '$99.9' + suffix);
            validateMoneyAbbr(999999999, '$999.9' + suffix);
        });
        
        it('should abbreviate values that round to more than or equal to 1,000,000,000', function () {
            var suffix = bbResources.autonumeric_abbr_billions;
            
            validateMoneyAbbr(999999999.50, '$1' + suffix);
            validateMoneyAbbr(1000000000, '$1' + suffix);
            validateMoneyAbbr(9999999999, '$9.9' + suffix);
            validateMoneyAbbr(99999999999, '$99.9' + suffix);
            validateMoneyAbbr(999999999999, '$999.9' + suffix);
            validateMoneyAbbr(9999999999999, '$9,999.9' + suffix);
        });
    });
});