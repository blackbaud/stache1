/*jshint browser: true, jasmine: true */
/*global angular, inject, module, $ */

describe('Datefield directive', function () {
    'use strict';
    
    var $compile,
        $scope,
        $q,
        $parse,
        dateConfig,
        dateFieldHtml,
        moment,
        resources;
    
    beforeEach(module('ngMock'));
    beforeEach(module('sky.datefield'));
    
    beforeEach(inject(function (_$rootScope_, _$compile_, _$parse_, _$q_, bbResources, bbDateFieldConfig, bbMoment) {
        $compile = _$compile_;
        $scope = _$rootScope_;
        $q = _$q_;
        $parse = _$parse_;
        dateConfig = bbDateFieldConfig;
        moment = bbMoment;
        resources = bbResources;
        
        dateConfig.currentCultureDateFormatString = 'mm/dd/yyyy';
        
        /*jslint white: true */
        dateFieldHtml = '<div>' +
                '<form name="testform" novalidate>' +
                    '<div class="form-group">' + 
                        '<label>Date Field</label>' +
                        '<bb-date-field name="testDate1" required ng-model="testdate1"></bb-date-field>' +
                        '<label class="error">Invalid Format</label>' +
                    '</div>' +
                '</form>' +
            '</div>';
        /*jslint white: false */
    }));
    
    afterEach(function () {
        $('.datepicker.dropdown-menu').remove();
    });

    it('sets the date div, input, and calendar',
        function () {
            var el,
                dateEl,
                inputEl,
                calendarEl;
        
            el = angular.element(dateFieldHtml);
        
            $scope.testdate1 = "5/17/1985";
        
            $compile(el)($scope);
        
            $scope.$digest();

            dateEl = el.find('.date');
        
            expect(dateEl.length).toBe(1);
        
            expect(dateEl.attr('name')).toBe('testDate1');
            expect(dateEl.attr('required')).toBe('required');
            expect(dateEl.attr('data-date-format')).toBe('mm/dd/yyyy');
        
            inputEl = el.find('input');
        
            expect(inputEl).toHaveValue('5/17/1985');
        
            calendarEl = el.find('span button i.fa-calendar');
            expect(calendarEl.length).toBe(1);
        
        });
    
    it('adds an id and automation attributes when requested by initialization', function () {
        var el,
            inputEl;
        
        el = angular.element('<div>' +
                '<form name="testform" novalidate>' +
                    '<div class="form-group">' + 
                        '<label>Date Field</label>' +
                        '<bb-date-field name="testDate1" required ng-model="testdate1" id="testId" bbauto-field="testauto"></bb-date-field>' +
                        '<label class="error">Invalid Format</label>' +
                    '</div>' +
                '</form>' +
            '</div>');
          
        $scope.testdate1 = '5/17/1985';
        
        $compile(el)($scope);
        
        $scope.$digest();
    
        inputEl = el.find('input');
         
        expect(inputEl.length).toBe(1);
        
        expect(inputEl.attr('id')).toBe('testId');
        expect(inputEl.attr('data-bbauto-field')).toBe('testautoInput');
            
    });
    
    it('handles date change to valid date', function () {
        var el,
            inputEl;
        
        el = angular.element(dateFieldHtml);
        
        
        $scope.testdate1 = "5/17/1985";
        
        $compile(el)($scope);
        
        $scope.$digest();
            
        inputEl = el.find('input');
        
        inputEl.val('5/18/1985').trigger('change');
     
        expect($scope.testdate1).toBe('05/18/1985');
    });
    
    it('handles date change to invalid date', function () {
        var el,
            inputEl;
        
        el = angular.element(dateFieldHtml);
        
        
        $scope.testdate1 = "5/17/1985";
        
        $compile(el)($scope);
        
        $scope.$digest();
            
        inputEl = el.find('input');
        
        inputEl.val('blaaaaaah').trigger('change');
     
        expect(angular.isDefined($scope.testdate1)).toBe(false);
        expect($scope.testform.$error.dateFormat[0].invalidFormatMessage).toBe(resources.date_field_invalid_date_message);
        
    });
    
    it('handles a value change of Invalid date', function () {
        var el,
            inputEl;
        
        el = angular.element(dateFieldHtml);
        
        
        $scope.testdate1 = "5/17/1985";
        
        $compile(el)($scope);
        
        $scope.$digest();
            
        inputEl = el.find('input');
        
        inputEl.val('Invalid date').trigger('change');
     
        expect(angular.isDefined($scope.testdate1)).toBe(false);
        expect($scope.testform.$error.dateFormat[0].invalidFormatMessage).toBe(resources.date_field_invalid_date_message);
    });
    
    it('handles an empty string value change', function () {
        var el,
            inputEl;
        
        el = angular.element(dateFieldHtml);
    
        $scope.testdate1 = "5/17/1985";
        
        $compile(el)($scope);
        
        $scope.$digest();
            
        inputEl = el.find('input');
        
        inputEl.val('').trigger('change');
        
        expect(angular.isDefined($scope.testdate1)).toBe(false);
        expect(angular.isDefined($scope.testform.$error.dateFormat)).toBe(false);
    });
    
    it('handles MMDDYYYY or DDMMYYYY translantions', function () {
        var el,
            inputEl;
        
        el = angular.element(dateFieldHtml);
    
        $scope.testdate1 = '5/17/1985';
        
        $compile(el)($scope);
        
        $scope.$digest();
            
        inputEl = el.find('input');
        
        inputEl.val('05181985').trigger('change');
        
        expect($scope.testdate1).toBe('05/18/1985');
        expect(angular.isDefined($scope.testform.$error.dateFormat)).toBe(false);
        
        dateConfig.currentCultureDateFormatString = 'dd/mm/yyyy';
        inputEl.val('18051985').trigger('change');
        expect($scope.testdate1).toBe('18/05/1985');
    });
    
    it('handles YYYYMMDD translantions', function () {
        var el,
            inputEl;
        
        el = angular.element(dateFieldHtml);
    
        $scope.testdate1 = '1985/05/17';
        
        $compile(el)($scope);
        
        $scope.$digest();
            
        dateConfig.currentCultureDateFormatString = 'yyyy/mm/dd';
         
        inputEl = el.find('input');
        
        inputEl.val('19850518').trigger('change');
        
        expect($scope.testdate1).toBe('1985/05/18');
        expect(angular.isDefined($scope.testform.$error.dateFormat)).toBe(false);
         
         
    });
    
    it('handles year translations for years less than 100', function () {
        var el,
            inputEl;
        
        el = angular.element(dateFieldHtml);
    
        $scope.testdate1 = '5/17/29';
        
        $compile(el)($scope);
        
        $scope.$digest();
           
        inputEl = el.find('input');
        
        inputEl.val('5/22/29').trigger('change');
        expect($scope.testdate1).toBe('05/22/2029');
        
        inputEl.val('5/22/30').trigger('change');
        expect($scope.testdate1).toBe('05/22/1930');
        expect(angular.isDefined($scope.testform.$error.dateFormat)).toBe(false);
    });
    
    it('handles datepicker change date', function () {
        var dateEl,
            e,
            el,
            calendarEl,
            inputEl;
        
        el = angular.element(dateFieldHtml);
    
        $scope.testdate1 = '5/17/1999';
        
        $compile(el)($scope);
        
        $scope.$digest();
           
        inputEl = el.find('input');
        
        dateEl = el.find('.date');
        
        dateEl.data('datepicker').date = new Date(1999, 9, 20);
        dateEl.data('datepicker').viewDate = new Date(1999, 9, 20);
        
        calendarEl = el.find('span button i.fa-calendar');
        e = $.Event('changeDate');
        e.date = new Date('10/20/1999');
        calendarEl.trigger(e);
        
        $scope.$digest();
        
        expect($scope.testdate1).toBe('10/20/1999');
        
        expect(inputEl.val()).toBe('10/20/1999');
    });
    
    it('handles SQL UTC dates', function () {
        var el,
            inputEl;
        
        el = angular.element(dateFieldHtml);
    
        $scope.testdate1 = '5/17/29';
        
        $compile(el)($scope);
        
        $scope.$digest();
           
        inputEl = el.find('input');
        
        inputEl.val('2009-06-15T00:00:00').trigger('change');
        expect($scope.testdate1).toBe('06/15/2009');
        
    });
    
    it('removes the datepicker on scope destroy', function () {
        var el,
            dateEl,
            datePicker;
        
        el = angular.element(dateFieldHtml);
    
        $scope.testdate1 = '5/17/29';
        
        $compile(el)($scope);
        
        $scope.$digest();
        $scope.$destroy();
        
        dateEl = el.find('.date');
        datePicker = dateEl.data('datepicker');
        
        expect(angular.isDefined(datePicker)).toBe(false);
           
    });
    
    it('accepts a custom validation formatter', function () {
        var el,
            inputEl;
        
        el = angular.element('<div>' +
                '<form name="testform" novalidate>' +
                    '<div class="form-group">' + 
                        '<label>Date Field</label>' +
                        '<bb-date-field name="testDate1" required ng-model="testdate1" bb-date-field-options="dateFieldOptions"></bb-date-field>' +
                        '<label class="error">Invalid Format</label>' +
                    '</div>' +
                '</form>' +
            '</div>');
          
        $scope.testdate1 = '5/17/1985';
        
        // Custom date formatting method
        $scope.dateFieldOptions = {
            formatValue: function (value) {
                return $q(function (resolve) {
                    var formattedValue = value,
                        formattingErrorMessage;

                    if (value.toUpperCase() !== value) {
                        formattingErrorMessage = 'Any letters should be capitalized.';
                    } else {
                        formattedValue = '[' + value.toUpperCase() + ']';
                    }
                    resolve({
                        formattedValue: formattedValue,
                        formattingErrorMessage: formattingErrorMessage
                    });
                });
            }
        };
        
        $compile(el)($scope);
        
        $scope.$digest();
    
        inputEl = el.find('input');
         
        inputEl.val('5/22/1929').trigger('change');
        expect($scope.testdate1).toBe('[5/22/1929]');
        
        inputEl.val('May2009').trigger('change');
        
        expect(angular.isDefined($scope.testdate1)).toBe(false);
        expect($scope.testform.$error.dateFormat[0].invalidFormatMessage).toBe('Any letters should be capitalized.');
        
        // Custom date formatting method
        $scope.dateFieldOptions = {
            formatValue: function (value) {
                var formattedValue = value,
                    formattingErrorMessage;

                if (value.toUpperCase() !== value) {
                    formattingErrorMessage = 'Any letters should be capitalized.';
                } else {
                    formattedValue = '[' + value.toUpperCase() + ']';
                }
                return {
                    formattedValue: formattedValue,
                    formattingErrorMessage: formattingErrorMessage
                };
            }
        };
        
        inputEl.val('5/22/1929').trigger('change');
        expect($scope.testdate1).toBe('[5/22/1929]');
        
        inputEl.val('May2009').trigger('change');
        
        expect(angular.isDefined($scope.testdate1)).toBe(false);
        expect($scope.testform.$error.dateFormat[0].invalidFormatMessage).toBe('Any letters should be capitalized.');
    });
    
});