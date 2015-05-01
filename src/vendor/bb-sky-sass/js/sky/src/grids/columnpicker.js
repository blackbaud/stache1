/*jslint browser: false, plusplus: true */
/*global angular */

(function () {
    'use strict';

    function buildCategoryList(columns, all_categories_caption) {
        var categories = [],
            column,
            index,
            len;

        len = columns.length;

        for (index = 0; index < len; index++) {
            column = columns[index];

            if (column.category) {
                if (categories.indexOf(column.category) === -1) {
                    categories.push(column.category);
                }
            }
        }

        if (categories.length > 0) {
            categories.unshift(all_categories_caption);
        }

        return categories;
    }


    function columnCompare(a, b) {
        a = a.caption.toLocaleLowerCase();
        b = b.caption.toLocaleLowerCase();

        if (a < b) {
            return -1;
        }

        if (a > b) {
            return 1;
        }

        return 0;
    }

    function controller($scope, bbResources, availableColumns, initialSelectedColumnIds, columnPickerHelpKey) {
        var all_categories = bbResources.grid_column_picker_all_categories,
            columns = [];

        angular.forEach(availableColumns, function (column) {
            columns.push({
                id: column.id,
                name: column.name,
                caption: column.caption,
                category: column.category,
                description: column.description,
                selected: (initialSelectedColumnIds.indexOf(column.id) >= 0)
            });
        });

        columns.sort(columnCompare);

        $scope.resources = bbResources;
        $scope.columns = columns;
        $scope.categories = buildCategoryList(columns, all_categories);
        $scope.locals = {};
        $scope.locals.selectedCategory = all_categories;
        $scope.columnPickerHelpKey = columnPickerHelpKey;

        $scope.applyChanges = function () {
            var column,
                scopeColumns = $scope.columns,
                columnIds = [],
                i;

            //Loop through previously selected columns.  If they are still selected, add
            //them to the resulting list in their original order.
            angular.forEach(initialSelectedColumnIds, function (columnId) {
                for (i = 0; i < scopeColumns.length; i++) {
                    column = scopeColumns[i];

                    if (column.id === columnId) {
                        if (column.selected) {
                            columnIds.push(column.id);
                        }
                        break;
                    }
                }
            });

            //Loop through all columns.  If they are selected and not already in the list
            //then add them to the end.
            angular.forEach(scopeColumns, function (column) {
                var id;
                if (column.selected) {
                    id = column.id;

                    for (i = 0; i < columnIds.length; i++) {
                        if (columnIds[i] === id) {
                            return;
                        }
                    }

                    columnIds.push(id);
                }
            });

            $scope.$close(columnIds);
        };

        function searchTextMatchesColumn(searchText, column) {
            if (searchText) {
                searchText = searchText.toLocaleLowerCase();
                if ((column.caption && column.caption.toLocaleLowerCase().indexOf(searchText) > -1) || (column.description && column.description.toLocaleLowerCase().indexOf(searchText) > -1)) {
                    return true;
                }
                return false;
            }
            return true;
        }

        $scope.applyFilters = function () {
            var category = $scope.locals.selectedCategory,
                column,
                index,
                len,
                searchText = $scope.locals.searchText,
                showAllCategories;

            showAllCategories = (category === all_categories ? true : false);
            len = $scope.columns.length;

            for (index = 0; index < len; index++) {
                column = $scope.columns[index];

                if (showAllCategories || column.category === category) {
                    if (searchTextMatchesColumn(searchText, column)) {
                        column.hidden = false;
                    } else {
                        column.hidden = true;
                    }
                } else {
                    column.hidden = true;
                }
            }
        };

        $scope.filterByCategory = function (category) {
            $scope.locals.selectedCategory = category;
            $scope.applyFilters();
        };
    }

    angular.module('sky.grids.columnpicker', [])
        .controller('BBGridColumnPickerController', ['$scope', 'bbResources', 'columns', 'selectedColumnIds', 'columnPickerHelpKey', controller]);
}());