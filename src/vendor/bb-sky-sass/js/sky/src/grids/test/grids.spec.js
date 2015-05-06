/*jshint browser: true, jasmine: true */
/*global angular, inject, module, $ */

describe('Grid directive', function () {
    'use strict';
    
    var basicGridHtml,
        bbMediaBreakpoints,
        bbViewKeeperBuilder,
        $compile,
        contextMenuItemClicked,
        dataSet1,
        $document,
        el,
        filterGridHtml,
        locals,
        $scope,
        skip,
        $timeout,
        top,
        fxOff,
        $window;
    
    function getTopAndSkipFromLoadMore(event, data) {
        skip = data.skip;
        top = data.top;
    }
    
    function searchTextChanged() {
        if (angular.isDefined($scope.locals.gridOptions.searchText) && $scope.locals.gridOptions !== '') {
            $scope.locals.gridOptions.data = [dataSet1[0]];
        } else {
            $scope.locals.gridOptions.data = dataSet1;
        }
    }
    
    function getContextMenuItems(rowid, rowObject) {
        if (rowid === '1' || rowObject.name === 'Ringo') {
            return [
                {
                    id: 'menu', 
                    title: 'Option1', 
                    cmd: function () {
                        contextMenuItemClicked = true;
                        return false;
                    }
                }
            ];
        }
    }
    
    function setUpGrid(gridHtml, setLocals) {
        var el = angular.element(gridHtml);
        
        el.appendTo(document.body);
        
        if (angular.isDefined(setLocals)) {
            $scope.locals = setLocals;
        } else {
            $scope.locals = locals;
        }

        $compile(el)($scope);
        
        $scope.$digest();
        
        return el;
    }
    
    function setGridData(data) {
        $scope.locals.gridOptions.data = data;
        $scope.$digest();
    }
    
    function getGridRows(el) {
        return el.find('.ui-jqgrid-bdiv tr.ui-row-ltr');
    }
    
    function getSearchBox(el) {
        return el.find('.bb-grid-toolbar-container .bb-search-container input');
    }
    
    function getSearchIcon(el) {
        return el.find('.bb-grid-toolbar-container .bb-search-container .bb-search-icon');
    }
    
    function getHeaders(el) {
        return el.find('.bb-grid-container .table-responsive .ui-jqgrid-hbox > table > thead > tr > th');
    }
    
    function getAddButton(el) {
        return el.find('.bb-grid-container .bb-grid-toolbar-container .add-button.btn-success');
    }
    
    function getTableWrapperEl(el) {
        return el.find('.table-responsive');
    }
    
    beforeEach(module('ngMock'));
    beforeEach(module(
        'sky.grids',
        'sky.templates'
    ));
    
    beforeEach(inject(function (_$rootScope_, _$compile_, _$document_, _$timeout_, _bbMediaBreakpoints_, _bbViewKeeperBuilder_, _$window_) {
        $scope = _$rootScope_;
        $compile = _$compile_;
        $document = _$document_;
        $timeout = _$timeout_;
        bbMediaBreakpoints = _bbMediaBreakpoints_;
        bbViewKeeperBuilder = _bbViewKeeperBuilder_;
        $window = _$window_;
        
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
        
        contextMenuItemClicked = false;
        
        dataSet1 = [
            {
                name: 'John',
                instrument: 'Rhythm guitar'
            },
            {
                name: 'Paul',
                instrument: 'Bass',
                bio: 'Lorem'
            },
            {
                name: 'George',
                instrument: 'Lead guitar'
            },
            {
                name: 'Ringo',
                instrument: 'Drums'
            }
        ];
        
        basicGridHtml = '<div><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
        
        filterGridHtml = '<div><bb-grid bb-grid-options="locals.gridOptions">' + 
                '<bb-grid-filters bb-options="locals.filterOptions">' + 
                '</bb-grid-filters>' +
                '</bb-grid></div>';
        
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
    
    it('loads a basic grid with data', function () {
        var containerEl,
            headerEl,
            toolBarEl,
            rowEl,
            cellEl;
        
        el = setUpGrid(basicGridHtml);
        
        containerEl = el.find('.bb-grid-container');
        
        expect(containerEl.length).toBe(1);
        
        //toobar elements are created
        toolBarEl = containerEl.eq(0).find('.bb-table-toolbar');
        expect(toolBarEl.length).toBe(1);
        
        expect(toolBarEl.eq(0).find('.bb-search-container').length).toBe(1);
        expect(toolBarEl.eq(0).find('.bb-column-picker-btn').length).toBe(1);
        expect(toolBarEl.eq(0).find('.bb-filter-btn').length).toBe(1);
        
        //column headers are created
        headerEl = getHeaders(el);
        expect(headerEl.length).toBe(3);
        
        expect(headerEl.eq(0)).toHaveText('Name');
        expect(headerEl.eq(1)).toHaveText('Instrument');
        expect(headerEl.eq(2)).toHaveText('Biography');
        
        setGridData(dataSet1);
        
        //rows are created
        rowEl = getGridRows(el);
        
        expect(rowEl.length).toBe(4);
        
        cellEl = rowEl.eq(0).find('td');
        
        expect(cellEl.length).toBe(3);
        
        expect(cellEl.eq(0)).toHaveText('John');
        expect(cellEl.eq(1)).toHaveText('Rhythm guitar');
        expect(cellEl.eq(2)).toHaveText('');
        
        cellEl = rowEl.eq(1).find('td');
        
        expect(cellEl.length).toBe(3);
        
        expect(cellEl.eq(0)).toHaveText('Paul');
        expect(cellEl.eq(1)).toHaveText('Bass');
        expect(cellEl.eq(2)).toHaveText('Lorem');
        
        cellEl = rowEl.eq(2).find('td');
        
        expect(cellEl.length).toBe(3);
        
        expect(cellEl.eq(0)).toHaveText('George');
        expect(cellEl.eq(1)).toHaveText('Lead guitar');
        expect(cellEl.eq(2)).toHaveText('');
        
        cellEl = rowEl.eq(3).find('td');
        
        expect(cellEl.length).toBe(3);
        
        expect(cellEl.eq(0)).toHaveText('Ringo');
        expect(cellEl.eq(1)).toHaveText('Drums');
        expect(cellEl.eq(2)).toHaveText('');
        
    });
    
    describe('pagination', function () {
        it('loads a grid with pagination with the default options', function () {
            var gridHtml = '<div><bb-grid bb-grid-options="locals.gridOptions" bb-grid-pagination="locals.paginationOptions"></bb-grid></div>',
                pagedData1 = [
                    {
                        name: 'John',
                        instrument: 'Rhythm guitar'
                    },
                    {
                        name: 'Paul',
                        instrument: 'Bass',
                        bio: 'Lorem'
                    },
                    {
                        name: 'George',
                        instrument: 'Lead guitar'
                    },
                    {
                        name: 'Ringo',
                        instrument: 'Drums'
                    }
                ],
                paginationContainerEl,
                paginationEl;
        
            el = setUpGrid(gridHtml);
            
            $scope.$on('loadMoreRows', getTopAndSkipFromLoadMore);
            
            $scope.locals.paginationOptions = {
                recordCount: 30
            };
            
            setGridData(pagedData1);
            
            paginationContainerEl = el.find('.bb-grid-pagination-container');
            
            expect(paginationContainerEl.length).toBe(1);
            
            paginationEl = paginationContainerEl.eq(0).find('li');
            
            //default max of 5 pages shown with two arrow elements
            expect(paginationEl.length).toBe(7);
            
            //expect the correct numbers to be shown in pagination
            expect(paginationEl.eq(1)).toHaveText(1);
            expect(paginationEl.eq(1)).toHaveClass('active');
            expect(paginationEl.eq(2)).toHaveText(2);
            expect(paginationEl.eq(3)).toHaveText(3);
            expect(paginationEl.eq(4)).toHaveText(4);
            expect(paginationEl.eq(5)).toHaveText(5);
            
            //expect movement to behave correctly
            paginationEl.eq(5).find('a').click();
            
            expect(top).toBe(5);
            expect(skip).toBe(20);
            
            expect(paginationEl.eq(5)).toHaveText(6);
            
            paginationEl.eq(5).find('a').click();
            
            expect(top).toBe(5);
            expect(skip).toBe(25);
            expect(paginationEl.eq(6)).toHaveClass('disabled');

        });
        
        it('loads a grid with pagination with custom max pages and items per page', function () {
            var gridHtml = '<div><bb-grid bb-grid-options="locals.gridOptions" bb-grid-pagination="locals.paginationOptions"></bb-grid></div>',
                pagedData1 = [
                    {
                        name: 'John',
                        instrument: 'Rhythm guitar'
                    }
                ],
                paginationContainerEl,
                paginationEl;
        
            el = setUpGrid(gridHtml);
            
            $scope.locals.paginationOptions = {
                recordCount: 2,
                itemsPerPage: 1,
                maxPages: 1
            };
            
            $scope.$on('loadMoreRows', getTopAndSkipFromLoadMore);
            
            setGridData(pagedData1);
            
            paginationContainerEl = el.find('.bb-grid-pagination-container');
            
            expect(paginationContainerEl.length).toBe(1);
            
            paginationEl = paginationContainerEl.eq(0).find('li');
            
            //default max of 5 pages shown with two arrow elements
            expect(paginationEl.length).toBe(3);
            
            //expect the correct numbers to be shown in pagination
            expect(paginationEl.eq(1)).toHaveText(1);
            expect(paginationEl.eq(1)).toHaveClass('active');
            
            //expect movement to behave correctly
            paginationEl.eq(2).find('a').click();
            
            expect(top).toBe(1);
            expect(skip).toBe(1);
            
            expect(paginationEl.eq(1)).toHaveText(2);
            
            expect(paginationEl.eq(2)).toHaveClass('disabled');

        });
        
    });
    
    
    describe('sorting', function () {
        it('respects excludedColumn property when sorting', function () {
            var headerEl;
        
            locals.gridOptions.sortOptions = {
                excludedColumns: ['name']
            };
            
            el = setUpGrid(basicGridHtml);
        
            headerEl = getHeaders(el);
            
            setGridData(dataSet1);
            
            expect(headerEl.eq(0)).not.toHaveClass('sorting-asc');
            expect(headerEl.eq(0)).not.toHaveClass('sorting-desc');
            
            headerEl.eq(0).click();
            
            expect(headerEl.eq(0)).not.toHaveClass('sorting-asc');
            expect(headerEl.eq(0)).not.toHaveClass('sorting-desc');
            
            headerEl.eq(1).click();
            
            expect(headerEl.eq(1)).toHaveClass('sorting-asc');
            
        });
        
        it('does apply sort class on non excluded columns', function () {
            var headerEl;
            
            el = setUpGrid(basicGridHtml);
        
            headerEl = getHeaders(el);
            
            setGridData(dataSet1);
            
            expect(headerEl.eq(0)).not.toHaveClass("sorting-asc");
            expect(headerEl.eq(0)).not.toHaveClass('sorting-desc');
            
            headerEl.eq(0).click();
            
            expect(headerEl.eq(0)).toHaveClass('sorting-asc');
            expect(headerEl.eq(0)).not.toHaveClass('sorting-desc');
            
            headerEl.eq(0).click();
            
            expect(headerEl.eq(0)).toHaveClass('sorting-desc');
            expect(headerEl.eq(0)).not.toHaveClass('sorting-asc');

        });
        
        it('updates sort options column and descending value on column header click', function () {
            var headerEl;
            
            el = setUpGrid(basicGridHtml);
        
            headerEl = getHeaders(el);
            
            setGridData(dataSet1);
            
            headerEl.eq(0).click();
            
            $scope.$digest();
            
            expect($scope.locals.gridOptions.sortOptions.column).toBe('name');
            expect($scope.locals.gridOptions.sortOptions.descending).toBe(false);
            
            headerEl.eq(0).click();
            
            expect($scope.locals.gridOptions.sortOptions.column).toBe('name');
            expect($scope.locals.gridOptions.sortOptions.descending).toBe(true);

        });
    });
    
    describe('searching', function () {
        it('sets searchText on search', function () {
            var searchEl,
                searchIconEl;
            
            el = setUpGrid(basicGridHtml);
            
            setGridData(dataSet1);
            
            searchEl = el.find('.bb-grid-toolbar-container .bb-search-container input');
            
            searchEl.eq(0).val('John').trigger('change');
            
            searchIconEl = el.find('.bb-grid-toolbar-container .bb-search-container .search-icon');
            searchIconEl.eq(0).click();
            
            $scope.$digest();
            
            expect($scope.locals.gridOptions.searchText).toBe('John');
            
        });
        
        it('highlights searched items in rows if search text is set and data reloaded', function () {
            var rowEl,
                searchEl,
                searchIconEl,
                spanEl;
            
            $scope.$watch('locals.gridOptions.searchText', searchTextChanged);
            
            el = setUpGrid(basicGridHtml);
            
            setGridData(dataSet1);
            
            searchEl = getSearchBox(el);
            
            searchEl.eq(0).val('John').trigger('change');
            
            searchIconEl = getSearchIcon(el);
            searchIconEl.eq(0).click();
            
            $scope.$digest();
            
            $timeout.flush();

            rowEl = getGridRows(el);
            
            spanEl = rowEl.eq(0).find('span');
            expect(spanEl.eq(0)).toHaveClass('highlight');
            
        });
        
        it('can exclude columns from search', function () {
            var rowEl,
                searchEl,
                searchIconEl,
                spanEl;
            
            $scope.$watch('locals.gridOptions.searchText', searchTextChanged);
            
            locals.gridOptions.columns[0].exclude_from_search = true;
            
            el = setUpGrid(basicGridHtml);
            
            setGridData(dataSet1);
            
            searchEl = getSearchBox(el);
            searchEl.eq(0).val('John').trigger('change');
            
            searchIconEl = getSearchIcon(el);
            searchIconEl.eq(0).click();
            
            $scope.$digest();
            
            $timeout.flush();

            rowEl = getGridRows(el);
            
            spanEl = rowEl.eq(0).find('span');
            expect(spanEl.eq(0)).not.toHaveClass('highlight');
            
        });
        
        it('will clear highlight if search text is not set', function () {
            var rowEl,
                searchEl,
                searchIconEl,
                spanEl;
            
            $scope.$watch('locals.gridOptions.searchText', searchTextChanged);
            
            el = setUpGrid(basicGridHtml);
            
            setGridData(dataSet1);
            
            searchEl = getSearchBox(el);
            
            searchEl.eq(0).val('John').trigger('change');
            
            searchIconEl = getSearchIcon(el);
            searchIconEl.eq(0).click();
            
            $scope.$digest();
            
            $timeout.flush();
            
            searchEl.eq(0).val('').trigger('change');
            searchIconEl.eq(0).click();
            
            $scope.$digest();
            
            $scope.locals.gridOptions.data = [dataSet1[0], dataSet1[1]];
            $scope.$digest();
            $timeout.flush();
            
            rowEl = getGridRows(el);
            
            spanEl = rowEl.eq(0).find('span');
            expect(spanEl.eq(0)).not.toHaveClass('highlight');
            
        });
    });
    
    describe('column alignment', function () {
        it('sets the alignment of the column cells and headers based on column options', function () {
            
            var cellEl,
                headerEl,
                rowEl;
            
            locals.gridOptions.columns[0].right_align = true;
            locals.gridOptions.columns[1].center_align = true;
            
            el = setUpGrid(basicGridHtml, locals);
            
            setGridData(dataSet1);
            
            headerEl = getHeaders(el);
            
            expect(headerEl.eq(0)).toHaveClass('bb-grid-th-right');
            expect(headerEl.eq(1)).toHaveClass('bb-grid-th-center');
            expect(headerEl.eq(2)).toHaveClass('bb-grid-th-left');
            
            rowEl = getGridRows(el);
            
            cellEl = rowEl.eq(0).find('td');
            
            expect(cellEl.eq(0)).toHaveCss({"text-align": "right"});
            expect(cellEl.eq(1)).toHaveCss({"text-align": "center"});
            expect(cellEl.eq(2)).toHaveCss({"text-align": "left"});
            
        });
    });
    
    describe('add button on toolbar', function () {
        it('can be enabled', function () {
            var addButtonEl;
            
            locals.gridOptions.onAddClick = function () {
               
            };
            
            el = setUpGrid(basicGridHtml, locals);
            
            addButtonEl = getAddButton(el);
            
            expect(addButtonEl.length).toBe(1);
        });
        
        it('can call the onAddClick function when the add button is clicked', function () {
            var addButtonCalled = false,
                addButtonEl;
            
            locals.gridOptions.onAddClick = function () {
                addButtonCalled = true;
            };
            
            el = setUpGrid(basicGridHtml, locals);
            
            addButtonEl = getAddButton(el);
            
            expect(addButtonCalled).toBe(false);
            
            addButtonEl.click();
            
            expect(addButtonCalled).toBe(true);
        });
    });
    
    describe('row context menu', function () {
        it('can be created on grid rows', function () {
            var rowEl;
            
            locals.gridOptions.getContextMenuItems = getContextMenuItems;
            
            el = setUpGrid(basicGridHtml, locals);
            setGridData(dataSet1);
            
            rowEl = getGridRows(el);
            
            expect(rowEl.eq(0).find('td').eq(0)).toHaveClass('grid-dropdown-cell');
            expect(rowEl.eq(0).find('td div').eq(0)).toHaveClass('dropdown');
            expect(rowEl.eq(0).find('td div a').eq(0)).toHaveClass('dropdown-toggle');
            expect(rowEl.eq(0).find('td div ul li a').eq(0)).toHaveText('Option1');
            
            expect(rowEl.eq(1).find('td').eq(0)).toHaveClass('grid-dropdown-cell');
            expect(rowEl.eq(1).find('td div').length).toBe(0);
            
            expect(rowEl.eq(2).find('td').eq(0)).toHaveClass('grid-dropdown-cell');
            expect(rowEl.eq(2).find('td div').length).toBe(0);
            
            expect(rowEl.eq(3).find('td').eq(0)).toHaveClass('grid-dropdown-cell');
            expect(rowEl.eq(3).find('td div').eq(0)).toHaveClass('dropdown');
            expect(rowEl.eq(3).find('td div a').eq(0)).toHaveClass('dropdown-toggle');
            expect(rowEl.eq(3).find('td div ul li a').eq(0)).toHaveText('Option1');
            
        });
        
        it('can have options selected', function () {
            var rowEl,
                contextEl,
                optionEl;
            
            locals.gridOptions.getContextMenuItems = getContextMenuItems;
            
            el = setUpGrid(basicGridHtml, locals);
            setGridData(dataSet1);
            
            rowEl = getGridRows(el);
            expect(rowEl.eq(0).find('td div ul').eq(0)).toHaveCss({"display": "none"});
            
            contextEl = rowEl.eq(0).find('td div a').eq(0);
            contextEl.click();
            expect(rowEl.eq(0).find('td div ul').eq(0)).not.toHaveCss({"display": "none"});
            
            optionEl = rowEl.eq(0).find('td div ul li a').eq(0);
            expect(contextMenuItemClicked).toBe(false);
            optionEl.click();
            expect(contextMenuItemClicked).toBe(true);
        });
        
        it('cannot have its column sorted', function () {
            var headerEl;
            
            locals.gridOptions.getContextMenuItems = getContextMenuItems;
            
            el = setUpGrid(basicGridHtml, locals);
            setGridData(dataSet1);
            
            headerEl = getHeaders(el);
            
            expect(headerEl.eq(0)).not.toHaveClass('sorting-asc');
            expect(headerEl.eq(0)).not.toHaveClass('sorting-desc');
            
            headerEl.eq(0).click();
            
            expect(headerEl.eq(0)).not.toHaveClass('sorting-asc');
            expect(headerEl.eq(0)).not.toHaveClass('sorting-desc');
            
        });
        
        
    });
    
    describe('sizing and scrolling', function () {
        it('can have columns set to a width greater than the table size which will cause a horizontal scroll bar on the top and bottom', function () {
            var headerEl,
                topScrollbarEl,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
            
            locals.gridOptions.columns[0].width_all = 300;
            locals.gridOptions.columns[1].width_all = 300;
            locals.gridOptions.columns[2].width_all = 300;
            
            el = setUpGrid(gridWrapperHtml, locals);
            
            setGridData(dataSet1);
            
            headerEl = getHeaders(el);
            
            expect(headerEl[0].style.width).toBe('300px');
            
            //expect top scrollbar to have height
            topScrollbarEl = el.find('.bb-grid-container .bb-grid-toolbar-container .bb-grid-top-scrollbar');
            
            expect(topScrollbarEl[0].style.height).toBe('18px');
        });
        
        it('can have columns set to a width less than the table size which will cause no horizontal scroll bar', function () {
            var headerEl,
                topScrollbarEl,
                gridWrapperHtml = '<div style="width: 800px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
            
            locals.gridOptions.columns[0].width_all = 100;
            locals.gridOptions.columns[1].width_all = 100;
            locals.gridOptions.columns[2].width_all = 100;
            
            el = setUpGrid(gridWrapperHtml, locals);
            
            setGridData(dataSet1);
            
            headerEl = getHeaders(el);
            
            expect(headerEl[0].style.width).toBe('100px');
            
            topScrollbarEl = el.find('.bb-grid-container .bb-grid-toolbar-container .bb-grid-top-scrollbar');
            
            expect(topScrollbarEl[0].style.height).toBe('0px');
        });
        
        it('will have a top horizontal scroll bar that will sync with the bottom scroll bar', function () {
            var topScrollbarEl,
                tableWrapperEl,
                headerViewKeeperEl,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
            
            locals.gridOptions.columns[0].width_all = 300;
            locals.gridOptions.columns[1].width_all = 300;
            locals.gridOptions.columns[2].width_all = 300;
            
            spyOn(bbViewKeeperBuilder, 'create').and.returnValue(
                { 
                    destroy: function () {
                        
                    },
                    scrollToTop: function () {
                        
                    },
                    syncElPosition: function () {
                        
                    },
                    isFixed: false
                }
            );
            
            el = setUpGrid(gridWrapperHtml, locals);
            
            setGridData(dataSet1);
            
            topScrollbarEl = el.find('.bb-grid-container .bb-grid-toolbar-container .bb-grid-top-scrollbar');
            
            tableWrapperEl = el.find('.table-responsive');
            
            topScrollbarEl.scrollLeft(20);
            
            topScrollbarEl.scroll();
            
            expect(tableWrapperEl.scrollLeft()).toBe(20);
            
            tableWrapperEl.scrollLeft(10);
            
            tableWrapperEl.scroll();
            
            expect(topScrollbarEl.scrollLeft()).toBe(10);
            
            topScrollbarEl.scroll();
            
            headerViewKeeperEl = el.find('.table-responsive .ui-jqgrid-hdiv');
            headerViewKeeperEl.addClass('viewkeeper-fixed');
            topScrollbarEl.scrollLeft(5);
            topScrollbarEl.scroll();
            expect(headerViewKeeperEl.scrollLeft()).toBe(5);
            
            tableWrapperEl.scrollLeft(3);
            tableWrapperEl.scroll();
            expect(headerViewKeeperEl.scrollLeft()).toBe(3);
            
            topScrollbarEl.scrollLeft(0);
            topScrollbarEl.scroll();
            expect(headerViewKeeperEl.scrollLeft()).toBe(0);
            
            headerViewKeeperEl.removeClass('viewkeeper-fixed');
            
            tableWrapperEl.scrollLeft(5);
            tableWrapperEl.scroll();
            
            expect(headerViewKeeperEl.scrollLeft()).toBe(0);
        
        });
        
        it('will scroll properly on header viewkeeper state change when fixed', function () {
            var tableWrapperEl,
                headerViewKeeperEl,
                stateChangedCallback,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
            
            locals.gridOptions.columns[0].width_all = 300;
            locals.gridOptions.columns[1].width_all = 300;
            locals.gridOptions.columns[2].width_all = 300;
            
           
            
            spyOn(bbViewKeeperBuilder, 'create').and.callFake(
                function (callObject) {
                    if ($(callObject.el).hasClass('ui-jqgrid-hdiv')) {
                        stateChangedCallback = callObject.onStateChanged;
                    }
                    
                    return {
                        destroy: function () {
                        
                        },
                        scrollToTop: function () {
                        
                        },
                        syncElPosition: function () {
                        
                        },
                        isFixed: true
                    };
                    
                }
            );
            
            el = setUpGrid(gridWrapperHtml, locals);
            
            headerViewKeeperEl = el.find('.table-responsive .ui-jqgrid-hdiv');
            
            setGridData(dataSet1);
            
            tableWrapperEl = el.find('.table-responsive');
            
            
            headerViewKeeperEl.addClass('viewkeeper-fixed');
            
            tableWrapperEl.scrollLeft(5);
            
            stateChangedCallback();
            
            expect(headerViewKeeperEl.scrollLeft()).toBe(tableWrapperEl.scrollLeft());
            
            
        });
        
        it('will scroll properly on header viewkeeper state change when not fixed', function () {
            var tableWrapperEl,
                headerViewKeeperEl,
                stateChangedCallback,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
            
            locals.gridOptions.columns[0].width_all = 300;
            locals.gridOptions.columns[1].width_all = 300;
            locals.gridOptions.columns[2].width_all = 300;
            
           
            
            spyOn(bbViewKeeperBuilder, 'create').and.callFake(
                function (callObject) {
                    if ($(callObject.el).hasClass('ui-jqgrid-hdiv')) {
                        stateChangedCallback = callObject.onStateChanged;
                    }
                    
                    return {
                        destroy: function () {
                        
                        },
                        scrollToTop: function () {
                        
                        },
                        syncElPosition: function () {
                        
                        },
                        isFixed: false
                    };
                    
                }
            );
            
            el = setUpGrid(gridWrapperHtml, locals);
            
            headerViewKeeperEl = el.find('.table-responsive .ui-jqgrid-hdiv');
            
            setGridData(dataSet1);
            
            tableWrapperEl = el.find('.table-responsive');
            
            tableWrapperEl.scrollLeft(20);
            
            stateChangedCallback();
            
            expect(headerViewKeeperEl.scrollLeft()).toBe(0);
            
            
        });
        
        it('will set the grid width to the new header width on vanilla resize', function () {
            var tableEl,
                headerEl,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
            
            locals.gridOptions.columns[0].width_all = 300;
            locals.gridOptions.columns[1].width_all = 300;
            locals.gridOptions.columns[2].width_all = 300;
            
            el = setUpGrid(gridWrapperHtml, locals);
            
            setGridData(dataSet1);
            
            tableEl = el.find('.table-responsive .bb-grid-table');

            headerEl = getHeaders(el);
            
            spyOn($.fn, 'setGridWidth');
        
            tableEl[0].p.resizeStart({}, 0);
            tableEl[0].p.resizeStop(700, 0);
            expect($.fn.setGridWidth).toHaveBeenCalledWith(1300, false);
        
        });
        
        it('will make the extended column smaller by resize amount when that is smaller than amount column was originally extended', function () {
            var tableEl,
                headerEl,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
            
            locals.gridOptions.columns[0].width_all = 100;
            locals.gridOptions.columns[1].width_all = 100;
            locals.gridOptions.columns[2].width_all = 100;
            
            el = setUpGrid(gridWrapperHtml, locals);
            
            setGridData(dataSet1);
            
            headerEl = getHeaders(el);
            
            expect(headerEl[2].style.width).toBe('400px');

            tableEl = el.find('.table-responsive .bb-grid-table');
            
            spyOn($.fn, 'setGridWidth');
            spyOn($.fn, 'setColProp');
        
            tableEl[0].p.resizeStart({}, 0);
            tableEl[0].p.resizeStop(200, 0);
            expect($.fn.setColProp).toHaveBeenCalledWith(locals.gridOptions.columns[2].name, {widthOrg: 300});
            expect($.fn.setGridWidth).toHaveBeenCalledWith(600, true);
            
        });
        
        it('will return extended column to original size and grow table when the resize amount is greater than amount column was originally extended', function () {
            var tableEl,
                headerEl,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
            
            locals.gridOptions.columns[0].width_all = 100;
            locals.gridOptions.columns[1].width_all = 100;
            locals.gridOptions.columns[2].width_all = 100;
            
            el = setUpGrid(gridWrapperHtml, locals);
            
            setGridData(dataSet1);
            
            tableEl = el.find('.table-responsive .bb-grid-table');
            
            headerEl = getHeaders(el);
            
            expect(headerEl[2].style.width).toBe('400px');
            
            spyOn($.fn, 'setGridWidth');
            spyOn($.fn, 'setColProp');
            
            tableEl[0].p.resizeStart({}, 0);
        
            tableEl[0].p.resizeStop(450, 0);
            
            expect($.fn.setColProp).toHaveBeenCalledWith(locals.gridOptions.columns[2].name, {widthOrg: 100});
            expect($.fn.setGridWidth).toHaveBeenCalledWith(650, true);
        });
        
        it('will set width normally when there is an extended column and the grid size is being decreased', function () {
            var tableEl,
                headerEl,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
            
            locals.gridOptions.columns[0].width_all = 100;
            locals.gridOptions.columns[1].width_all = 100;
            locals.gridOptions.columns[2].width_all = 100;
            
            el = setUpGrid(gridWrapperHtml, locals);
            
            setGridData(dataSet1);
            
            tableEl = el.find('.table-responsive .bb-grid-table');
            
            headerEl = getHeaders(el);
            
            expect(headerEl[2].style.width).toBe('400px');
            
            spyOn($.fn, 'setGridWidth');
            spyOn($.fn, 'setColProp');
            
            tableEl[0].p.resizeStart({}, 0);
            tableEl[0].p.resizeStop(50, 0);
            
            expect($.fn.setColProp).not.toHaveBeenCalled();
            expect($.fn.setGridWidth).toHaveBeenCalledWith(550, false);
            
        });
    });
   
    describe('media breakpoint column resizing', function () {
        it('can have xs, sm, md, and lg breakpoints set', function () {
            var callback,
                headerEl,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
            
            locals.gridOptions.columns[0].width_xs = 100;
            locals.gridOptions.columns[0].width_sm = 200;
            locals.gridOptions.columns[0].width_md = 300;
            locals.gridOptions.columns[0].width_lg = 400;
            
            spyOn(bbMediaBreakpoints, 'register').and.callFake(function (gridCallback) {
                callback = gridCallback;
            });
            
            el = setUpGrid(gridWrapperHtml, locals);
            
            setGridData(dataSet1);
            
            //no breakpoints clled set defaults to 150px
            headerEl = getHeaders(el); 
            expect(headerEl[0].style.width).toBe('150px');
            
            callback({ xs: true });  
            headerEl = getHeaders(el); 
            expect(headerEl[0].style.width).toBe('100px');
            
            callback({ sm: true });
            headerEl = getHeaders(el);
            expect(headerEl[0].style.width).toBe('200px');
                   
            callback({ md: true });
            headerEl = getHeaders(el);
            expect(headerEl[0].style.width).toBe('300px');
            
            callback({ lg: true });
            headerEl = getHeaders(el);
            expect(headerEl[0].style.width).toBe('400px');
            
            callback({});
            headerEl = getHeaders(el);
            expect(headerEl[0].style.width).toBe('150px');
        }); 
        
        it('can have a width_all that will be the width for unspecified breakpoints', function () {
            var callback,
                headerEl,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
            
            locals.gridOptions.columns[0].width_xs = 100;
            locals.gridOptions.columns[0].width_all = 200;
            
            spyOn(bbMediaBreakpoints, 'register').and.callFake(function (gridCallback) {
                callback = gridCallback;
            });
            
            el = setUpGrid(gridWrapperHtml, locals);
            
            setGridData(dataSet1);
            
            callback({ xs: true });  
            headerEl = getHeaders(el); 
            expect(headerEl[0].style.width).toBe('100px');
            
            callback({ sm: true });
            headerEl = getHeaders(el);
            expect(headerEl[0].style.width).toBe('200px');
                   
            callback({ md: true });
            headerEl = getHeaders(el);
            expect(headerEl[0].style.width).toBe('200px');
            
            callback({ lg: true });
            headerEl = getHeaders(el);
            expect(headerEl[0].style.width).toBe('200px');
            
            callback({});
            headerEl = getHeaders(el);
            expect(headerEl[0].style.width).toBe('200px');
        });
        
        it('will have columns defualt to 150px if no breakpoint widths and no width_all is set', function () {
            var callback,
                headerEl,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
            
            locals.gridOptions.columns[0].width_xs = 100;
            
            spyOn(bbMediaBreakpoints, 'register').and.callFake(function (gridCallback) {
                callback = gridCallback;
            });
            
            el = setUpGrid(gridWrapperHtml, locals);
            
            setGridData(dataSet1);
            
            callback({ xs: true });  
            headerEl = getHeaders(el); 
            expect(headerEl[0].style.width).toBe('100px');
            
            callback({ sm: true });
            headerEl = getHeaders(el);
            expect(headerEl[0].style.width).toBe('150px');
                   
            callback({ md: true });
            headerEl = getHeaders(el);
            expect(headerEl[0].style.width).toBe('150px');
            
            callback({ lg: true });
            headerEl = getHeaders(el);
            expect(headerEl[0].style.width).toBe('150px');
            
            callback({});
            headerEl = getHeaders(el);
            expect(headerEl[0].style.width).toBe('150px');
        });
    });
    
    describe('column reordering', function () {
        it('changes the order of selected columns without initializing grids', function () {
            var tableEl,
                headerEl,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
            
            el = setUpGrid(gridWrapperHtml);
            
            setGridData(dataSet1);
            
            tableEl = el.find('.table-responsive .bb-grid-table');
            tableEl[0].p.sortable.update([1, 0, 2]);
           
            $scope.locals.gridOptions.columns[0].width_all = 1000;
            
            expect($scope.locals.gridOptions.selectedColumnIds[0]).toBe(2);
            expect($scope.locals.gridOptions.selectedColumnIds[1]).toBe(1);
            expect($scope.locals.gridOptions.selectedColumnIds[2]).toBe(3);
            
            headerEl = getHeaders(el);
            
            expect(headerEl[0].style.width).toBe('150px');
        }); 
        
        it('will have the correct offset when there is a context menu', function () {
            var tableEl;
            
            locals.gridOptions.getContextMenuItems = getContextMenuItems;
            
            el = setUpGrid(basicGridHtml, locals);
            
            setGridData(dataSet1);
            
            tableEl = el.find('.table-responsive .bb-grid-table');
            tableEl[0].p.sortable.update([0, 2, 1, 3]);
            
            expect($scope.locals.gridOptions.selectedColumnIds[0]).toBe(2);
            expect($scope.locals.gridOptions.selectedColumnIds[1]).toBe(1);
            expect($scope.locals.gridOptions.selectedColumnIds[2]).toBe(3);
        });
    });
    
    describe('resizing tableWrapper', function () {
        
        it('does nothing if the tableWrapper width is unchanged on window resize', function () {
            var tableWrapperEl,
                windowEl = $($window);
            
            el = setUpGrid(basicGridHtml);
            
            tableWrapperEl = getTableWrapperEl(el);
            
            spyOn($.fn, 'setGridWidth');
            windowEl.trigger('resize');
            
            expect($.fn.setGridWidth).not.toHaveBeenCalled();
            
        });
        
        it('gets the new table width from the totalcolumn width when no extended column resize on window resize', function () {
            var tableWrapperEl,
                topScrollbarEl,
                topScrollbarDivEl,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>',
                windowEl = $($window);
            
            locals.gridOptions.columns[0].width_all = 600;
            locals.gridOptions.columns[1].width_all = 5;
            locals.gridOptions.columns[2].width_all = 5;
            
            el = setUpGrid(gridWrapperHtml, locals);
            
            spyOn($.fn, 'setGridWidth');
            
            tableWrapperEl = getTableWrapperEl(el);

            tableWrapperEl.width(599);
            
            windowEl.trigger('resize');
            
            expect($.fn.setGridWidth).toHaveBeenCalledWith(610);
            
            topScrollbarEl = el.find('.bb-grid-container .grid-toolbar-container .bb-grid-top-scrollbar');
            topScrollbarDivEl = el.find('.bb-grid-container .grid-toolbar-container .bb-grid-top-scrollbar div');
           
            
            expect(topScrollbarDivEl[0].style.width).toBe('610px');
            expect(topScrollbarDivEl[0].style.height).toBe('18px');

            expect(topScrollbarEl[0].style.width).toBe('599px');
            expect(topScrollbarEl[0].style.height).toBe('18px');
        });
        
        it('takes away from the extended column width when there is an extended column and the tableWrapper resize is less than the extended portion of the column on window resize', function () {
            var tableWrapperEl,
                topScrollbarEl,
                topScrollbarDivEl,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>',
                windowEl = $($window);
            
            locals.gridOptions.columns[0].width_all = 5;
            locals.gridOptions.columns[1].width_all = 5;
            locals.gridOptions.columns[2].width_all = 5;
            el = setUpGrid(gridWrapperHtml, locals);
            
            spyOn($.fn, 'setGridWidth');
            spyOn($.fn, 'setColProp');
            
            tableWrapperEl = getTableWrapperEl(el);
            
            tableWrapperEl.width(299);     
            
            windowEl.trigger('resize');
            
            expect($.fn.setColProp).toHaveBeenCalledWith(locals.gridOptions.columns[2].name, {widthOrg: 289});
            
            expect($.fn.setGridWidth).toHaveBeenCalledWith(299, true);
            
            topScrollbarEl = el.find('.bb-grid-container .grid-toolbar-container .bb-grid-top-scrollbar');
            topScrollbarDivEl = el.find('.bb-grid-container .grid-toolbar-container .bb-grid-top-scrollbar div');   
            expect(topScrollbarDivEl[0].style.height).toBe('0px');
            expect(topScrollbarEl[0].style.height).toBe('0px');
        });
        
        it('returns the column its original size and decreases the table size when the window resize is greater than the extended portion of the column on window resize', function () {
            var tableWrapperEl,
                topScrollbarEl,
                topScrollbarDivEl,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>',
                windowEl = $($window);
        
            locals.gridOptions.columns[0].width_all = 5;
            locals.gridOptions.columns[1].width_all = 5;
            locals.gridOptions.columns[2].width_all = 589;
            
            el = setUpGrid(gridWrapperHtml, locals);
            
            spyOn($.fn, 'setGridWidth').and.callThrough();
            spyOn($.fn, 'setColProp').and.callThrough();
            tableWrapperEl = getTableWrapperEl(el);
            
            tableWrapperEl.width(589);
            windowEl.trigger('resize');
            expect($.fn.setColProp).toHaveBeenCalledWith(
                locals.gridOptions.columns[2].name, 
                {widthOrg: 589});
            
        
            expect($.fn.setGridWidth).toHaveBeenCalledWith(599, true);
            
            topScrollbarEl = el.find('.bb-grid-container .grid-toolbar-container .bb-grid-top-scrollbar');
            topScrollbarDivEl = el.find('.bb-grid-container .grid-toolbar-container .bb-grid-top-scrollbar div');
            
            expect(topScrollbarDivEl[0].style.height).toBe('18px');
            expect(topScrollbarEl[0].style.height).toBe('18px');
        });
        
        it('takes away from the extended column width when there is an extended column and the tableWrapper resize is less than the extended portion of the column when the rows are changed', function () {
            var tableWrapperEl,
                topScrollbarEl,
                topScrollbarDivEl,
                gridWrapperHtml = '<div style="width: 600px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
            
            locals.gridOptions.columns[0].width_all = 5;
            locals.gridOptions.columns[1].width_all = 5;
            locals.gridOptions.columns[2].width_all = 5;
            el = setUpGrid(gridWrapperHtml, locals);
            
            spyOn($.fn, 'setGridWidth');
            spyOn($.fn, 'setColProp');
            
            tableWrapperEl = getTableWrapperEl(el);
            
            tableWrapperEl.width(299);     
            
            setGridData(dataSet1);
            
            expect($.fn.setColProp).toHaveBeenCalledWith(locals.gridOptions.columns[2].name, {widthOrg: 289});
            
            expect($.fn.setGridWidth).toHaveBeenCalledWith(299, true);
            
            topScrollbarEl = el.find('.bb-grid-container .grid-toolbar-container .bb-grid-top-scrollbar');
            topScrollbarDivEl = el.find('.bb-grid-container .grid-toolbar-container .bb-grid-top-scrollbar div');   
            expect(topScrollbarDivEl[0].style.height).toBe('0px');
            expect(topScrollbarEl[0].style.height).toBe('0px');
        });
        
        it('returns the column its original size and decreases the table size when the window resize is greater than the extended portion of the column when the rows are changed', function () {
            var tableWrapperEl,
                topScrollbarEl,
                topScrollbarDivEl,
                gridWrapperHtml = '<div style="width: 300px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>';
        
            locals.gridOptions.columns[0].width_all = 5;
            locals.gridOptions.columns[1].width_all = 5;
            locals.gridOptions.columns[2].width_all = 289;
            
            el = setUpGrid(gridWrapperHtml, locals);
            
            spyOn($.fn, 'setGridWidth').and.callThrough();
            spyOn($.fn, 'setColProp').and.callThrough();
            tableWrapperEl = getTableWrapperEl(el);
            
            tableWrapperEl.width(289);
            setGridData(dataSet1);
            expect($.fn.setColProp).toHaveBeenCalledWith(
                locals.gridOptions.columns[2].name, 
                {widthOrg: 289});
            
            expect($.fn.setGridWidth).toHaveBeenCalledWith(299, true);
            
            
            topScrollbarEl = el.find('.bb-grid-container .grid-toolbar-container .bb-grid-top-scrollbar');
            topScrollbarDivEl = el.find('.bb-grid-container .grid-toolbar-container .bb-grid-top-scrollbar div');
            
            expect(topScrollbarDivEl[0].style.height).toBe('18px');
            expect(topScrollbarEl[0].style.height).toBe('18px');
        });
    });
    
    describe('multiselect', function () {
        it('should center the header checkbox', function () {
            var el,
                th;
            
            locals.gridOptions.multiselect = true;
            
            el = setUpGrid('<div style="width: 300px;"><bb-grid bb-grid-options="locals.gridOptions"></bb-grid></div>', locals);
            
            th = el.find('th:first');
            
            // This will validate our assumption that the first TH element contains a checkbox when multiselect is enabled.
            expect(th.find('input[type="checkbox"]')).toExist();
                   
            expect(th).toHaveCss({
                textAlign: 'center'
            });
        });
    });
});