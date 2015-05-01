/*jshint browser: true, jasmine: true */
/*global angular, inject, module */

describe('Checklist directive', function () {
    'use strict';
    
    var $compile,
        $scope,
        $parse,
        checklistHtml,
        items,
        locals,
        resources;

    beforeEach(module('ngMock'));
    beforeEach(module('sky.checklist', 'sky.templates'));

    beforeEach(inject(function (_$rootScope_, _$compile_, _$parse_, bbResources) {
        $compile = _$compile_;
        $scope = _$rootScope_;
        $parse = _$parse_;
        
        resources = bbResources;
        items = [
            { column: 'Amount', description: 'Amount of the gift' },
            { column: 'Constituent summary', description: 'Summary information about the constituent who gave the gift' },
            { column: 'Soft credits', description: 'Soft credits for the gift' }
        ];
        
        function onSearch() {
            locals.items = [];
        }
        
        locals = {
            items:  items,
            selectedItems: [items[0]],
            onSearch: onSearch,
            includeSearch: true
        };
        
        /*jslint white: true */
        checklistHtml = '<bb-checklist bb-checklist-items="locals.items"' +
                                    'bb-checklist-selected-items="locals.selectedItems"' +
                                    'bb-checklist-filter-callback="locals.onSearch"' +
                                    'bb-checklist-include-search="locals.includeSearch"' +
                                    'bb-checklist-search-placeholder="\'My Placeholder\'"' +
                                    'bb-checklist-no-items-message="\'No items found\'">' +
                                    '<bb-checklist-columns>' + 
                                        '<bb-checklist-column bb-checklist-column-caption="\'Column name\'" bb-checklist-column-field="\'column\'" bb-checklist-column-width="\'30%\'" bb-checklist-column-class="\'column-class\'"></bb-checklist-column>' +
                                        '<bb-checklist-column bb-checklist-column-caption="\'Column Description\'" bb-checklist-column-field="\'description\'" bb-checklist-column-width="\'70%\'" bb-checklist-column-class="\'description-class\'"></bb-checklist-column>' +
                                    '</bb-checklist-columns>' +
                                '</bb-checklist>';
        /*jslint white: false*/
    }));

    it('sets the table headers and table rows', function () {
       
        var i,
            tableHeader,
            tableRows,
            tableCells,
            inputCell,
            el = angular.element(checklistHtml);
        
        $compile(el)($scope);
        
        $scope.locals = locals;
        
        $scope.$digest();
        
        tableHeader = el.find('th');
        
        expect(tableHeader.eq(1).text()).toBe('Column name');
        expect(tableHeader.eq(2).text()).toBe('Column Description');
        
        tableRows = el.find('tbody tr');
        
        expect(tableRows.length).toBe(3);
        
        for (i = 0; i < tableRows.length; i = i + 1) {
            tableCells = angular.element(tableRows[i]).find('td');
            
            inputCell = angular.element(tableCells[0]).find('input');
            expect(inputCell.length).toBe(1);
            
            expect(tableCells.length).toBe(3);
            
            expect(tableCells.eq(1).text()).toBe(items[i].column);
            expect(tableCells.eq(1)).toHaveClass('column-class');
            expect(tableCells.eq(2).text()).toBe(items[i].description);
            expect(tableCells.eq(2)).toHaveClass('description-class');
        }
        

    });
    
    it('should handle row clicks', function () {
        var rowEl,
            el = angular.element(checklistHtml);
        
        $compile(el)($scope);
        
        $scope.locals = locals;
        
        $scope.$digest();

        rowEl = el.find('tbody tr');
        
        expect($scope.locals.selectedItems).toEqual([items[0]]);
        
        rowEl.eq(1).click();
        
        expect($scope.locals.selectedItems).toEqual([items[0], items[1]]);
        
        rowEl.eq(0).click();
        
        expect($scope.locals.selectedItems).toEqual([items[1]]);

        
    });
    
    it('clears selections', function () {
        var clearEl,
            rowEl,
            el = angular.element(checklistHtml);
        
        $compile(el)($scope);
        
        $scope.locals = locals;
        
        $scope.$digest();
        
        rowEl = el.find('tbody tr');
        
        rowEl.eq(1).click();
        
        expect($scope.locals.selectedItems).toEqual([items[0], items[1]]);
        
        clearEl = el.find('a:contains("' + resources.checklist_clear_all + '")');
        
        clearEl.eq(0).click();
        
        expect($scope.locals.selectedItems).toEqual([]);
        
    });
    
    it('selects all', function () {
        var selectEl,
            rowEl,
            el = angular.element(checklistHtml);
        
        $compile(el)($scope);
        
        $scope.locals = locals;
        
        $scope.$digest();
        
        rowEl = el.find('tbody tr');
        
        rowEl.eq(1).click();
        
        expect($scope.locals.selectedItems).toEqual([items[0], items[1]]);
        
        selectEl = el.find('a:contains("' + resources.checklist_select_all + '")');
        
        selectEl.eq(0).click();
        
        expect($scope.locals.selectedItems).toEqual(items);
    });
    
    it('should watch the search text', function () {
        var searchEl,
            rowEl,
            el = angular.element(checklistHtml),
            elScope;
        
        $compile(el)($scope);
        
        $scope.locals = locals;
        
        $scope.$digest();
        
        elScope = el.isolateScope();
        
        rowEl = el.find('tbody tr');
        
        rowEl.eq(1).click();
        
        expect($scope.locals.selectedItems).toEqual([items[0], items[1]]);
        
        searchEl = el.find('input[type="text"]');
        searchEl.val('your mother').trigger('change');
              
        expect(locals.items).toEqual([]);
    });
    
    it('throws errors on checklistModel when not applied to an input', function () {
        var el = angular.element('<div checklist-model="locals.selectedItems" checklist-value="locals.item[0]"/>');
    
        function errorFunctionWrapper() {
            $compile(el)($scope);
        }
        
        expect(errorFunctionWrapper).toThrow();
    });
    
    it('throws errors on checklistModel when checklistValue is not provided', function () {
        var el = angular.element('<input checklist-model="locals.selectedItems" />');
    
        function errorFunctionWrapper() {
            $compile(el)($scope);
        }
        
        expect(errorFunctionWrapper).toThrow();
        
    });
    
    it('handles when selected is not an array on remove', function () {
        var el = angular.element('<input checklist-model="locals.selectedItems" checklist-value="locals.items[0]"/>');
    
        $scope.locals = locals;
         
        $scope.locals.selectedItems = [items[0]];
        
        $compile(el)($scope);
        
        $scope.$digest();
         
        $scope.locals.selectedItems = null;
        $scope.$digest();
         
        expect($scope.locals.selectedItems).toBe(null);
    });
    
    it('handles when a search function is not available', function () {
        var searchEl,
            rowEl,
            el = angular.element(checklistHtml),
            elScope;
        
        $compile(el)($scope);
        
        $scope.locals = locals;
        
        $scope.locals.onSearch = null;
        
        $scope.$digest();
        
        elScope = el.isolateScope();
        
        rowEl = el.find('tbody tr');
        
        rowEl.eq(1).click();
        
        expect($scope.locals.selectedItems).toEqual([items[0], items[1]]);
        
        searchEl = el.find('input[type="text"]');
        //searchEl.text('your mother');
        searchEl.val('your mother').trigger('input');
        
        expect(locals.items.length).toBe(3);
    });
    
    it('handles when selected is not an array', function () {
        var rowEl,
            el = angular.element(checklistHtml);
        
        $compile(el)($scope);
        
        $scope.locals = locals;
        
        $scope.locals.selectedItems = null;
        
        $scope.$digest();

        rowEl = el.find('tbody tr');
        
        expect($scope.locals.selectedItems).toBe(null);
        
        rowEl.eq(1).click();
        
        expect($scope.locals.selectedItems).toBe(null);
        
        rowEl.eq(0).click();
        
        expect($scope.locals.selectedItems).toBe(null);
    });
    
});