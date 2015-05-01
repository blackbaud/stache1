/*jshint browser: true, jasmine: true */
/*global angular, inject, module, $ */

describe('Grid column picker', function () {
    'use strict';  
    
    var basicGridHtml,
        $compile,
        $document,
        el,
        fxOff,
        locals,
        $scope,
        $timeout;
    
    function setUpGrid(gridHtml, setLocals) {
        var el = angular.element(gridHtml);
        
        $document.find('body').eq(0).append(el);
        
        if (angular.isDefined(setLocals)) {
            $scope.locals = setLocals;
        } else {
            $scope.locals = locals;
        }

        $compile(el)($scope);
        
        $scope.$digest();
        
        return el;
    }
    
    function getColumnChooserButton(el) {
        return el.find('.bb-grid-container .table-toolbar .column-picker-button');
    }
    
    function getColumnChooserRows(modalEl) {
        return modalEl.find('table tbody tr');
    }
    
    function getModal() {
        return $document.find('body .bb-modal-content-wrapper');
    }
    
    function closeModal(modalEl) {
        modalEl.find('.modal-footer button.btn-link').click();
        $timeout.flush();
    }
    
    function getHeaders(el) {
        return el.find('.bb-grid-container .table-responsive .ui-jqgrid-hbox > table > thead > tr > th');
    }
    
    beforeEach(module('ngMock'));
    beforeEach(module(
        'sky.grids',
        'sky.templates'
    ));
    
    beforeEach(inject(function (_$rootScope_, _$compile_, _$document_, _$timeout_) {
        $scope = _$rootScope_;
        $compile = _$compile_;
        $document = _$document_;
        $timeout = _$timeout_;
        
        locals = {
            gridOptions: {
                columns: [
                    {
                        caption: 'Name',
                        jsonmap: 'name',
                        id: 1,
                        name: 'name'
                    },
                    {
                        caption: 'Instrument',
                        jsonmap: 'instrument',
                        id: 2,
                        name: 'instrument'
                    },
                    {
                        caption: 'Biography',
                        jsonmap: 'bio',
                        id: 3,
                        name: 'bio'
                    }
                ],
                data: [],
                selectedColumnIds: [1, 2, 3]
            }
        };
        
        basicGridHtml = '<div><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
        
        el = {};
        fxOff =  $.fx.off;
        //turn off jquery animate.
        $.fx.off = true;

    }));
               
    afterEach(function () {
        if (angular.isDefined(el)) {
            if (angular.isFunction(el.remove)) {
                el.remove();
            }
        }
        $.fx.off = fxOff;
    });
    
    it('can have its button hidden', function () {
        var columnChooserButtonEl;
        locals.gridOptions.hideColPicker = true;
        el = setUpGrid(basicGridHtml, locals);
            
        columnChooserButtonEl = getColumnChooserButton(el);
            
        expect(columnChooserButtonEl.eq(0)).toHaveCss({"display": "none"});
    });
        
    it('opens a modal with the correct columns', function () {
        var modalEl,
            modalTitleEl,
            modalRowsEl,
            columnChooserButtonEl;
        el = setUpGrid(basicGridHtml);
            
        columnChooserButtonEl = getColumnChooserButton(el);
            
        expect(columnChooserButtonEl.eq(0)).not.toHaveCss({"display": "none"});
        columnChooserButtonEl.click();
            
        $scope.$digest();
            
        modalEl = getModal();
            
        //verify title
        modalTitleEl = modalEl.eq(0).find('.modal-header .bb-dialog-header span');
        expect(modalTitleEl.eq(0)).toHaveText('Choose columns to show in the list');
            
        //make sure the expected check boxes are here
        modalRowsEl = getColumnChooserRows(modalEl.eq(0));
            
        expect(modalRowsEl.eq(0).find('td').eq(1)).toHaveText('Biography');
        expect(modalRowsEl.eq(1).find('td').eq(1)).toHaveText('Instrument');
        expect(modalRowsEl.eq(2).find('td').eq(1)).toHaveText('Name');
            
        closeModal(modalEl.eq(0));
    });
        
    it('handles creates column category filters if they exist', function () {
        var modalEl,
            modalRowsEl,
            categoryEl,
            columnChooserButtonEl;
            
        locals.gridOptions.columns[0].category = 'Nonesense';
        locals.gridOptions.columns[1].category = 'Specialness';
        locals.gridOptions.columns[2].category = 'Specialness';
        locals.gridOptions.columns.push(
            {
                caption: 'AAA',
                jsonmap: 'aaa',
                id: 4,
                name: 'aaa'
            }
        );
            
        locals.gridOptions.columns.push(
            {
                caption: 'AAAA',
                jsonmap: 'aaaaa',
                id: 6,
                name: 'aaaaa'
            }
        );
            
        locals.gridOptions.columns.unshift(
            {
                caption: 'AAAA',
                jsonmap: 'aaaa',
                id: 5,
                name: 'aaaa'
            }
        );
            
        el = setUpGrid(basicGridHtml, locals);
            
        columnChooserButtonEl = getColumnChooserButton(el);

        columnChooserButtonEl.click();
            
        $scope.$digest();
            
        modalEl = getModal();
            
        //make sure the expected check boxes are here
        modalRowsEl = getColumnChooserRows(modalEl.eq(0));
            
        expect(modalRowsEl.eq(0).find('td').eq(1)).toHaveText('AAA');
        expect(modalRowsEl.eq(1).find('td').eq(1)).toHaveText('AAAA');
        expect(modalRowsEl.eq(2).find('td').eq(1)).toHaveText('AAAA');
        expect(modalRowsEl.eq(3).find('td').eq(1)).toHaveText('Biography');
        expect(modalRowsEl.eq(4).find('td').eq(1)).toHaveText('Instrument');
        expect(modalRowsEl.eq(5).find('td').eq(1)).toHaveText('Name');
            
        //get categories
        categoryEl = modalEl.eq(0).find('.checklist-filter-bar button');
            
        expect(categoryEl.eq(0)).toHaveText('All');
        expect(categoryEl.eq(0)).toHaveClass('btn-primary');
            
        expect(categoryEl.eq(1)).toHaveText('Specialness');
        expect(categoryEl.eq(1)).toHaveClass('btn-default');
            
        expect(categoryEl.eq(2)).toHaveText('Nonesense');
        expect(categoryEl.eq(2)).toHaveClass('btn-default');
        closeModal(modalEl.eq(0));
    });
        
    it('applies search and category filters', function () {
        var modalEl,
            modalRowsEl,
            categoryEl,
            columnChooserButtonEl,
            searchEl;
            
        locals.gridOptions.columns[0].category = 'Nonesense';
        locals.gridOptions.columns[1].category = 'Specialness';
        locals.gridOptions.columns[2].category = 'Specialness';
        locals.gridOptions.columns[2].description = 'Description';
            
        el = setUpGrid(basicGridHtml, locals);
            
        columnChooserButtonEl = getColumnChooserButton(el);
        columnChooserButtonEl.click();
            
        $scope.$digest();
            
        modalEl = getModal();
            
        //get categories
        categoryEl = modalEl.eq(0).find('.checklist-filter-bar button');
            
        categoryEl.eq(1).click();
            
        $scope.$digest();
            
        //make sure the expected check boxes are here
        modalRowsEl = getColumnChooserRows(modalEl.eq(0));
        expect(modalRowsEl.eq(0).find('td').eq(1)).toHaveText('Biography');
        expect(modalRowsEl.eq(1).find('td').eq(1)).toHaveText('Instrument');
        expect(modalRowsEl.eq(2)).toHaveCss({"display": "none"});
            
        searchEl = modalEl.eq(0).find('.checklist-filter-bar input');
            
        searchEl.eq(0).val('In').trigger('change');
        expect(modalRowsEl.eq(0)).toHaveCss({"display": "none"});
        expect(modalRowsEl.eq(1).find('td').eq(1)).toHaveText('Instrument');
        expect(modalRowsEl.eq(2)).toHaveCss({"display": "none"});
            
        searchEl.eq(0).val('Des').trigger('change');
        expect(modalRowsEl.eq(0).find('td').eq(1)).toHaveText('Biography');
        expect(modalRowsEl.eq(1)).toHaveCss({"display": "none"});
        expect(modalRowsEl.eq(2)).toHaveCss({"display": "none"});
            
        searchEl.eq(0).val('').trigger('change');
        categoryEl.eq(0).click();
        expect(modalRowsEl.eq(0).find('td').eq(1)).toHaveText('Biography');
        expect(modalRowsEl.eq(1).find('td').eq(1)).toHaveText('Instrument');
        expect(modalRowsEl.eq(2).find('td').eq(1)).toHaveText('Name');
            
        closeModal(modalEl.eq(0));
    });
        
    it('applies the correct column picker ids on confirmation', function () {
        var columnChooserButtonEl,
            headerEl,
            modalEl,
            modalRowsEl;
            
        locals.gridOptions.selectedColumnIds = [1, 2];
            
        el = setUpGrid(basicGridHtml, locals);
            
        columnChooserButtonEl = getColumnChooserButton(el);
            
        expect(columnChooserButtonEl.eq(0)).not.toHaveCss({"display": "none"});
        columnChooserButtonEl.click();
            
        $scope.$digest();
            
        modalEl = getModal();
            
        $scope.$digest();

        modalRowsEl = getColumnChooserRows(modalEl.eq(0));
            
        modalRowsEl.eq(0).find('td input').eq(0).click();
        modalRowsEl.eq(2).find('td input').eq(0).click();
            
        modalEl.eq(0).find('.modal-footer .btn-primary').eq(0).click();
        $timeout.flush();
        $scope.$digest();
            
        headerEl = getHeaders(el);
            
        expect(headerEl.length).toBe(2);
            
        expect(headerEl.eq(0)).toHaveText('Instrument');
        expect(headerEl.eq(1)).toHaveText('Biography');
    });
});