/*jslint plusplus: true */
/*global angular, jQuery */

/** @module Grids 
 
 @description ### Additional dependencies ###
   - [jqGrid](http://www.trirand.com/blog/) (4.6.0 or higher)
  ---
  
  The Grid directive allows you to build a full-featured grid with a search box, column picker and filter form.
  
### Grid Settings ###
- `bb-grid-filters` A directive you can use inside the bb-grid directive to create a filter flyout menu.
  - `bb-options` An options object for bb-grid-filters that contains the following: 
      - `applyFilters` A function that is called when you click the apply filters button. You can pass updated filters to `bb-grid` by setting `args.filters`.
      - `clearFilters` A function that is called when you click the clear filters button. You can pass updated filters to `bb-grid` by setting `args.filters`.
  - `bb-grid-filters-group` A directive you can use inside of `bb-grid-filters` that creates labels (with the `bb-grid-filters-group-label` option) and collapsible areas.
- `bb-grid-filters-summary` A directive you can use inside the bb-grid directive to create a summary toolbar for your applied filters. 
  - `bb-options` An options object for `bb-grid-filters-summary` that contains the following:
      - `clearFilters` A function that is called when you click the clear filters (x) icon. You can pass updated filters to `bb-grid` by setting `args.filters`.

- `bb-grid-options` An object with the following properties:
  - `columns` An array of available columns.  Each column can have these properties:
        - `caption` The text to display in the column header and column chooser.
        - `category` A category for the column, can be used to filter in the column chooser.
        - `center_align` True if the column header and contents should be center aligned.
        - `description` A description for the column, seen in the column chooser.
        - `exclude_from_search` If true, then the column does not highlight text on search.
        - `id` A unique identifier for the column.  The ID is referenced by the option object's `selectedColumnIds` property.
        - `jsonmap` The name of the property that maps to the column's data.
        - `name` The name of the column.
        - `right_align` True if the column header and contents should be right aligned.
        - `width_all` The default width (in pixels) for a column if no breakpoint specific column is specified (`width_xs`, `width_sm`, `width_md`, `width_lg`). If no value is specified, columns will default to 150px, and if the columns do not take up the available room in the grid, the last column will be extended.
        - `width_xs` The width of the column for screen sizes less than 768px. 
        - `width_sm` The width of the column for screen sizes from 768px to 991px.
        - `width_md` The width of the column for screen sizes from 992px to 1199px.
        - `width_lg` The width of the column for screen sizes greater than 1199px.
  - `data` An array of objects representing the rows in the grid.  Each row should have properties that correspond to the `columns` `jsonmap` properties.
  - `getContextMenuItems` If a function is specified, then the grid rows will attempt to create a bootstrap dropdown based on the return value of the function. The return value should be an array of objects that represent the items in a dropdown. The objects should contain the following properties: 
      - `id` A unique string identifier for the option.
      - `title` The title shown for the dropdown option.
      - `cmd` A function that will be called when the dropdown option is clicked. It should return false if you wish to close the dropdown after the function is called.
  - `hideColPicker` If true, hides the grid column picker in the toolbar.
  - `hideFilters` If true, hides the filters button in the toolbar.
  - `multiselect` If true, adds a multiselect checkbox column to the listbuilder.
  - `onAddClick` If a function is specified, then an add button will appear in the grid toolbar that will call the `onAddClick` function when clicked.
  - `searchText` The text entered in the grid search box, set by bbGrid.
  - `selectedColumnIds` An array of unique identifiers indicating the visible columns in the order in which they should be displayed.
  - `sortOptions` Options around column sorting:
      - `excludedColumns` An array of column names that should be excluded.
      - `column` The name of the column that the data should be sorted by, set by bbGrid.
      - `descending` Set to true by bbGrid if the sort should be in descending order.
- `bb-grid-pagination` An object set when you intend to use pagination instead of infinite scrolling with your grid. It has the following properties:
  - `itemsPerPage` The number of rows you wish to show in the grid per page, defaults to 5.
  - `maxPages` The maximum number of pages to show in the pagination bar, defualts to 5.
  - `recordCount` The total number of records available through pagination.
- `bb-multiselect-actions` An array of actions that can be shown in the multiselect action bar. Each action can have the following: 
  - `actionCallback` A function that will be called when the action is clicked.
  - `automationId` An identifier that will be placed in the `data-bbauto` attribute for automation purposes.
  - `isPrimary` If true, this action will have the primary button color.
  - `selections` The selected row objects from the list builder that are associated with this action, this can be updated through the `bb-selections-updated` function. 
  - `title` The text that will appear on the button for the action.
- `bb-selections-updated` A function which will be called when multiselect selections are updated. The selections are passed to the function as an argument and you can update your multiselect actions accordingly.

### Grid Events ###

  - `includedColumnsChanged` Fires when the user has changed the grid columns.  If you plan to handle reloading the grid after this change (e.g. you need
to reload data from the server as a result of the column change), set the event handler's `data` parameter's `willResetData` property to `true` to avoid 
reloading the grid with the current data after the event has fired.
  - `loadMoreRows` Fires when a page changes (when using pagination) or when the 'See more' button is clicked. When raised from a page change, a data object with top and skip parameters is included so that the calling controller can retrieve the proper paged data.

*/
(function ($) {
    'use strict';

    var DEFAULT_ITEMS_PER_PAGE = 5,
        DEFAULT_MAX_PAGES = 5,
        DEFAULT_COLUMN_SIZE = 150,
        MULTISELECT_COLUMN_SIZE = 27,
        DROPDOWN_TOGGLE_COLUMN_SIZE = 40,
        DROPDOWN_TOGGLE_COLUMN_NAME = 'dropdownToggle',
        MULTISELECT_COLUMN_NAME = 'cb',
        TOP_SCROLLBAR_HEIGHT = 18;

    angular.module('sky.grids', ['sky.modal', 'sky.mediabreakpoints', 'sky.viewkeeper', 'sky.highlight', 'sky.resources', 'sky.data', 'sky.grids.columnpicker', 'sky.grids.filters'])
        .directive('bbGrid', ['bbModal', '$window', '$compile', '$templateCache', 'bbMediaBreakpoints', 'bbViewKeeperBuilder', 'bbHighlight', 'bbResources', 'bbData', '$controller', '$timeout',

            function (bbModal, $window, $compile, $templateCache, bbMediaBreakpoints, bbViewKeeperBuilder, bbHighlight, bbResources, bbData, $controller, $timeout) {
                return {
                    replace: true,
                    transclude: true,
                    restrict: 'E',
                    scope: {
                        options: '=bbGridOptions',
                        multiselectActions: '=bbMultiselectActions',
                        updateMultiselectActions: '&bbSelectionsUpdated',
                        paginationOptions: '=bbGridPagination'
                    },
                    controller: ['$scope', function ($scope) {
                        var locals,
                            self = this;

                        self.setFilters = function (filters) {
                            $scope.options.filters = filters;
                        };

                        self.syncViewKeepers = function () {
                            if ($scope.syncViewKeepers) {
                                $scope.syncViewKeepers();
                            }
                        };

                        self.syncActionBarViewKeeper = function () {
                            if (angular.isFunction($scope.syncActionBarViewKeeper)) {
                                $scope.syncActionBarViewKeeper();
                            }
                        };

                        self.resetMultiselect = function () {
                            if (angular.isFunction(locals.resetMultiselect)) {
                                locals.resetMultiselect();
                            }
                        };

                        self.scope = $scope;
                        
                        $scope.resources = bbResources;

                        locals = $scope.locals = {
                            gridId: 'bbgrid-table-' + $scope.$id,
                            hasAdd: false,
                            hasColPicker: true,
                            hasFilters: true,
                            loadMoreStarted: false,
                            onAddClick: function () {
                                /*istanbul ignore else: sanity check */
                                if (locals.hasAdd && $scope.options && $scope.options.onAddClick) {
                                    $scope.options.onAddClick();
                                }
                            },
                            toggleFilterMenu: function () {
                                if (self.toggleFilterMenu) {
                                    self.toggleFilterMenu();
                                }
                            },

                            loadMore: function () {
                                $scope.$emit('loadMoreRows');
                                locals.loadMoreStarted = true;
                            },
                            selectedRows: []
                        };

                        $scope.$watch('options.viewKeeperOffsetElId', function (newValue, oldValue) {
                            if (newValue !== oldValue) {
                                if (self.viewKeeperChangedHandler) {
                                    self.viewKeeperChangedHandler(newValue);
                                }
                            }
                        });
                    }],
                    link: function ($scope, element) {
                        var breakpoints,
                            cellScopes,
                            columnCount = 0,
                            columnModel,
                            compiledTemplates = [],
                            contextMenuItems = {},
                            currentExtendedColumnWidth,
                            extendedColumnIndex,
                            extendedColumnName,
                            fullGrid,
                            getContextMenuItems,
                            hasTemplatedColumns,
                            header,
                            id,
                            locals = $scope.locals,
                            needsExtendedColumnResize,
                            originalExtendedColumnWidth,
                            seemore_template = 'sky/templates/grids/seemore.html',
                            reorderingColumns,
                            tableBody,
                            tableEl = element.find('table'),
                            tableDomEl = tableEl[0],
                            tableWrapper = element.find('.table-responsive'),
                            tableWrapperWidth,
                            toolbarContainer = element.find('.bb-grid-toolbar-container'),
                            toolbarContainerId,
                            topScrollbar = element.find('.bb-grid-top-scrollbar'),
                            topScrollbarDiv = topScrollbar.find('>div'),
                            totalColumnWidth,
                            verticalOffSetElId,
                            vkActionBarAndBackToTop,
                            vkToolbars,
                            vkHeader,
                            windowEl = $($window),
                            windowEventId,
                            resizeStartColWidth;
                        
                        function updateGridLoadedTimestampAndRowCount(count) {
                            $scope.locals.timestamp = new Date().getTime();
                            $scope.locals.rowcount = count;
                        }

                        function mediaBreakpointHandler(newBreakpoints) {
                            breakpoints = newBreakpoints;
                            if ($scope.options && $scope.options.selectedColumnIds && $scope.options.selectedColumnIds.length > 0 && tableEl[0].grid) {
                                reinitializeGrid();
                            }
                        }

                        function buildColumnClasses(column) {
                            var classes = '';

                            //if this column does not allow search then add the appropriate class. This is used when highlighting search results
                            if (column.exclude_from_search) {
                                classes += "bb-grid-no-search grid-no-search ";
                            }

                            return classes;
                        }

                        function getEmptyString() {
                            return '';
                        }

                        function buildCellAttribute(rowId, cellValue, rawObject, column) {
                            /*jslint unparam: true*/
                            return "data-grid-field='" + column.name + "'" + "data-bbauto-field='" + column.name + "'" + "data-bbauto-index='" + (rowId - 1) + "'";
                        }

                        function buildMenuId(rowid) {
                            return id + '-dropdownMenu-' + rowid;
                        }

                        function buildActionId(menuid, action) {
                            return menuid + "-" + action.id;
                        }

                        function toggleButtonFormatter(cellvalue, options, rowObject) {
                            /*jslint unparam: true */
                            var menuid,
                                i,
                                item,
                                items,
                                rowid,
                                template;
                            /*istanbul ignore else: sanity check */
                            if (angular.isFunction(getContextMenuItems)) {
                                rowid = options.rowId;
                                menuid = buildMenuId(rowid);
                                items = getContextMenuItems(rowid, rowObject);
                                //cache for later
                                contextMenuItems[rowid] = items;

                                if (items && items.length) {
                                    template =
                                        '<div data-bbauto-field="ContextMenuActions" class="dropdown" id="' + menuid + '">' +
                                        '  <a data-bbauto-field="ContextMenuAnchor" role="button" class="dropdown-toggle sky-icon sky-icon-2x sky-icon-multi-action" data-toggle="dropdown" href="javascript:void(0)"></a>' +
                                        '  <ul class="dropdown-menu" role="menu" aria-labelledby="' + menuid + '">';

                                    for (i = 0; i < items.length; i++) {
                                        item = items[i];
                                        template += '<li role="presentation"><a id="' + buildActionId(menuid, item) + '" role="menuitem" href="javascript:void(0)">' + item.title + '</a></li>';
                                    }

                                    template += '</ul></div>';

                                    return template;
                                }
                            }
                            return '';
                        }

                        function getColumnById(columns, id) {
                            var column,
                                i;

                            for (i = 0; i < columns.length; i++) {
                                column = columns[i];
                                if (column.id === id) {
                                    return column;
                                }
                            }
                        }

                        function resetExtendedColumn() {
                            //wipe out extended column stuff
                            extendedColumnName = null;
                            currentExtendedColumnWidth = null;
                            originalExtendedColumnWidth = null;
                            extendedColumnIndex = null;
                            needsExtendedColumnResize = false;
                        }
                        
                        function getBreakpointsWidth(column) {
                            var columnDefault;
                            
                            if (column.width_all > 0) {
                                columnDefault = column.width_all;
                            } else {
                                columnDefault = DEFAULT_COLUMN_SIZE;
                            }
                            
                            if (breakpoints) {
                                if (breakpoints.xs) {
                                    return column.width_xs > 0 ? column.width_xs : columnDefault;
                                } else if (breakpoints.sm) {
                                    return column.width_sm > 0 ? column.width_sm : columnDefault;
                                } else if (breakpoints.md) {
                                    return column.width_md > 0 ? column.width_md : columnDefault;
                                } else if (breakpoints.lg) {
                                    return column.width_lg > 0 ? column.width_lg : columnDefault;
                                }
                            }
                            return columnDefault;
                        }
                        
                        function buildColumnModel(columns, selectedColumnIds) {
                            var colModel = [],
                                column,
                                colWidth,
                                index,
                                gridColumn;

                            if (getContextMenuItems) {
                                colModel.push({
                                    classes: 'grid-dropdown-cell',
                                    fixed: true,
                                    sortable: false,
                                    name: DROPDOWN_TOGGLE_COLUMN_NAME,
                                    label: ' ',
                                    width: DROPDOWN_TOGGLE_COLUMN_SIZE,
                                    title: false,
                                    hidedlg: true,
                                    resizable: false,
                                    search: false,
                                    formatter: toggleButtonFormatter
                                });
                                
                                totalColumnWidth = totalColumnWidth + DROPDOWN_TOGGLE_COLUMN_SIZE;
                            }
                               
                            hasTemplatedColumns = false;
                            resetExtendedColumn();
                            
                            for (index = 0; index < selectedColumnIds.length; index++) {
                                column = getColumnById(columns, selectedColumnIds[index]);

                                if (column) {
                                    
                                    colWidth = getBreakpointsWidth(column);
                                        
                                    //If this is the last selected column and the sum of the columns is shorter than the area available, extend the last column
                                    if ((index === (selectedColumnIds.length - 1)) && (tableWrapper.width() > (colWidth + totalColumnWidth))) {
                                        needsExtendedColumnResize = true;
                                        originalExtendedColumnWidth = colWidth;
                                        extendedColumnName = column.name;
                                        extendedColumnIndex = index;
                                        
                                        //If multiselect and/or contextmenu exist, then the last column index is shifted.
                                        if (locals.multiselect) {
                                            extendedColumnIndex =  extendedColumnIndex + 1;
                                        }
                                        if (getContextMenuItems) {
                                            extendedColumnIndex = extendedColumnIndex + 1;
                                        }
                                        
                                        colWidth = tableWrapper.width() - totalColumnWidth;
                                        currentExtendedColumnWidth = colWidth;
                                    }
                                    
                                    gridColumn = {
                                        index: column.id.toString(),
                                        sortable: false,
                                        id: column.id,
                                        name: column.name,
                                        label: column.caption,
                                        align: (column.right_align ? 'right' : (column.center_align ? 'center' : 'left')),
                                        classes: buildColumnClasses(column),
                                        cellattr: buildCellAttribute,
                                        controller: column.controller,
                                        template_url: column.template_url,
                                        jsonmap: column.jsonmap,
                                        allow_see_more: column.allow_see_more,
                                        width: colWidth
                                    };

                                    if (column.allow_see_more && !gridColumn.template_url) {
                                        gridColumn.template_url = seemore_template;

                                        if (!compiledTemplates[seemore_template]) {
                                            compiledTemplates[seemore_template] = $compile($templateCache.get(seemore_template));
                                        }
                                    }

                                    if (gridColumn.template_url) {
                                        //Setup a formatter to return an empty string until the
                                        //angular template is processed for the cell.
                                        gridColumn.formatter = getEmptyString;
                                        hasTemplatedColumns = true;
                                    } else if (column.colFormatter) {
                                        gridColumn.formatter = column.colFormatter;
                                    }

                                    colModel.push(gridColumn);
                                
                                    totalColumnWidth = totalColumnWidth + colWidth;
                                }
                            }

                            return colModel;
                        }

                        function getColumnElementIdFromName(columnName) {
                            return locals.gridId + "_" + columnName;
                        }

                        function getColumnNameFromElementId(columnName) {
                            if (columnName) {
                                return columnName.replace(locals.gridId + "_", "");
                            }
                        }

                        function getDesiredGridWidth() {
                            var width = tableWrapper.width();

                            if (width < totalColumnWidth) {
                                width = totalColumnWidth;
                                tableWrapper.addClass('bb-grid-table-wrapper-overflow');
                            } else {
                                tableWrapper.addClass('bb-grid-table-wrapper');
                            }

                            return width;
                        }
                        
                        function resetTopScrollbar() {
                            topScrollbarDiv.width(totalColumnWidth);
                            topScrollbarDiv.height(totalColumnWidth > (topScrollbar.width()) ? TOP_SCROLLBAR_HEIGHT : 0);
                            topScrollbar.height(totalColumnWidth > (topScrollbar.width()) ? TOP_SCROLLBAR_HEIGHT : 0);
                        }

                        function resizeExtendedColumn(changedWidth, isIncreasing) {
                            var extendedShrinkWidth = currentExtendedColumnWidth - originalExtendedColumnWidth;
                            
                            //If the extended portion of the last column is less than the amount resized
                            if (extendedShrinkWidth <= changedWidth) {
                                //decrease extended column to original size
                                tableEl.setColProp(extendedColumnName, {widthOrg: originalExtendedColumnWidth});
                                       
                                //increase grid width by remainder and wipe out all the extended stuff
                                if (isIncreasing) {
                                    totalColumnWidth = totalColumnWidth + (changedWidth - extendedShrinkWidth);
                                } else {
                                    totalColumnWidth = totalColumnWidth - extendedShrinkWidth;
                                }
                                
                                tableWrapper.addClass('bb-grid-table-wrapper-overflow');
                                resetExtendedColumn();
                            } else {
                                //decrease extended column width by changedWidth
                                currentExtendedColumnWidth = currentExtendedColumnWidth - changedWidth;
                                tableEl.setColProp(extendedColumnName, {widthOrg: currentExtendedColumnWidth});
                                
                                if (!isIncreasing) {
                                    totalColumnWidth = totalColumnWidth - changedWidth;
                                }
                            } 
                            tableEl.setGridWidth(totalColumnWidth, true);
                            resetTopScrollbar();
                        }
                        
                        function resetGridWidth(oldWidth, newWidth) {
                            var changedWidth,
                                width;
                            
                            topScrollbar.width(tableWrapper.width());
                            if (needsExtendedColumnResize && newWidth < oldWidth) {
                                changedWidth = oldWidth - newWidth;
                                resizeExtendedColumn(changedWidth, false);
                            } else {
                                width = getDesiredGridWidth();
                                
                                /*istanbul ignore else: sanity check */
                                if (width > 0) {
                                    tableEl.setGridWidth(width);
                                    resetTopScrollbar();
                                }
                            }
                        }
                        
                        function resizeStart(event, index) {
                            var thEls;
                            
                            fullGrid.find('.ui-jqgrid-resize-mark').height(fullGrid.height());
                            thEls = element.find('.ui-jqgrid .ui-jqgrid-hdiv .ui-jqgrid-htable th');
                            resizeStartColWidth = parseInt(thEls[index].style.width);

                        }
                        
                        function resizeStop(newWidth, index) {
                            var changedWidth;
                            
                            tableWrapper.addClass('bb-grid-table-wrapper-overflow');
                            
                            changedWidth = newWidth - resizeStartColWidth;
                            
                            //If your last column was extended and this is the first resize
                            if (needsExtendedColumnResize) {
                                //If the column you're resizing is not the extended column and you're increasing the size
                                if (index !== extendedColumnIndex && changedWidth > 0) {             
                                    
                                    resizeExtendedColumn(changedWidth, true);
                                    
                                    resetExtendedColumn();
                                    return;
                                }
                                resetExtendedColumn();
                            }
                                
                            totalColumnWidth = totalColumnWidth + changedWidth;
                            tableEl.setGridWidth(totalColumnWidth, false);
                            resetTopScrollbar();
                            
                            return;               
                        }

                        function setSortStyles() {
                            var className,
                                headerElId,
                                sortOptions;
                            /*istanbul ignore else: sanity check */
                            if (header) {
                                header.find('th').removeClass('sorting-asc').removeClass('sorting-desc');
                                /* istanbul ignore else: sanity check */
                                if ($scope.options) {
                                    sortOptions = $scope.options.sortOptions;
                                    if (sortOptions && sortOptions.column) {
                                        headerElId = getColumnElementIdFromName(sortOptions.column);

                                        if (sortOptions.descending) {
                                            className = 'sorting-desc';
                                        } else {
                                            className = 'sorting-asc';
                                        }

                                        header.find('#' + headerElId).addClass(className);
                                    }
                                }
                            }
                        }

                        function columnIsSortable(columnName) {
                            var excludedColumns,
                                sortOptions = $scope.options.sortOptions;

                            if (columnName === DROPDOWN_TOGGLE_COLUMN_NAME || columnName === MULTISELECT_COLUMN_NAME) {
                                return false;
                            }
                            
                            
                            /*istanbul ignore else: sanity check */
                            if (sortOptions) {
                                excludedColumns = sortOptions.excludedColumns;
                                if (excludedColumns) {
                                    if (excludedColumns.indexOf(columnName) > -1) {
                                        return false;
                                    }
                                }
                            }
                            return true;
                        }

                        function openColumnPicker() {
                            bbModal.open({
                                templateUrl: 'sky/templates/grids/columnpicker.html',
                                controller: 'BBGridColumnPickerController',
                                resolve: {
                                    columns: function () {
                                        return $scope.options.columns;
                                    },
                                    selectedColumnIds: function () {
                                        return $scope.options.selectedColumnIds;
                                    },
                                    columnPickerHelpKey: function () {
                                        return $scope.options.columnPickerHelpKey;
                                    }
                                }
                            }).result.then(function (selectedColumnIds) {
                                $scope.options.selectedColumnIds = selectedColumnIds;
                            });
                        }

                        function highlightSearchText() {
                            var options = $scope.options;
                            if (options && options.searchText) {
                                bbHighlight(tableEl.find("td").not('.bb-grid-no-search'), options.searchText, 'highlight');
                            } else {
                                bbHighlight.clear(tableEl);
                            }
                        }

                        function linkCellValue(scope, cell, linkFunction) {
                            linkFunction(scope, function (cloned) {
                                cell.append(cloned);
                            });
                        }

                        function arrayObjectIndexOf(array, obj) {
                            var i;
                            for (i = 0; i < array.length; i++) {
                                if (angular.equals(array[i], obj)) {
                                    return i;
                                }
                            }
                            return -1;
                        }

                        function afterInsertRow(rowid, rowdata) {
                            /*jshint validthis: true */
                            var actionEl,
                                cell,
                                column,
                                columnData,
                                i,
                                invoke,
                                item,
                                items,
                                itemScope,
                                menuid,
                                row;
                            
                            if (hasTemplatedColumns) {
                                if (!tableBody) {
                                    tableBody = $(this);
                                }

                                row = tableBody.find('tr:eq(' + rowid + ')');

                                for (i = 0; i < columnModel.length; i++) {
                                    column = columnModel[i];

                                    if (column.template_url) {
                                        cell = row.find('[data-grid-field="' + column.name + '"]');
                                        columnData = rowdata[column.name];

                                        //Create a new scope and apply the cell object's properties to it.
                                        itemScope = $scope.$new(true);

                                        itemScope.data = columnData;

                                        if (column.allow_see_more) {
                                            itemScope.skyResources = $scope.resources;
                                        }

                                        //make the resources from the caller available to the column templates
                                        if ($scope.options.resources) {
                                            itemScope.resources = $scope.options.resources;
                                        }

                                        if (column.controller) {
                                            $controller(column.controller, {
                                                $scope: itemScope
                                            });
                                        }

                                        cellScopes.push(itemScope); //Stash scope for cleanup later.

                                        linkCellValue(itemScope, cell, compiledTemplates[column.template_url]);
                                    }
                                }
                            }

                            invoke = function (cmd, actionEl) {
                                return function () {
                                    cmd(rowid);
                                    $(actionEl).dropdown('toggle');
                                    return false;
                                };
                            };

                            if (contextMenuItems && contextMenuItems[rowid]) {
                                menuid = buildMenuId(rowid);
                                items = contextMenuItems[rowid];

                                for (i = 0; i < items.length; ++i) {
                                    item = items[i];
                                    actionEl = $('#' + buildActionId(menuid, item));
                                    $(actionEl).on('click', invoke(item.cmd, actionEl));
                                }
                            }

                            //check if row should be multiselected
                            if (locals.selectedRows && locals.selectedRows.length > 0) {
                                row = $scope.options.data[(rowid - 1)];
                                if (row && arrayObjectIndexOf(locals.selectedRows, row) > -1) {
                                    tableEl.setSelection(rowid, false);
                                }
                            }
                        }

                        function setColumnHeaderAlignment() {
                            var alignmentClass,
                                column,
                                i;

                            for (i = 0; i < columnModel.length; i++) {
                                column = columnModel[i];
                                if (column.align === 'center') {
                                    alignmentClass = 'bb-grid-th-center';
                                } else if (column.align === 'right') {
                                    alignmentClass = 'bb-grid-th-right';
                                } else {
                                    alignmentClass = 'bb-grid-th-left';
                                }
                                    
                                tableEl.setLabel(column.name, '', alignmentClass);
                                    
                            }
                        }
                        
                        function gridComplete() {
                            //Add padding to the bottom of the grid for any dropdowns in the last row. This needs to be handled better in the future probably just using css classes or something.
                            if (getContextMenuItems) {
                                element.find('.ui-jqgrid-bdiv').css('padding-bottom', '100px');
                            }
                            
                            setColumnHeaderAlignment();
                        }

                        function gridColumnsReordered(orderedColumns) {
                            var i,
                                offset = 0,
                                oldIndex,
                                selectedColumnIds = $scope.options.selectedColumnIds,
                                newSelectedColumnIds = [];
                            
                            resetExtendedColumn();

                            //Need to account for context menu if it exists.  It will always be the first
                            //column before and after the reorder
                            if (angular.isFunction(getContextMenuItems)) {
                                offset = 1;
                            }

                            for (i = offset; i < orderedColumns.length; i++) {
                                oldIndex = orderedColumns[i];
                                newSelectedColumnIds.push(selectedColumnIds[oldIndex - offset]);
                            }

                            reorderingColumns = true;
                            $scope.options.selectedColumnIds = newSelectedColumnIds;
                            $scope.$apply();
                        }

                        function getSortable() {
                            var sortable = {
                                update: gridColumnsReordered
                            };

                            if (getContextMenuItems) {
                                sortable.exclude = "#" + $scope.locals.gridId + "_" + DROPDOWN_TOGGLE_COLUMN_NAME;
                            }

                            return sortable;
                        }

                        function clearSelectedRowsObject() {
                            locals.selectedRows = [];
                        }

                        function resetMultiselect() {
                            clearSelectedRowsObject();
                            tableEl.resetSelection();
                        }

                        function onSelectAll(rowIds, status) {
                            /*jslint unparam: true */
                            var allRowData;

                            clearSelectedRowsObject();
                            if (status === true) {
                                allRowData = $scope.options.data;
                                if (allRowData && allRowData.length > 0) {
                                    locals.selectedRows = allRowData.slice();
                                }
                            }
                            
                            $scope.$apply();
                        }

                        function onSelectRow(rowId, status) {
                            var index,
                                row = $scope.options.data[(rowId - 1)];

                            index = arrayObjectIndexOf(locals.selectedRows, row);

                            if (status === true && index === -1 && row) {
                                locals.selectedRows.push(row);
                            } else if (status === false && index > -1) {
                                locals.selectedRows.splice(index, 1);
                            }
                            
                            $scope.$apply();
                        }
                        
                        function pageChanged() {
                            var skip = ($scope.locals.currentPage - 1) * $scope.paginationOptions.itemsPerPage,
                                top = $scope.paginationOptions.itemsPerPage;
                            
                            $scope.$emit('loadMoreRows', {top: top, skip: skip});
                            
                        }
                        
                        function initializePagination() {
                            if (angular.isDefined($scope.paginationOptions)) {
                                
                                if (!$scope.paginationOptions.itemsPerPage) {
                                    $scope.paginationOptions.itemsPerPage = DEFAULT_ITEMS_PER_PAGE;
                                }
                                    
                                if (!$scope.paginationOptions.maxPages) {
                                    $scope.paginationOptions.maxPages = DEFAULT_MAX_PAGES;
                                }
                            
                                $scope.paginationOptions.pageChanged = pageChanged;
                                
                                $scope.locals.currentPage = 1;
                            }
                        }
                        
                        function initGrid() {
                            var columns,
                                jqGridOptions,
                                selectedColumnIds,
                                useGridView = true,
                                hoverrows = false;

                            totalColumnWidth = 0;
                            
                            tableWrapperWidth = tableWrapper.width();
                            
                            locals.multiselect = false;

                            //Clear reference to the table body since it will be recreated.
                            tableBody = null;

                            //Unload grid if it already exists.
                            tableEl.jqGrid('GridUnload');

                            tableEl = element.find('table');
                            tableDomEl = tableEl[0];

                            /*istanbul ignore else: sanity check */
                            if ($scope.options) {
                                columns = $scope.options.columns;
                                selectedColumnIds = $scope.options.selectedColumnIds;
                                getContextMenuItems = $scope.options.getContextMenuItems;
                                if (angular.isFunction($scope.options.onAddClick)) {
                                    locals.hasAdd = true;
                                }
                                if ($scope.options.hideColPicker) {
                                    locals.hasColPicker = false;
                                }
                                if ($scope.options.hideFilters) {
                                    locals.hasFilters = false;
                                }

                                if ($scope.options.multiselect) {
                                    locals.multiselect = true;
                                    hoverrows = true;

                                    totalColumnWidth = totalColumnWidth + MULTISELECT_COLUMN_SIZE;
                                }
                                
                                $scope.searchText = $scope.options.searchText;
                            }
                            
                            // Allow grid styles to be changed when grid is in multiselect mode (such as the 
                            // header checkbox alignment).
                            element[locals.multiselect ? 'addClass' : 'removeClass']('bb-grid-multiselect');

                           
                            if (getContextMenuItems) {
                                useGridView = false;
                            }
                           
                            if (columns && selectedColumnIds) {
                                
                                
                                columnModel = buildColumnModel(columns, selectedColumnIds);
                                columnCount = columnModel.length;

                                jqGridOptions = {
                                    afterInsertRow: afterInsertRow,
                                    autoencode: true,
                                    colModel: columnModel,
                                    datatype: angular.noop,
                                    gridComplete: gridComplete,
                                    gridView: useGridView,
                                    height: 'auto',
                                    hoverrows: hoverrows,
                                    multiselect: locals.multiselect,
                                    multiselectWidth: MULTISELECT_COLUMN_SIZE,
                                    onSelectAll: onSelectAll,
                                    onSelectRow: onSelectRow,
                                    resizeStart: resizeStart,
                                    resizeStop: resizeStop,
                                    rowNum: -1,
                                    shrinktofit: false,
                                    sortable: getSortable(),
                                    width: getDesiredGridWidth()
                                };

                                
                                tableEl.jqGrid(jqGridOptions);
          
                                header = $(tableDomEl.grid.hDiv);
                                
                                //Attach click handler for sorting columns
                                header.find('th').on('click', function () {
                                    var sortOptions = $scope.options.sortOptions,
                                        columnName;

                                    if (!sortOptions) {
                                        sortOptions = $scope.options.sortOptions = {};
                                    }

                                    columnName = getColumnNameFromElementId(this.id);

                                    if (columnIsSortable(columnName)) {
                                        sortOptions.column = columnName;
                                        sortOptions.descending = $(this).hasClass('sorting-asc');
                                        $scope.$apply();
                                    }
                                });
                                
                                fullGrid = header.parents('.ui-jqgrid:first');

                                if (vkHeader) {
                                    vkHeader.destroy();
                                }
                                
                                toolbarContainer.show();
                                
                                topScrollbar.width(tableWrapper.width());
                                resetTopScrollbar();
                               
                                vkHeader = new bbViewKeeperBuilder.create({
                                    el: header[0],
                                    boundaryEl: tableWrapper[0],
                                    verticalOffSetElId: toolbarContainerId,
                                    setWidth: true,
                                    onStateChanged: function () {
                                        if (vkHeader.isFixed) {
                                            header.scrollLeft(tableWrapper.scrollLeft()); 
                                        } else {
                                            header.scrollLeft(0);
                                        }
                                            
                                    }
                                });
         
                                setSortStyles();

                                $scope.gridCreated = true;
                            }
                            
                        }

                        function destroyCellScopes() {
                            var i;
                            if (cellScopes) {
                                for (i = 0; i < cellScopes.length; i++) {
                                    cellScopes[i].$destroy();
                                }
                            }
                            cellScopes = [];
                        }

                        function loadColumnTemplates(callback) {
                            var columns,
                                templateUrlsToLoad = {};

                            //Identify any template URLs that haven't been compiled
                            if ($scope.options) {
                                columns = $scope.options.columns;

                                if (columns) {
                                    angular.forEach(columns, function (column) {
                                        var templateUrl = column.template_url;

                                        if (templateUrl && !compiledTemplates[templateUrl]) {
                                            templateUrlsToLoad[templateUrl] = templateUrl;
                                        }
                                    });
                                }
                            }

                            //Load template URLs that need compiling
                            bbData.load({
                                text: templateUrlsToLoad
                            }).then(function (result) {
                                var p,
                                    template;

                                // Compile templates and store them for use when adding rows.
                                for (p in result.text) {
                                    if (result.text.hasOwnProperty(p)) {
                                        template = result.text[p];

                                        if (template) {
                                            compiledTemplates[p] = $compile(template);
                                        }
                                    }
                                }

                                callback();
                            });
                        }

                        function refreshMultiselect() {
                            tableEl.resetSelection();
                            if (!$scope.locals.loadMoreStarted) {
                                clearSelectedRowsObject();
                            } else {
                                $scope.locals.loadMoreStarted = false;
                            }
                        }
                        
                        function handleTableWrapperResize() {
                            var newWidth = tableWrapper.width();
                            
                            if (tableWrapperWidth && tableWrapperWidth !== newWidth) {
                                resetGridWidth(tableWrapperWidth, newWidth);
                                tableWrapperWidth = newWidth;
                            } else {
                                tableWrapperWidth = newWidth;
                            }
                        }

                        function setRows(rows) {
                            if (tableDomEl.addJSONData) {
                                loadColumnTemplates(function () {
                                    refreshMultiselect();

                                    destroyCellScopes();
                                    tableDomEl.addJSONData(rows);
                                    $timeout(highlightSearchText);
                                    handleTableWrapperResize();
                                    updateGridLoadedTimestampAndRowCount(rows ? rows.length : 0);
                                });
                            }
                        }

                        function setupToolbarViewKeepers() {
                            if (vkToolbars) {
                                vkToolbars.destroy();
                            }

                            if (vkActionBarAndBackToTop) {
                                vkActionBarAndBackToTop.destroy();
                            }

                            if ($scope.options) {
                                verticalOffSetElId = $scope.options.viewKeeperOffsetElId;
                            }

                            vkToolbars = new bbViewKeeperBuilder.create({
                                el: toolbarContainer[0],
                                boundaryEl: element[0],
                                setWidth: true,
                                verticalOffSetElId: verticalOffSetElId,
                                onStateChanged: function () {
                                    locals.isScrolled = vkToolbars.isFixed;
                                    $scope.$apply();
                                }
                            });

                            vkActionBarAndBackToTop = new bbViewKeeperBuilder.create({
                                el: element.find('.grid-action-bar-and-back-to-top')[0],
                                boundaryEl: element[0],
                                setWidth: true,
                                verticalOffSetElId: verticalOffSetElId,
                                fixToBottom: true
                            });
                        }

                        function applySearchText() {
                            element.find('.bb-search-container input').select();
                            $scope.options.searchText = $scope.searchText;
                        }

                        function backToTop() {
                            vkToolbars.scrollToTop();
                        }
                        
                        locals.resetMultiselect = resetMultiselect;

                        id = $scope.$id;
                        toolbarContainerId = id + '-toolbar-container';

                        locals.openColumnPicker = openColumnPicker;

                        locals.backToTop = backToTop;

                        //Apply unique id to the table.  ID is required by jqGrid.
                        toolbarContainer.attr('id', toolbarContainerId);

                        function reinitializeGrid() {
                            var columnChangedData;
                            
                            initGrid();

                            // As an optimization, allow the consumer to specify whether changing columns will cause the row data to be
                            // re-evaluated so the grid won't automatically be reloaded with existing data.
                            columnChangedData = {
                                willResetData: false
                            };

                            $scope.$emit('includedColumnsChanged', columnChangedData);

                            if (!columnChangedData.willResetData && $scope.options.data) {
                                // Data won't change as a result of the columns changing; reload existing data.
                                setRows($scope.options.data);
                            }
                        }
                        
                        $scope.$watch('options.selectedColumnIds', function (newValue) {

                            if (newValue) {
                                if (reorderingColumns) {
                                    reorderingColumns = false;
                                    return;
                                }
                                
                                reinitializeGrid();
                            }
                        }, true);
                        
                        $scope.$watch('paginationOptions', initializePagination, true);

                        $scope.$watchCollection('options.data', setRows);

                        locals.applySearchText = applySearchText;

                        $scope.syncViewKeepers = function () {
                            if (vkToolbars) {
                                vkToolbars.syncElPosition();
                            }
                        };

                        $scope.syncActionBarViewKeeper = function () {
                            if (vkActionBarAndBackToTop) {
                                vkActionBarAndBackToTop.syncElPosition();
                            }
                        };

                        $scope.$watch('options.sortOptions', setSortStyles, true);

                        $scope.$watch('options.viewKeeperOffsetElId', function () {
                            setupToolbarViewKeepers();
                        });

                        $scope.$watch('options.filters', function (f) {
                            $scope.$broadcast('updateAppliedFilters', f);
                        });

                        bbMediaBreakpoints.register(mediaBreakpointHandler);

                        tableWrapper.on('scroll', function () {
                            
                            /*istanbul ignore else: sanity check */
                            if (vkHeader) {
                                vkHeader.syncElPosition();
                            }

                            if (header.hasClass('viewkeeper-fixed')) {
                                header.scrollLeft(tableWrapper.scrollLeft());
                            }
                            
                            topScrollbar.scrollLeft(tableWrapper.scrollLeft());     
                        });
                        
                        windowEventId = 'bbgrid' + id;
                        
                        windowEl.on('resize.' + windowEventId + ', orientationchange.' + windowEventId, function () {
                            handleTableWrapperResize();
                        });
                        
                        topScrollbar.on('scroll', function () {
                            tableWrapper.scrollLeft(topScrollbar.scrollLeft());
                            if (header.hasClass('viewkeeper-fixed')) {
                                header.scrollLeft(topScrollbar.scrollLeft());
                            }
                        });

                        element.on('$destroy', function () {
                            
                            /*istanbul ignore else: sanity check */
                            if (vkToolbars) {
                                vkToolbars.destroy();
                            }

                            /*istanbul ignore else: sanity check */
                            if (vkHeader) {
                                vkHeader.destroy();
                            }
                            
                            /*istanbul ignore else: sanity check */
                            if (vkActionBarAndBackToTop) {
                                vkActionBarAndBackToTop.destroy();
                            }

                            windowEl.off('resize.' + windowEventId + ', orientationchange.' + windowEventId);

                            topScrollbar.off();
                            
                            bbMediaBreakpoints.unregister(mediaBreakpointHandler);
                        });
                    },
                    templateUrl: 'sky/templates/grids/grid.html'
                };
            }])
        
        .directive('bbGridActionBar', ['bbMediaBreakpoints', 'bbResources', '$timeout', function (bbMediaBreakpoints, bbResources, $timeout) {
            return {
                require: '^bbGrid',
                replace: true,
                transclude: true,
                restrict: 'E',
                scope: {
                    bbMultiselectActions: '=',
                    bbSelectionsUpdated: '&'
                },
                controller: ['$scope', function ($scope) {
                    $scope.locals = {
                        actions: $scope.bbMultiselectActions,
                        showActionBar: false,
                        mobileButtons: false,
                        showMobileActions: false
                    };

                    $scope.resources = bbResources;
                }],
                link: function ($scope, element, attrs, bbGrid) {
                    /*jslint unparam: true */

                    bbGrid.scope.$watchCollection('locals.selectedRows', function (newValue) {
                        var action,
                            i,
                            showActionBar;

                        if (newValue) {
                            //this notation is necessary because the argument is passed through grid and then to the controller
                            //in which grid resides.
                            $scope.bbSelectionsUpdated({ selections: { selections: newValue } });

                            showActionBar = false;
                            if ($scope.locals.actions) {
                                //only show the action bar if an action has an available selection
                                for (i = 0; i < $scope.locals.actions.length; i++) {
                                    action = $scope.locals.actions[i];
                                    if (action.selections.length > 0) {
                                        showActionBar = true;
                                    }
                                }
                            }
                            $scope.locals.showActionBar = showActionBar;

                            if (showActionBar) {
                                $timeout(function () {
                                    bbGrid.syncActionBarViewKeeper();
                                });
                            }
                        }
                    });

                    //on mobile do an ng-if that changes the stuff.
                    function mediaBreakpointHandler(newBreakpoints) {
                        $scope.locals.mobileButtons = newBreakpoints.xs;
                    }

                    bbMediaBreakpoints.register(mediaBreakpointHandler);

                    element.on('$destroy', function () {
                        bbMediaBreakpoints.unregister(mediaBreakpointHandler);
                    });

                    $scope.locals.clearSelection = function () {
                        bbGrid.resetMultiselect();
                    };

                    $scope.locals.chooseAction = function () {
                        $scope.locals.showMobileActions = true;
                    };

                    $scope.locals.cancelChooseAction = function () {
                        $scope.locals.showMobileActions = false;
                    };
                },
                templateUrl: 'sky/templates/grids/actionbar.html'
            };
        }]);
}(jQuery));