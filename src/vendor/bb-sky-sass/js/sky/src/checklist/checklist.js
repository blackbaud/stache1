/*jslint browser: true */
/*global angular */

/** @module Checklist
 @description The Checklist directive allows you to easily build a filterable checkbox list.  Multiple columns of data can be provided for the checkbox rows using the `bb-checklist-column` tag.

### Checklist Settings ###

 - `bb-checklist-items` An array of objects representing the rows that will be shown in the list.
 - `bb-checklist-selected-items` An array representing the selected items in the list.
 - `bb-checklist-include-search` A boolean to optionally include a search textbox for filtering the items.  The search text will be highlighted in the columns of the list.  A callback function can be used to filter the items based on the search text.
 - `bb-checklist-search-placeholder` Placeholder text for the search textbox.
 - `bb-checklist-filter-callback` A function to be called when the search text is modified.  Used by the consumer to update the `bb-checklist-items` array as desired based on the search text.  The function will be passed a single object as a parameter containing a `searchText` property.
 - `bb-checklist-search-debounce` Number of milliseconds to debounce changes to the search text.  Useful if making a web request in the `bb-checklist-filter-callback` to avoid making the request after every character typed.
 - `bb-checklist-no-items-message` *(Default: `'No items found'`)* Message to display when no items are in the list.

### Checklist Column Settings ###

 - `bb-checklist-column-caption` Caption text for the column header.
 - `bb-checklist-column-field` The name of the property on the checklist items that contains the text to display in this column.
 - `bb-checklist-column-class` A CSS class to apply to this column's header and cells.
 - `bb-checklist-column-width` Set the width to be used by the column.
 */

(function () {
    'use strict';
    
    function contains(arr, item) {
        var i;
        
        if (angular.isArray(arr)) {
            for (i = 0; i < arr.length; i += 1) {
                if (angular.equals(arr[i], item)) {
                    return true;
                }
            }
        }
        return false;
    }

    // add
    function add(arr, item) {
        var i;

        arr = angular.isArray(arr) ? arr : [];
        for (i = 0; i < arr.length; i += 1) {
            if (angular.equals(arr[i], item)) {
                return arr;
            }
        }
        arr.push(item);
        return arr;
    }

    // remove
    function remove(arr, item) {
        var i;

        if (angular.isArray(arr)) {
            for (i = 0; i < arr.length; i += 1) {
                if (angular.equals(arr[i], item)) {
                    arr.splice(i, 1);
                    break;
                }
            }
        }
        return arr;
    }

    angular.module('sky.checklist', ['sky.resources'])
        .directive('checklistModel', ['$parse', '$compile', function ($parse, $compile) {
            // http://stackoverflow.com/a/19228302/1458162
            function postLinkFn(scope, elem, attrs) {
                var getter,
                    setter,
                    value;
                
                // compile with `ng-model` pointing to `checked`
                $compile(elem)(scope);

                // getter / setter for original model
                getter = $parse(attrs.checklistModel);
                setter = getter.assign;

                // value added to list
                value = $parse(attrs.checklistValue)(scope.$parent);

                // watch UI checked change
                scope.$watch('checked', function (newValue, oldValue) {
                    var current;
                    
                    if (newValue === oldValue) {
                        return;
                    }
                    
                    current = getter(scope.$parent);
                    
                    if (newValue === true) {
                        setter(scope.$parent, add(current, value));
                    } else {
                        setter(scope.$parent, remove(current, value));
                    }
                });

                // watch original model change
                scope.$parent.$watch(attrs.checklistModel, function (newArr) {
                    scope.checked = contains(newArr, value);
                }, true);
            }

            return {
                restrict: 'A',
                priority: 1000,
                terminal: true,
                scope: true,
                compile: function (tElement, tAttrs) {
                    if (tElement[0].tagName !== 'INPUT' || !tElement.attr('type', 'checkbox')) {
                        throw 'checklist-model should be applied to `input[type="checkbox"]`.';
                    }

                    if (!tAttrs.checklistValue) {
                        throw 'You should provide `checklist-value`.';
                    }

                    // exclude recursion
                    tElement.removeAttr('checklist-model');

                    // local scope var storing individual checkbox model
                    tElement.attr('ng-model', 'checked');

                    return postLinkFn;
                }
            };
        }])
        .directive('bbChecklist', ['bbResources', function (bbResources) {
            return {
                replace: true,
                restrict: 'E',
                transclude: true,
                templateUrl: 'sky/templates/checklist/checklist.html',
                scope: {
                    bbChecklistItems: "=",
                    bbChecklistSelectedItems: "=",
                    bbChecklistFilterCallback: "=",
                    bbChecklistIncludeSearch: "=",
                    bbChecklistSearchDebounce: "=",
                    bbChecklistSearchPlaceholder: "=",
                    bbChecklistNoItemsMessage: "=",
                    bbChecklistAutomationField: "="
                },
                controller: ['$scope', function ($scope) {
                    var locals = {
                        selectAllText: bbResources.checklist_select_all,
                        clearAllText: bbResources.checklist_clear_all,
                        defaultNoItemsText: bbResources.checklist_no_items,
                        noItemsText: $scope.bbChecklistNoItemsMessage
                    };

                    locals.selectAll = function () {
                        var i,
                            item,
                            items = $scope.bbChecklistItems,
                            selected = $scope.bbChecklistSelectedItems;

                        for (i = 0; i < items.length; i += 1) {
                            item = items[i];
                            if (!contains(selected, item)) {
                                add(selected, item);
                            }
                        }
                    };

                    locals.clear = function () {
                        var selected = $scope.bbChecklistSelectedItems;
                        while (selected.length) {
                            selected.pop();
                        }
                    };

                    locals.rowClicked = function (item) {
                        var selected = $scope.bbChecklistSelectedItems;

                        if (!contains(selected, item)) {
                            add(selected, item);
                        } else {
                            remove(selected, item);
                        }
                    };

                    $scope.locals = locals;

                    $scope.$watch('bbChecklistItems', function () {
                        locals.highlightRefresh = new Date().getTime();
                    });

                    $scope.$watch('locals.searchText', function (newValue, oldValue) {

                        if (newValue !== oldValue) {
                            if ($scope.bbChecklistFilterCallback) {
                                $scope.bbChecklistFilterCallback({ searchText: locals.searchText });
                            }
                        }
                    });
                    
                    this.setColumns = function (columns) {
                        locals.columns = columns;
                    };
                }]
            };
        }])
        .directive('bbChecklistColumns', [function () {
            return {
                require: '^bbChecklist',
                restrict: 'E',
                scope: {
                },
                controller: ['$scope', function ($scope) {
                    $scope.columns = [];

                    this.addColumn = function (column) {
                        $scope.columns.push(column);
                    };
                }],
                link: function ($scope, element, attrs, bbChecklist) {
                    /*jslint unparam: true */
                    bbChecklist.setColumns($scope.columns);
                }
            };
        }])
        .directive('bbChecklistColumn', [function () {
            return {
                require: '^bbChecklistColumns',
                restrict: 'E',
                scope: {
                    bbChecklistColumnCaption: "=",
                    bbChecklistColumnField: "=",
                    bbChecklistColumnClass: "=",
                    bbChecklistColumnWidth: "=",
                    bbChecklistColumnAutomationId: "="
                },
                link: function ($scope, element, attrs, bbChecklistColumns) {
                    /*jslint unparam: true */
                    var column = {
                        caption: $scope.bbChecklistColumnCaption,
                        field: $scope.bbChecklistColumnField,
                        'class': $scope.bbChecklistColumnClass,
                        width: $scope.bbChecklistColumnWidth,
                        automationId: $scope.bbChecklistColumnAutomationId
                    };

                    bbChecklistColumns.addColumn(column);
                }
            };
        }]);
}());