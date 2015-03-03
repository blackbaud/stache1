/*jslint browser: true, plusplus: true */
/*global angular */

(function () {
    'use strict';

    angular.module('sky.autofocus', [])
        .directive('bbAutofocus', ['$timeout', function ($timeout) {
            return {
                restrict: 'A',
                link: function ($scope, $element) {
                    /*jslint unparam: true */
                    $timeout(function () {
                        $element[0].focus();
                    }, 100);
                }
            };
        }]);
}());
/*jslint browser: true, plusplus: true */
/*global angular, jQuery */

(function ($) {
    'use strict';

    angular.module('sky.charts', ['sky.resources', 'sky.moment', 'sky.format'])
        .directive('bbChartScatterplot', ['$timeout', 'bbFormat', 'bbMoment', 'bbResources', function ($timeout, bbFormat, bbMoment, bbResources) {
            /*
            Custom options:
                mode: Initialize the chart options to a special configuration
                    FixedSeriesMonthTimeline: A series with Y values that are fixed and X values that represent months

                clickCallback: Callback for when the chart is clicked on
                hoverCallback: Callback for when the chart is hovered over
                moveForward: Callback for when the user moves the series forward
                moveForwardDisabled: Property for the status of the move forward button
                moveBack: Callback for when the user moves the series backward
                moveBackDisabled: Property for the status of the move back button
            */

            return {
                restrict: 'EA',
                transclude: true,
                templateUrl: 'sky/templates/charts/scatterplot.html',
                scope: {
                    bbChartDataset: '=',
                    bbChartOptions: '='
                },
                controller: ['$scope', function ($scope) {
                    this.enablePopup = function (callback) {
                        if (angular.isFunction(callback)) {
                            $scope.popupCallback = callback;
                            $scope.enableClick = true;
                        }
                    };
                }],
                link: function (scope, el, attributes, controller, transclude) {
                    /*jslint unparam: true */
                    var chartContainer,
                        dataSetInitialized = false,
                        firstXAxisLabelEl,
                        firstYAxisLabelEl,
                        options,
                        optionsInitialized = false,
                        plot,
                        plotEl;

                    function getNumericCssProp(el, propName) {
                        return parseInt(el.css(propName), 10);
                    }

                    function getXAxisLabelTop() {
                        if (firstXAxisLabelEl) {
                            return getNumericCssProp(firstXAxisLabelEl, 'top');
                        }
                    }

                    function getYAxisLabelRight() {
                        if (firstYAxisLabelEl) {
                            return getNumericCssProp(firstYAxisLabelEl, 'left') + getNumericCssProp(firstYAxisLabelEl, 'width');
                        }
                    }

                    scope.moveBackStyle = function () {

                        return {
                            'left': getYAxisLabelRight() - 15,
                            'position': 'absolute',
                            'top': getXAxisLabelTop(),
                            'z-index': 2
                        };
                    };

                    scope.moveForwardStyle = function () {

                        return {
                            'right': -10,
                            'position': 'absolute',
                            'top': getXAxisLabelTop(),
                            'z-index': 2
                        };
                    };

                    function initializePlotElement() {
                        var height,
                            width;

                        width = attributes.width || '100%';
                        height = attributes.height || '100%';

                        chartContainer = el.children('.bb-chart-container');
                        plotEl = $(chartContainer.children('.bb-chart'));

                        plotEl.css({
                            width: width,
                            height: height
                        });
                    }

                    function moveDataWindow(xMin, xMax) {
                        options.xaxis.min = xMin;
                        options.xaxis.max = xMax;
                    }

                    function loadMoreData(loadedMin, loadedMax, thresholdMin, thresholdMax, loadMoreCallback) {
                        var xPanRange = options.xaxis.panRange;

                        if (loadMoreCallback && angular.isFunction(loadMoreCallback)) {
                            if ((loadedMin > xPanRange[0]) && (options.xaxis.min < thresholdMin)) {
                                loadMoreCallback('back');
                            }

                            if ((loadedMax < xPanRange[1]) && (options.xaxis.max > thresholdMax)) {
                                loadMoreCallback('forward');
                            }
                        }
                    }

                    function handlePanMonthTimeline(plot, args) {
                        var loadedMin,
                            loadedMax,
                            loadThreshold,
                            thresholdMin,
                            thresholdMax,
                            xAxis,
                            xAxisOptions;

                        if (args) {
                            xAxis = args.getAxes().xaxis;
                            xAxisOptions = scope.bbChartOptions.panWindow.xAxis;

                            moveDataWindow(xAxis.min, xAxis.max);

                            loadedMin = xAxisOptions.loadedMin();
                            loadedMax = xAxisOptions.loadedMax();

                            loadThreshold = xAxisOptions.loadThreshold;

                            thresholdMin = bbMoment(loadedMin).add(loadThreshold, 'month');
                            thresholdMax = bbMoment(loadedMax).add(-loadThreshold, 'month');

                            loadMoreData(loadedMin, loadedMax, thresholdMin, thresholdMax, xAxisOptions.loadMoreCallback);
                        }
                    }

                    function panMonthTimeline(direction) {
                        var moveTo,
                            xAxis = plot.getAxes().xaxis,
                            xAxisOptions = scope.bbChartOptions.panWindow.xAxis,
                            numToMove = xAxisOptions.numToMove;

                        if (direction === 'back') {
                            numToMove = -numToMove;
                        }

                        moveTo = bbMoment(xAxis.min).add(numToMove, 'month').valueOf();

                        plot.pan({ left: xAxis.p2c(moveTo) });
                    }

                    function getFixedSeriesMonthTimelineOptions(numMonthsShown) {
                        var modeTypeOptions,
                            months = [
                                bbResources.month_short_january,
                                bbResources.month_short_february,
                                bbResources.month_short_march,
                                bbResources.month_short_april,
                                bbResources.month_short_may,
                                bbResources.month_short_june,
                                bbResources.month_short_july,
                                bbResources.month_short_august,
                                bbResources.month_short_september,
                                bbResources.month_short_october,
                                bbResources.month_short_november,
                                bbResources.month_short_december
                            ];

                        modeTypeOptions = {
                            grid: {
                                backgroundColor: {
                                    colors: ['#fff', 'rgb(250, 250, 250)']
                                },
                                borderColor: '#ccc',
                                borderWidth: {
                                    'top': 0,
                                    'right': 0,
                                    'bottom': 1,
                                    'left': 1
                                },
                                clickable: (scope && (scope.enableClick || (scope.bbChartOptions && scope.bbChartOptions.clickCallback))),
                                hoverable: (scope && (scope.enableHover || (scope.bbChartOptions && (scope.bbChartOptions.hoverCallback || scope.bbChartOptions.clickCallback))))
                            },
                            series: {
                                points: {
                                    fill: 1,
                                    fillColor: null,
                                    show: true
                                }
                            },
                            moveBack: function () {
                                panMonthTimeline('back');
                            },
                            moveForward: function () {
                                panMonthTimeline('forward');
                            },
                            pan: {
                                cursor: '-webkit-grab',
                                interactive: true
                            },
                            plotPanCallback: handlePanMonthTimeline,
                            xaxis: {
                                mode: 'time',
                                panRange: [null, null],
                                show: true,
                                tickFormatter: function (val) {
                                    var utcDate = bbMoment.utc(val),
                                        monthNum = utcDate.month(),
                                        month = months[monthNum];

                                    if (monthNum === 0) {
                                        return bbFormat.escape(month) + '<br />' + bbFormat.escape(utcDate.year());
                                    }

                                    if (numMonthsShown && numMonthsShown < 12 && numMonthsShown > 0) {
                                        if (monthNum % numMonthsShown === 0) {
                                            return bbFormat.escape(month) + '<br />' + bbFormat.escape(utcDate.year());
                                        }
                                    }

                                    return month;
                                },
                                tickLength: 0,
                                tickSize: [1, 'month']
                            },
                            yaxis: {
                                min: 0, //Stop the y-axis from jumping when moving to a location with no datapoints
                                panRange: false,
                                show: true,
                                tickLength: 0,
                                tickSize: 1
                            }
                        };

                        return modeTypeOptions;
                    }

                    function getDefaultOptions() {
                        var chartOptions = scope.bbChartOptions,
                            defaultOptions;

                        if (chartOptions && chartOptions.mode) {
                            /*jslint white: true */
                            switch (chartOptions.mode) {
                                case 'FixedSeriesMonthTimeline':
                                    defaultOptions = getFixedSeriesMonthTimelineOptions(chartOptions.numMonthsShown);
                                    break;
                            }
                            /*jslint white: false */
                        }

                        return defaultOptions || {};
                    }

                    function initializePanWindow() {
                        var xAxisOptions;

                        if (scope.bbChartOptions && scope.bbChartOptions.panWindow) {
                            plotEl.addClass('bb-chart-pan');
                            xAxisOptions = scope.bbChartOptions.panWindow.xAxis;

                            if (xAxisOptions.initialWindow) {
                                moveDataWindow(xAxisOptions.initialWindow.min, xAxisOptions.initialWindow.max);
                            }
                        }
                    }

                    function initializeMoveButton(direction) {
                        var moveDisabledPropName,
                            moveProp,
                            movePropName,
                            moveVisiblePropName;

                        movePropName = 'move' + direction;
                        moveDisabledPropName = movePropName + 'Disabled';
                        moveVisiblePropName = movePropName + 'Visible';

                        if (scope.bbChartOptions) {
                            moveProp = scope.bbChartOptions[movePropName];
                            scope[moveVisiblePropName] = true;

                            if (moveProp) {
                                if (angular.isFunction(moveProp)) {
                                    scope[moveDisabledPropName] = function () {
                                        return false;
                                    };
                                    scope[movePropName] = moveProp;
                                }

                                if (angular.isFunction(scope.bbChartOptions[moveDisabledPropName])) {
                                    scope[moveDisabledPropName] = scope.bbChartOptions[moveDisabledPropName];
                                }
                            } else if (options[movePropName]) {
                                scope[movePropName] = options[movePropName];
                            } else {
                                scope[moveVisiblePropName] = false;
                            }
                        }
                    }

                    function initializeOptions() {
                        options = getDefaultOptions();

                        if (scope.bbChartOptions) {
                            angular.extend(options.xaxis, scope.bbChartOptions.xaxis);
                            angular.extend(options.yaxis, scope.bbChartOptions.yaxis);
                        }

                        initializeMoveButton('Forward');
                        initializeMoveButton('Back');
                        initializePanWindow();
                    }

                    function setFixedLocations() {
                        firstXAxisLabelEl = el.find('.flot-text .xAxis .tickLabel:first');
                        firstYAxisLabelEl = el.find('.flot-text .yAxis .tickLabel:first');
                    }

                    function bindPopup() {
                        if (angular.isFunction(scope.popupCallback)) {
                            plotEl.on('plotclick', function (event, pos, item) {
                                scope.popupCallback(event, pos, item);
                            });
                        }
                    }

                    function bindPan() {
                        if (options && angular.isFunction(options.plotPanCallback)) {
                            plotEl.on('plotpan', function (plot, args) {
                                options.plotPanCallback(plot, args);
                            });
                        }
                    }

                    function initializePlot(plotEl) {
                        function bindPlotEvent(event, binding) {
                            var callbackProp,
                                callbackPropName = event + 'Callback',
                                eventName = 'plot' + event;

                            plotEl.off(eventName);

                            if (scope.bbChartOptions) {
                                callbackProp = scope.bbChartOptions[callbackPropName];

                                if (callbackProp && angular.isFunction(callbackProp)) {
                                    binding(eventName, callbackProp);
                                }
                            }
                        }

                        function bindFlotEvent(eventName, callback) {
                            plotEl.on(eventName, function (event, pos, item) {
                                callback(event, pos, item);
                            });
                        }

                        function bindNavigateEvent(eventName, callback) {
                            plotEl.on(eventName, function (plot, args) {
                                callback(plot, args);
                            });
                        }

                        plot = $.plot(plotEl, (scope.bbChartDataset || []), options);

                        bindPlotEvent('click', bindFlotEvent);
                        bindPlotEvent('hover', bindFlotEvent);
                        bindPlotEvent('pan', bindNavigateEvent);
                        bindPopup();
                        bindPan();

                        setFixedLocations();

                        if (dataSetInitialized && optionsInitialized) {
                            el.removeClass('bb-chart-rendering');
                        }
                    }

                    function initialize() {
                        var tries;

                        function renderChart() {
                            var plotHeight = plotEl[0].clientHeight,
                                plotWidth = plotEl[0].clientWidth;

                            if ((!plotHeight || plotHeight === 0) && (!plotWidth || plotWidth === 0)) {
                                if (tries <= 100) {
                                    tries = tries + 1;
                                    renderChart.timeoutPromise = $timeout(renderChart, 20);
                                }
                                return;
                            }

                            initializePlot(plotEl);
                        }

                        if (renderChart.timeoutPromise) {
                            $timeout.cancel(renderChart.timeoutPromise);
                        }

                        tries = 0;
                        renderChart();
                    }

                    function onDatasetChanged() {
                        dataSetInitialized = true;
                        initialize();
                    }

                    function onOptionsChanged() {
                        if (scope && scope.bbChartOptions) {
                            optionsInitialized = true;
                            initializeOptions();
                            initialize();
                        }
                    }

                    el.addClass('bb-chart-rendering');

                    scope.$on('tileRepaint', function () {
                        initialize();
                    });

                    initializePlotElement();

                    transclude(function (clone) {
                        el.append(clone);
                    });

                    scope.$watchCollection('bbChartDataset', onDatasetChanged, true);
                    scope.$watch('bbChartOptions', onOptionsChanged, true);
                    scope.$watch('popupCallback', bindPopup, true);

                }
            };
        }])
        .directive('bbChartPopup', ['$timeout', '$window', 'bbMediaBreakpoints', function ($timeout, $window, bbMediaBreakpoints) {
            return {
                scope: {
                    bbPopupToggle: '=?',
                    bbPopupOffset: '=?'
                },
                restrict: 'EA',
                require: '^bbChartScatterplot',
                link: function (scope, el, attrs, chart) {
                    /*jslint unparam: true */
                    var hidePopupOnScroll,
                        removeWatch,
                        topOffset = 30,
                        windowEl = $($window);

                    function movePopup(pos) {

                        if (removeWatch) {
                            removeWatch();
                            removeWatch = null;
                        }

                        removeWatch = scope.$watch('popup_open', function (value) {
                            if (value) {
                                if (bbMediaBreakpoints.getCurrent().xs) {
                                    el.removeClass('bb-chart-popup');
                                    el.addClass('bb-chart-popup-mobile');
                                } else {
                                    var elWidth = el.outerWidth(),
                                        elHeight = el.outerHeight(),
                                        elLeft = pos.pageX - elWidth / 2,
                                        elTop = pos.pageY - elHeight - topOffset;
                                    el.removeClass('bb-chart-popup-mobile');
                                    el.addClass('bb-chart-popup');

                                    if (elLeft + elWidth > windowEl.width()) {
                                        elLeft = windowEl.width() - elWidth;
                                    }

                                    if (elLeft < 0) {
                                        elLeft = 0;
                                    }

                                    if (elTop - windowEl.pageYOffset < 0) {
                                        elTop = windowEl.pageYOffset;
                                    }

                                    el.offset({
                                        left: elLeft,
                                        top: elTop
                                    });
                                }
                            }
                        });
                    }

                    function hidePopup() {
                        scope.popup_open = false;
                        el.addClass('ng-hide');
                    }

                    function showPopup() {
                        scope.popup_open = true;
                        el.removeClass('ng-hide');
                    }

                    function handlePopupEvent(event, pos, item) {
                        if (item) {
                            if (scope.lastItem && angular.equals(item, scope.lastItem)) {
                                return;
                            }
                            scope.lastItem = item;
                            movePopup(item);
                        }
                    }

                    function handleMouseEvent(event) {
                        if (scope.lastItem) {
                            var eventX = event.clientX,
                                eventY = event.clientY,
                                itemX = scope.lastItem.pageX,
                                itemY = scope.lastItem.pageY;

                            // Give a 10px 'grace zone' for clicking close to the item
                            if (Math.abs(eventX - itemX) < 10 && Math.abs(eventY - itemY) < 10) {
                                return;
                            }
                        }
                        windowEl.off('click', handleMouseEvent);
                        if (bbMediaBreakpoints.getCurrent().xs) {
                            windowEl.off('scroll', hidePopupOnScroll);
                        }
                        scope.bbPopupToggle = false;
                        scope.$apply();
                    }

                    hidePopupOnScroll = function () {
                        windowEl.off('click', handleMouseEvent);
                        windowEl.off('scroll', hidePopupOnScroll);
                        scope.bbPopupToggle = false;
                        scope.$apply();
                    };

                    scope.$on('$destroy', function () {
                        windowEl.off('click', handleMouseEvent);
                        windowEl.off('scroll', hidePopupOnScroll);
                    });

                    if (scope.bbPopupOffset) {
                        topOffset = scope.bbPopupOffset;
                    }

                    if (angular.isDefined(scope.bbPopupToggle)) {
                        scope.$watch('bbPopupToggle', function (value) {
                            if (value && !scope.popup_open) {
                                $timeout(function () {
                                    windowEl.on('click', handleMouseEvent);
                                    if (bbMediaBreakpoints.getCurrent().xs) {
                                        windowEl.on('scroll', hidePopupOnScroll);
                                    }
                                    showPopup();
                                });
                            } else if (!value && scope.popup_open) {
                                $timeout(hidePopup);
                            }
                        });
                    }

                    el.addClass('bb-chart-popup');

                    hidePopup();

                    chart.enablePopup(handlePopupEvent);
                }
            };
        }]);

}(jQuery));

/*jslint browser: true */
/*global angular, jQuery */

(function ($) {
    'use strict';
    angular.module('sky.check', [])
        .directive('bbCheck', function ($timeout) {
            return {
                require: 'ngModel',
                link: function ($scope, element, $attrs, ngModel) {
                    return $timeout(function () {
                        var value;
                        value = $attrs.value;

                        $scope.$watch($attrs.ngModel, function () {
                            $(element).iCheck('update');
                        });

                        return $(element).iCheck({
                            checkboxClass: 'bb-check-checkbox',
                            radioClass: 'bb-check-radio'

                        }).on('ifChanged', function (event) {
                            if ($(element).attr('type') === 'checkbox' && $attrs.ngModel) {
                                $scope.$apply(function () {
                                    return ngModel.$setViewValue(event.target.checked);
                                });
                            }
                            if ($(element).attr('type') === 'radio' && $attrs.ngModel) {
                                return $scope.$apply(function () {
                                    return ngModel.$setViewValue(value);
                                });
                            }
                        });
                    });
                }
            };
        });
}(jQuery));
/*jslint browser: true */
/*global angular */

(function () {
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

    angular.module('sky.checklist', [])
        .directive('checklistModel', ['$parse', '$compile', function ($parse, $compile) {
            // http://stackoverflow.com/a/19228302/1458162
            function postLinkFn(scope, elem, attrs) {
                // compile with `ng-model` pointing to `checked`
                $compile(elem)(scope);

                // getter / setter for original model
                var getter = $parse(attrs.checklistModel);
                var setter = getter.assign;

                // value added to list
                var value = $parse(attrs.checklistValue)(scope.$parent);

                // watch UI checked change
                scope.$watch('checked', function (newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }
                    var current = getter(scope.$parent);
                    if (newValue === true) {
                        setter(scope.$parent, add(current, value));
                    } else {
                        setter(scope.$parent, remove(current, value));
                    }
                });

                // watch original model change
                scope.$parent.$watch(attrs.checklistModel, function (newArr, oldArr) {
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
                        while (selected.length) { selected.pop(); }
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
/*jslint plusplus: true */
/*global angular, define, jQuery, require */

(function (window, $) {
    'use strict';

    var DEFAULT_PROP = '__DEFAULT__',
        REQUEST_TYPE_DATA = 0,
        REQUEST_TYPE_RESOURCES = 1,
        REQUEST_TYPE_TEXT = 2;

    function fillUrls(option, props, urls) {
        var item,
            p,
            url;

        if (option) {
            if (angular.isString(option) || option.BB_DATA_POST) {
                url = option;

                option = {};
                option[DEFAULT_PROP] = url;
            }

            for (p in option) {
                if (option.hasOwnProperty(p)) {
                    item = option[p];
                    url = item;

                    props.push(p);
                    urls.push(url);
                }
            }
        }
    }

    angular.module('sky.data', [])
        .constant('bbDataConfig', {})
        .factory('bbData', ['$http', '$q', '$templateCache', 'bbDataConfig', function ($http, $q, $templateCache, bbDataConfig) {
            function ajaxUrl(url, requestType) {
                var filter,
                    parts;

                requestType = requestType || 0;

                if (window.define && window.define.amd && window.require) {
                    parts = url.split('?');

                    // Grab the portion before the query string and get the fully-qualified URL.
                    url = parts.shift();
                    url = require.toUrl(url);

                    // If there was anything after the first question mark, put it back.
                    if (parts.length > 0) {
                        url += '?' + parts.join('');
                    }
                }

                switch (requestType) {
                case REQUEST_TYPE_DATA:
                    filter = bbDataConfig.dataUrlFilter;
                    break;
                case REQUEST_TYPE_RESOURCES:
                    filter = bbDataConfig.resourceUrlFilter;
                    break;
                case REQUEST_TYPE_TEXT:
                    filter = bbDataConfig.textUrlFilter;
                    break;
                }

                if (angular.isFunction(filter)) {
                    url = filter(url);
                }

                return url;
            }

            function createAjaxPromise(item, isPost, requestType) {
                var data,
                    isGet,
                    textContent,
                    type,
                    url;

                requestType = requestType || 0;

                if (item.BB_DATA_POST || isPost) {
                    data = item.data;
                    type = item.type || 'post';
                    url = item.url;
                } else {
                    type = 'get';
                    url = item;
                    isGet = true;
                }

                if (isGet && requestType === REQUEST_TYPE_TEXT) {
                    // Check the Angular template cache using the raw URL first in case the text content is compiled into
                    // the module bundle.
                    textContent = $templateCache.get(url);

                    if (textContent) {
                        return $q(function (resolve) {
                            resolve({
                                data: textContent
                            });
                        });
                    }
                }

                url = ajaxUrl(url, requestType);

                return $http({
                    method: type,
                    url: url,
                    cache: requestType !== 0,
                    data: data ? JSON.stringify(data) : null,
                    dataType: requestType !== 0 ? 'text' : 'json',
                    withCredentials: requestType === 0
                });
            }

            function addPromises(items, urls, requestType) {
                var i,
                    n,
                    url;

                if (urls) {
                    for (i = 0, n = urls.length; i < n; i++) {
                        url = urls[i];
                        items.push(createAjaxPromise(url, null, requestType));
                    }
                }
            }

            return {
                load: function (options) {
                    return $q(function (resolve, reject) {
                        var dataOption,
                            dataProps,
                            dataUrls,
                            resourcesOption,
                            resourcesProps,
                            resourcesUrls,
                            promises = [],
                            textOption,
                            textProps,
                            textUrls;

                        function success(args) {
                            var argIndex = 0,
                                result = {};

                            function addResult(name, props) {
                                var resultData,
                                    i,
                                    n,
                                    p,
                                    resultItem;

                                if (props) {
                                    for (i = 0, n = props.length; i < n; i++) {
                                        p = props[i];
                                        resultData = args[argIndex].data;

                                        if (p === DEFAULT_PROP) {
                                            resultItem = resultData;
                                        } else {
                                            resultItem = resultItem || {};
                                            resultItem[p] = resultData;
                                        }

                                        argIndex++;
                                    }
                                }

                                if (angular.isDefined(resultItem)) {
                                    result[name] = resultItem;
                                }
                            }

                            addResult('data', dataProps, true);
                            addResult('resources', resourcesProps);
                            addResult('text', textProps);

                            resolve(result);
                        }

                        function failure() {
                            reject.apply(this, arguments);
                        }

                        dataOption = options.data;
                        resourcesOption = options.resources;
                        textOption = options.text;

                        if (dataOption) {
                            dataProps = [];
                            dataUrls = [];
                            fillUrls(dataOption, dataProps, dataUrls);
                        }

                        if (resourcesOption) {
                            resourcesProps = [];
                            resourcesUrls = [];
                            fillUrls(resourcesOption, resourcesProps, resourcesUrls);
                        }

                        if (textOption) {
                            textProps = [];
                            textUrls = [];
                            fillUrls(textOption, textProps, textUrls);
                        }

                        addPromises(promises, dataUrls, REQUEST_TYPE_DATA);
                        addPromises(promises, resourcesUrls, REQUEST_TYPE_RESOURCES);
                        addPromises(promises, textUrls, REQUEST_TYPE_TEXT);

                        $q.all(promises)
                            .then(success)
                            .catch(failure);
                    });
                },
                query: function (url, params) {
                    return url + '?' + $.param(params);
                },
                post: function (url, data) {
                    return {
                        url: url,
                        data: data,
                        BB_DATA_POST: true
                    };
                },
                save: function (options) {
                    return createAjaxPromise(options, true);
                }
            };
        }]);
}(this, jQuery));
/*jslint browser: true, plusplus: true */
/*global angular, jQuery */

(function () {
    'use strict';
    angular.module('sky.datefield', [])
        .constant('bbDateFieldConfig', {
            currentCultreDateFormatString: 'mm/dd/yyyy',
            twoDigitYearRolloverMax: 29
        })
        .directive('bbDateField', ['$q', 'bbMoment', 'bbDateFieldConfig', 'bbResources', function ($q, bbMoment, bbDateFieldConfig, bbResources) {

            function matchSeparator(value) {
                return value.match(/[.\/\-\s].*?/);
            }

            //Remove locale specific characters
            function stripLocaleCharacterFromDateString(dateString) {
                return dateString.replace(/\u200E/g, '');
            }

            function dateHasSeparator(value) {
                /*
                * Validation criteria:
                * A separator exists
                * There is no separator at the beginning
                * There is no separator at the end
                * Two separators exist
                * All parts of the date have a non-zero value
                */

                var separator = matchSeparator(value),
                    valueArray = value.split(separator),
                    separatorAtEnd = value.indexOf(separator, value.length - 1) !== -1,
                    separatorAtBeginning = value.indexOf(separator) === 0,
                    hasTwoSeparators = valueArray.length - 1 === 2,
                    anyPartIsZero = valueArray.some(function (e) {
                        return Number(e) === 0;
                    });

                return (separator && !separatorAtEnd && !separatorAtBeginning && hasTwoSeparators && !anyPartIsZero);
            }

            function validateDate(value) {
                return !/Invalid|NaN/.test(bbMoment(value, bbDateFieldConfig.currentCultreDateFormatString.toUpperCase())) && dateHasSeparator(value);
            }

            function beautifyDate(value, format) {
                var separator,
                    parts,
                    yearBegin,
                    monthBegin,
                    dayBegin,
                    formatSeparator,
                    lowerFormat,
                    upperFormat;

                if (value) {

                    separator = matchSeparator(value); // look for common separators
                    parts = value.split(separator); // split value based on found separator
                    lowerFormat = format.toLowerCase(); // system expects lowercase format string
                    upperFormat = format.toUpperCase(); // moment js expects uppercase format string

                    if (value.length === 8 && !isNaN(value)) {
                        yearBegin = lowerFormat.indexOf('y');
                        monthBegin = lowerFormat.indexOf('m');
                        dayBegin = lowerFormat.indexOf('d');

                        //MMDDYYYY or DDMMYYYY
                        if (((monthBegin < dayBegin) && (dayBegin < yearBegin)) || ((dayBegin < monthBegin) && (monthBegin < yearBegin))) {
                            parts[0] = value.substring(0, 2);
                            parts[1] = value.substring(2, 4);
                            parts[2] = value.substring(4, 8);
                        } else if ((yearBegin < monthBegin) && (monthBegin < dayBegin)) { //YYYYMMDD 
                            parts[0] = value.substring(0, 4);
                            parts[1] = value.substring(4, 6);
                            parts[2] = value.substring(6, 8);
                        }

                        //Get the expected separator and join the date parts with it
                        formatSeparator = matchSeparator(lowerFormat);
                        return parts.join(formatSeparator);
                    }

                    //If there aren't enough parts to the date or any part is zero, let the validator handle it
                    if (parts.length !== 3 || parts.some(function (e) {
                            return Number(e) === 0;
                    })) {
                        return value;
                    }

                    //If all else fails and momentjs can't parse the date, log an error and let the validator handle it
                    try {
                        return stripLocaleCharacterFromDateString(bbMoment(value, upperFormat).format(upperFormat));
                    } catch (e) {
                        //console.error("Error parsing date value '" + value + "': " + e.toString());
                        return value;
                    }
                }

                return value;
            }

            function getLocaleDate(value) {
                var date,
                    datePart,
                    dateArray,
                    separator,
                    year,
                    formatUpper = bbDateFieldConfig.currentCultreDateFormatString.toUpperCase(),
                    yearPart = formatUpper.indexOf('Y') === 0 ? 0 : 2;

                //If the value is not a valid representation of a date, let the validator handle it
                if (!isNaN(value)) {
                    return value;
                }

                //If date is passed in as SQL UTC string, we need to do some magic to make sure we don't lose a day due to time zone shifts
                if (typeof value === "string" && value.indexOf("T00:00:00") !== -1) {
                    datePart = value.split("T")[0];
                    dateArray = datePart.split("-");
                    date = new Date(dateArray[0], (dateArray[1] - 1), dateArray[2]);
                    return stripLocaleCharacterFromDateString(bbMoment(date).format(bbDateFieldConfig.currentCultreDateFormatString.toUpperCase()));
                }

                //If the date array doesn't have enough parts or any part is zero, return it as is and let the validator handle it, otherwise create a date
                separator = value.match(/[.\/\-\s].*?/);
                dateArray = value.split(separator);

                if (dateArray.length !== 3 || dateArray.some(function (e) {
                        return Number(e) === 0;
                })) {
                    return value;
                }

                year = Number(dateArray[yearPart]);
                if (year < 100) {
                    dateArray[yearPart] = year <= bbDateFieldConfig.twoDigitYearRolloverMax ? year + 2000 : year + 1900;
                    value = dateArray.join(separator);
                }
                date = bbMoment(value, formatUpper);
                return stripLocaleCharacterFromDateString(date.format(formatUpper));
            }

            return {
                scope: {
                    bbDateFieldOptions: '='
                },
                link: function (scope, el, attrs, ngModel) {
                    /*jslint unparam: true */
                    var hasCustomFormatting = (scope.bbDateFieldOptions && !!scope.bbDateFieldOptions.formatValue),
                        input = el.find('input'),
                        today,
                        datefieldHTML = "<span class=\"add-on input-group-addon add-on-for-datepicker\"><i class=\"fa fa-calendar for-datepicker\"></i></span>",
                        errorMessage,
                        skipValidation;

                    function resolveValidation(deferred) {
                        deferred[errorMessage ? 'reject' : 'resolve']();
                    }

                    input = el.children('input');

                    input.on('change', function () {
                        if(input.val() === "") {
                            errorMessage = null;
                            ngModel.invalidFormatMessage = null;
                        }
                        ngModel.$setViewValue(input.val(), 'change');
                    });

                    ////set model value as well as datepicker control value when manually entering a date.
                    ngModel.$asyncValidators.dateFormat = function () {
                        var deferred,
                            localeDate,
                            value,
                            customFormattinedResult;

                        function handleCustomFormattingValidation(result) {
                            var formattedValue;

                            result = result || {};
                            formattedValue = result.formattedValue;

                            errorMessage = result.formattingErrorMessage;

                            ngModel.invalidFormatMessage = errorMessage;

                            resolveValidation(deferred);

                            if (formattedValue !== value) {
                                skipValidation = true;

                                ngModel.$setViewValue(formattedValue);
                                input.val(formattedValue);
                            }
                        }

                        deferred = $q.defer();

                        if (skipValidation || ngModel.$pristine) {
                            ngModel.invalidFormatMessage = null;
                            resolveValidation(deferred);
                        } else {
                            if (hasCustomFormatting) {
                                value = input.val();

                                if (value) {
                                    customFormattinedResult = scope.bbDateFieldOptions.formatValue(value);
                                    if (customFormattinedResult.then) {
                                        customFormattinedResult.then(handleCustomFormattingValidation);
                                    } else {
                                        handleCustomFormattingValidation(customFormattinedResult);
                                    }
                                }
                            } else {
                                value = beautifyDate(input.val(), bbDateFieldConfig.currentCultreDateFormatString);

                                if (value !== undefined) {
                                    //Need to set input to value to validate
                                    localeDate = getLocaleDate(value);
                                    if (value !== "Invalid date" && localeDate !== "Invalid date") {
                                        if (validateDate(localeDate)) {
                                            skipValidation = true;
                                            ngModel.$setViewValue(localeDate);
                                            input.val(localeDate);
                                        } else {
                                            errorMessage = bbResources.date_field_invalid_date_message;
                                            ngModel.invalidFormatMessage = errorMessage;
                                        }
                                    } else {
                                        errorMessage = bbResources.date_field_invalid_date_message;
                                        ngModel.invalidFormatMessage = errorMessage;
                                    }

                                    resolveValidation(deferred);
                                } else {
                                    ngModel.invalidFormatMessage = null;
                                }
                            }
                        }

                        skipValidation = false;

                        return deferred.promise;
                    };

                    ngModel.$render = function () {
                        el.datepicker('setValue', ngModel.$viewValue);
                        input.val(ngModel.$viewValue);
                    };

                    //IE11 inserts left-to-right characters (code 8206) for locale strings, removing for now
                    today = getLocaleDate(new Date());

                    //Set up HTML
                    el.attr('data-date-format', bbDateFieldConfig.currentCultreDateFormatString)
                        .attr('data-date', today)
                        .append(datefieldHTML);

                    input.attr('class', 'has-right-addon text-box single-line' + (hasCustomFormatting ? ' datefield-customformatting' : ''))
                        .attr('placeholder', (hasCustomFormatting ? "" : bbDateFieldConfig.currentCultreDateFormatString.toLowerCase()));

                    el.datepicker().on('changeDate', function (ev) {
                        var value = ev.formattedDate;

                        errorMessage = null;
                        skipValidation = true;

                        // Need to clear validation
                        validateDate(value);

                        ngModel.$setViewValue(value);

                        el.datepicker('hide');
                    });

                    //Override the place function to align the picker with the left side of the input
                    el.datepicker.Constructor.prototype.place = function () {
                        var offset = this.component ? this.component.offset() : this.element.offset();
                        this.picker.css({
                            top: offset.top + this.height,
                            left: offset.left - 118
                        });
                    };

                    //Remove datepicker element on destroy
                    el.datepicker.Constructor.prototype.destroy = function () {
                        this.picker.remove();
                    };

                    // Setup max length for input control
                    input.attr('maxlength', '10');

                    el.on('$destroy', function () {
                        el.datepicker('destroy');
                    });
                },
                replace: true,
                require: 'ngModel',
                restrict: 'E',
                template: function (el, attrs) {
                    /*jslint unparam: true */
                    var html = '<div class="date"><input type="text"';

                    if (attrs.id) {
                        html += ' id="' + attrs.id + '"';
                    }

                    if (attrs.bbautoField) {
                        html += ' data-bbauto-field="' + attrs.bbautoField + 'Input"';
                    }

                    html += '/></div>';

                    return html;
                }
            };
        }]);

}());
/*jslint browser: true, plusplus: true */
/*global angular, jQuery */

(function () {
    'use strict';
    angular.module('sky.daterangepicker', [])
        .factory('bbDateRangePicker', ['bbResources', function (bbResources) {

            var dateRangeTypes,
                defaultDateRangeOptions,
                pastDateRangeOptions;

            dateRangeTypes = {
                AT_ANY_TIME: 0,
                NEXT_WEEK: 1,
                THIS_MONTH: 2,
                NEXT_MONTH: 3,
                THIS_QUARTER: 4,
                NEXT_QUARTER: 5,
                THIS_FISCAL_YEAR: 6,
                NEXT_FISCAL_YEAR: 7,
                THIS_CALENDAR_YEAR: 8,
                NEXT_CALENDAR_YEAR: 9,
                LAST_WEEK: 10,
                LAST_MONTH: 11,
                LAST_QUARTER: 12,
                LAST_FISCAL_YEAR: 13,
                LAST_CALENDAR_YEAR: 14,
                TODAY: 15,
                YESTERDAY: 16,
                TOMORROW: 17,
                THIS_WEEK: 18
            };

            defaultDateRangeOptions = [
                dateRangeTypes.AT_ANY_TIME,
                dateRangeTypes.YESTERDAY,
                dateRangeTypes.TODAY,
                dateRangeTypes.TOMORROW,
                dateRangeTypes.LAST_WEEK,
                dateRangeTypes.THIS_WEEK,
                dateRangeTypes.NEXT_WEEK,
                dateRangeTypes.LAST_MONTH,
                dateRangeTypes.THIS_MONTH,
                dateRangeTypes.NEXT_MONTH,
                dateRangeTypes.LAST_QUARTER,
                dateRangeTypes.THIS_QUARTER,
                dateRangeTypes.NEXT_QUARTER,
                dateRangeTypes.LAST_CALENDAR_YEAR,
                dateRangeTypes.THIS_CALENDAR_YEAR,
                dateRangeTypes.NEXT_CALENDAR_YEAR,
                dateRangeTypes.LAST_FISCAL_YEAR,
                dateRangeTypes.THIS_FISCAL_YEAR,
                dateRangeTypes.NEXT_FISCAL_YEAR
            ];

            pastDateRangeOptions = [
                dateRangeTypes.AT_ANY_TIME,
                dateRangeTypes.YESTERDAY,
                dateRangeTypes.TODAY,
                dateRangeTypes.LAST_WEEK,
                dateRangeTypes.THIS_WEEK,
                dateRangeTypes.LAST_MONTH,
                dateRangeTypes.THIS_MONTH,
                dateRangeTypes.LAST_QUARTER,
                dateRangeTypes.THIS_QUARTER,
                dateRangeTypes.LAST_CALENDAR_YEAR,
                dateRangeTypes.THIS_CALENDAR_YEAR,
                dateRangeTypes.LAST_FISCAL_YEAR,
                dateRangeTypes.THIS_FISCAL_YEAR
            ];

            function getDateRangeTypeCaption(dateRangePickerValue) {
                if (angular.isNumber(dateRangePickerValue)) {
                    // If the input is the enum value itself, then map it to the object structure we expect before proceeding.
                    dateRangePickerValue = { dateRangeType: dateRangePickerValue };
                } else {
                    // If the value is undefiend, then map it to a null object.
                    dateRangePickerValue = dateRangePickerValue || {};
                }

                if (!angular.isDefined(dateRangePickerValue.dateRangeType)) {
                    // If the enum value is undefined, then it represents any time.
                    dateRangePickerValue.dateRangeType = dateRangeTypes.AT_ANY_TIME;
                }

                switch (dateRangePickerValue.dateRangeType) {
                case dateRangeTypes.AT_ANY_TIME:
                    return bbResources.date_range_picker_at_any_time;

                case dateRangeTypes.THIS_WEEK:
                    return bbResources.date_range_picker_this_week;

                case dateRangeTypes.NEXT_WEEK:
                    return bbResources.date_range_picker_next_week;

                case dateRangeTypes.THIS_MONTH:
                    return bbResources.date_range_picker_this_month;

                case dateRangeTypes.NEXT_MONTH:
                    return bbResources.date_range_picker_next_month;

                case dateRangeTypes.THIS_QUARTER:
                    return bbResources.date_range_picker_this_quarter;

                case dateRangeTypes.NEXT_QUARTER:
                    return bbResources.date_range_picker_next_quarter;

                case dateRangeTypes.THIS_FISCAL_YEAR:
                    return bbResources.date_range_picker_this_fiscal_year;

                case dateRangeTypes.NEXT_FISCAL_YEAR:
                    return bbResources.date_range_picker_next_fiscal_year;

                case dateRangeTypes.THIS_CALENDAR_YEAR:
                    return bbResources.date_range_picker_this_calendar_year;

                case dateRangeTypes.NEXT_CALENDAR_YEAR:
                    return bbResources.date_range_picker_next_calendar_year;

                case dateRangeTypes.LAST_WEEK:
                    return bbResources.date_range_picker_last_week;

                case dateRangeTypes.LAST_MONTH:
                    return bbResources.date_range_picker_last_month;

                case dateRangeTypes.LAST_QUARTER:
                    return bbResources.date_range_picker_last_quarter;

                case dateRangeTypes.LAST_FISCAL_YEAR:
                    return bbResources.date_range_picker_last_fiscal_year;

                case dateRangeTypes.LAST_CALENDAR_YEAR:
                    return bbResources.date_range_picker_last_calendar_year;

                case dateRangeTypes.TODAY:
                    return bbResources.date_range_picker_today;

                case dateRangeTypes.YESTERDAY:
                    return bbResources.date_range_picker_yesterday;

                case dateRangeTypes.TOMORROW:
                    return bbResources.date_range_picker_tomorrow;

                }
            }

            function getDateRangeFilterDescription(dateRangePickerValue) {
                // If the value is undefiend, then map it to a null object.
                dateRangePickerValue = dateRangePickerValue || {};

                if (!angular.isDefined(dateRangePickerValue.dateRangeType)) {
                    // If the enum value is undefined, then it represents any time.
                    dateRangePickerValue.dateRangeType = dateRangeTypes.AT_ANY_TIME;
                }

                switch (dateRangePickerValue.dateRangeType) {
                case dateRangeTypes.AT_ANY_TIME:
                    return bbResources.date_range_picker_filter_description_at_any_time;

                case dateRangeTypes.THIS_WEEK:
                    return bbResources.date_range_picker_filter_description_this_week;

                case dateRangeTypes.NEXT_WEEK:
                    return bbResources.date_range_picker_filter_description_next_week;

                case dateRangeTypes.THIS_MONTH:
                    return bbResources.date_range_picker_filter_description_this_month;

                case dateRangeTypes.NEXT_MONTH:
                    return bbResources.date_range_picker_filter_description_next_month;

                case dateRangeTypes.THIS_QUARTER:
                    return bbResources.date_range_picker_filter_description_this_quarter;

                case dateRangeTypes.NEXT_QUARTER:
                    return bbResources.date_range_picker_filter_description_next_quarter;

                case dateRangeTypes.THIS_FISCAL_YEAR:
                    return bbResources.date_range_picker_filter_description_this_fiscal_year;

                case dateRangeTypes.NEXT_FISCAL_YEAR:
                    return bbResources.date_range_picker_filter_description_next_fiscal_year;

                case dateRangeTypes.THIS_CALENDAR_YEAR:
                    return bbResources.date_range_picker_filter_description_this_calendar_year;

                case dateRangeTypes.NEXT_CALENDAR_YEAR:
                    return bbResources.date_range_picker_filter_description_next_calendar_year;

                case dateRangeTypes.LAST_WEEK:
                    return bbResources.date_range_picker_filter_description_last_week;

                case dateRangeTypes.LAST_MONTH:
                    return bbResources.date_range_picker_filter_description_last_month;

                case dateRangeTypes.LAST_QUARTER:
                    return bbResources.date_range_picker_filter_description_last_quarter;

                case dateRangeTypes.LAST_FISCAL_YEAR:
                    return bbResources.date_range_picker_filter_description_last_fiscal_year;

                case dateRangeTypes.LAST_CALENDAR_YEAR:
                    return bbResources.date_range_picker_filter_description_last_calendar_year;

                case dateRangeTypes.TODAY:
                    return bbResources.date_range_picker_filter_description_today;

                case dateRangeTypes.YESTERDAY:
                    return bbResources.date_range_picker_filter_description_yesterday;

                case dateRangeTypes.TOMORROW:
                    return bbResources.date_range_picker_filter_description_tomorrow;

                }
            }

            return {
                dateRangeTypes: dateRangeTypes,
                defaultDateRangeOptions: defaultDateRangeOptions,
                pastDateRangeOptions: pastDateRangeOptions,
                getDateRangeTypeCaption: getDateRangeTypeCaption,
                getDateRangeFilterDescription: getDateRangeFilterDescription
            };

        }])
        .directive('bbDateRangePicker', ['bbDateRangePicker', function (bbDateRangePicker) {
            /// <summary>
            /// This directive provides a date range filter control
            /// </summary>

            return {
                replace: true,
                restrict: 'E',
                templateUrl: 'sky/templates/daterangepicker/daterangepicker.html',
                scope: {
                    bbDateRangePickerValue: "=",
                    bbDateRangePickerAutomationId: "=",
                    bbDateRangePickerOptions: '='
                },
                controller: ['$scope', function ($scope) {

                    $scope.locals = {
                        bbDateRangePicker: bbDateRangePicker
                    };

                    $scope.$watch("bbDateRangePickerValue", function (newVal) {
                        if (!newVal) {
                            $scope.bbDateRangePickerValue = {
                                dateRangeType: bbDateRangePicker.dateRangeTypes.AT_ANY_TIME
                            };
                            return;
                        }
                        newVal.dateRangeType = newVal.dateRangeType || bbDateRangePicker.dateRangeTypes.AT_ANY_TIME;
                    }, true);
                }]
            };
        }]);

}());
/*global angular */

(function () {
    'use strict';

    angular.module('sky.filters', ['sky.format'])
        .filter('encodeURIComponent', ['$window', function ($window) {
            return function (value) {
                return $window.encodeURIComponent(value);
            };
        }])
        .filter("format", ['bbFormat', function (bbFormat) {
            return function () {
                return bbFormat.formatText.apply(this, arguments);
            };
        }]);
}());
/*global angular */

(function () {
    'use strict';
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };

    function replaceTag(tag) {
        return tagsToReplace[tag] || tag;
    }

    angular.module('sky.format', [])
        .factory('bbFormat', function () {
            return {
                formatText: function (format) {
                    var args = arguments;
                    return format.replace(/\{(\d+)\}/g, function (match, capture) {
                        /*jslint unparam: true */
                        return args[parseInt(capture, 10) + 1];
                    });
                },
                escape: function (str) {
                    if (str !== undefined) {
                        return String(str).replace(/[&<>]/g, replaceTag);
                    }

                    return '';
                }
            };
        });
}());
/*jslint browser: false, plusplus: true */
/*global angular */

(function () {
    'use strict';

    function buildCategoryList(columns, all_categories_caption) {
        var categories = [],
            column,
            index,
            len;

        columns = columns || [];
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

    function isVisible(item) {
        return !item.hidden;
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
        $scope.locals.isVisible = isVisible;
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
/*jslint plusplus: true */
/*global angular, jQuery */

(function ($) {
    'use strict';

    var DROPDOWN_TOGGLE_COLUMN_NAME = 'dropdownToggle',
        MULTISELECT_COLUMN_NAME = 'cb';

    angular.module('sky.grids', ['sky.grids.columnpicker'])
        .directive('bbGrid', ['bbModal', '$window', '$compile', '$templateCache', 'bbMediaBreakpoints', 'bbViewKeeperBuilder', 'bbHighlight', 'bbResources', 'bbData', '$controller', '$timeout',
            function (bbModal, $window, $compile, $templateCache, bbMediaBreakpoints, bbViewKeeperBuilder, bbHighlight, bbResources, bbData, $controller, $timeout) {
                return {
                    replace: true,
                    transclude: true,
                    restrict: 'E',
                    scope: {
                        options: '=bbGridOptions',
                        multiselectActions: '=bbMultiselectActions',
                        updateMultiselectActions: '&bbSelectionsUpdated'
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
                            fullGrid,
                            getContextMenuItems,
                            hasTemplatedColumns,
                            header,
                            id,
                            locals = $scope.locals,
                            seemore_template = 'sky/templates/grids/seemore.html',
                            reorderingColumns,
                            tableBody,
                            tableEl = element.find('table'),
                            tableDomEl = tableEl[0],
                            tableWidth,
                            tableWrapper = element.find('.table-responsive'),
                            toolbarContainer = element.find('.grid-toolbar-container'),
                            toolbarContainerId,
                            verticalOffSetElId,
                            vkActionBarAndBackToTop,
                            vkToolbars,
                            vkHeader,
                            windowEl = $($window),
                            windowWidth;

                        function updateGridLoadedTimestampAndRowCount(count) {
                            $scope.locals.timestamp = new Date().getTime();
                            $scope.locals.rowcount = count;
                        }

                        function mediaBreakpointHandler(newBreakpoints) {
                            breakpoints = newBreakpoints;
                        }

                        function buildColumnClasses(column) {
                            var classes = '';

                            //if this column does not allow search then add the appropriate class. This is used when highlighting search results
                            if (column.exclude_from_search) {
                                classes += "grid-no-search ";
                            }

                            return classes;
                        }

                        function getEmptyString() {
                            return "";
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

                            if (angular.isFunction(getContextMenuItems)) {
                                rowid = options.rowId;
                                menuid = buildMenuId(rowid);
                                items = getContextMenuItems(rowid, rowObject);
                                //cache for later
                                contextMenuItems[rowid] = items;

                                if (items && items.length) {
                                    template =
                                        '<div data-bbauto-field="ContextMenuActions" class="dropdown" id="' + menuid + '">' +
                                        '  <a data-bbauto-field="ContextMenuAnchor" role="button" class="dropdown-toggle sky-icon sky-icon-2x sky-icon-multi-action" data-toggle="dropdown" href=""></a>' +
                                        '  <ul class="dropdown-menu" role="menu" aria-labelledby="' + menuid + '">';

                                    for (i = 0; i < items.length; i++) {
                                        item = items[i];
                                        template += '<li role="presentation"><a id="' + buildActionId(menuid, item) + '" role="menuitem" href="">' + item.title + '</a></li>';
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

                        function buildColumnModel(columns, selectedColumnIds) {
                            var colModel = [],
                                column,
                                index,
                                gridColumn;

                            hasTemplatedColumns = false;

                            for (index = 0; index < selectedColumnIds.length; index++) {
                                column = getColumnById(columns, selectedColumnIds[index]);

                                if (column) {
                                    gridColumn = {
                                        index: column.id.toString(),
                                        sortable: false,
                                        id: column.id,
                                        name: column.name,
                                        label: column.caption,
                                        align: (column.right_align ? 'right' : 'left'),
                                        classes: buildColumnClasses(column),
                                        cellattr: buildCellAttribute,
                                        controller: column.controller,
                                        template_url: column.template_url,
                                        jsonmap: column.jsonmap,
                                        allow_see_more: column.allow_see_more
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
                                }
                            }

                            if (getContextMenuItems) {
                                colModel.unshift({
                                    classes: 'grid-dropdown-cell',
                                    fixed: true,
                                    sortable: false,
                                    name: DROPDOWN_TOGGLE_COLUMN_NAME,
                                    label: ' ',
                                    width: 40,
                                    title: false,
                                    hidedlg: true,
                                    resizable: false,
                                    search: false,
                                    formatter: toggleButtonFormatter
                                });
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
                            var minWidthForColumns,
                                width = tableWrapper.width();

                            //On extra small devices, instead of setting size by parent width use some logic
                            if (breakpoints.xs) {
                                //Calculate the minimum width to use on a small device
                                //based on the number of columns
                                minWidthForColumns = columnCount * 110;
                                if (width <= minWidthForColumns) {
                                    width = minWidthForColumns;
                                }
                            }

                            return width;
                        }

                        function resetGridWidth() {
                            var width = getDesiredGridWidth();
                            if (width > 0) {
                                tableEl.setGridWidth(width);
                            }
                        }

                        function resizeStart() {
                            fullGrid.find('.ui-jqgrid-resize-mark').height(fullGrid.height());
                        }

                        function setSortStyles() {
                            var className,
                                headerElId,
                                sortOptions;

                            if (header) {
                                header.find('th').removeClass('sorting-asc').removeClass('sorting-desc');

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

                        function sortColumn() {
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
                                bbHighlight(tableEl.find("td").not('.grid-no-search'), options.searchText, 'highlight');
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

                        function gridComplete() {
                            //Add padding to the bottom of the grid for any dropdowns in the last row.
                            if (getContextMenuItems) {
                                $('.ui-jqgrid-bdiv').css('padding-bottom', '100px');
                            }
                        }

                        function gridColumnsReordered(orderedColumns) {
                            var i,
                                offset = 0,
                                oldIndex,
                                selectedColumnIds = $scope.options.selectedColumnIds,
                                newSelectedColumnIds = [];

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
                        }

                        function initGrid() {
                            var columns,
                                jqGridOptions,
                                selectedColumnIds,
                                useGridView = true,
                                hoverrows = false;

                            locals.multiselect = false;

                            //Clear reference to the table body since it will be recreated.
                            tableBody = null;

                            //Unload grid if it already exists.
                            tableEl.jqGrid('GridUnload');

                            tableEl = element.find('table');
                            tableDomEl = tableEl[0];

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
                                }
                            }

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
                                    multiselectWidth: 25,
                                    onSelectAll: onSelectAll,
                                    onSelectRow: onSelectRow,
                                    resizeStart: resizeStart,
                                    rowNum: -1,
                                    shrinktofit: true,
                                    sortable: getSortable(),
                                    width: getDesiredGridWidth()
                                };

                                tableEl.jqGrid(jqGridOptions);

                                header = $(tableDomEl.grid.hDiv);

                                //Attach click handler for sorting columns
                                header.find('th').on('click', sortColumn);

                                fullGrid = header.parents('.ui-jqgrid:first');

                                if (vkHeader) {
                                    vkHeader.destroy();
                                }

                                toolbarContainer.show();

                                vkHeader = new bbViewKeeperBuilder.create({
                                    el: header[0],
                                    boundaryEl: fullGrid[0],
                                    verticalOffSetElId: toolbarContainerId
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

                        function setRows(rows) {
                            if (tableDomEl.addJSONData) {
                                loadColumnTemplates(function () {
                                    refreshMultiselect();

                                    destroyCellScopes();

                                    tableDomEl.addJSONData(rows);

                                    $timeout(highlightSearchText);

                                    //Update grid with in case new rows have caused a vertical scrollbar, effecting
                                    //the amount of space we want the grid to take up
                                    resetGridWidth();
                                    updateGridLoadedTimestampAndRowCount(rows.length);
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
                            element.find('.search-container input').select();
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

                        $scope.$watch('options.selectedColumnIds', function (newValue) {
                            var columnChangedData;

                            if (newValue) {
                                if (reorderingColumns) {
                                    reorderingColumns = false;
                                    return;
                                }
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
                        }, true);

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

                        windowWidth = windowEl.width();
                        windowEl.on("resize." + id + ", orientationchange." + id, function () {
                            var newWidth = windowEl.width();
                            if (windowWidth !== newWidth) {
                                windowWidth = newWidth;
                                resetGridWidth();
                            }
                        });

                        bbMediaBreakpoints.register(mediaBreakpointHandler);

                        tableWrapper.on("scroll", function () {
                            if (vkHeader) {
                                vkHeader.syncElPosition();
                            }
                        });

                        tableWidth = tableWrapper.width();
                        tableWrapper.on("resize", function () {
                            var newWidth = tableWrapper.width();
                            if (tableWidth !== newWidth) {
                                tableWidth = newWidth;
                                resetGridWidth();
                            }
                        });

                        element.on('$destroy', function () {
                            windowEl.off("resize." + id + ", orientationchange." + id);

                            if (vkToolbars) {
                                vkToolbars.destroy();
                            }

                            if (vkHeader) {
                                vkHeader.destroy();
                            }

                            if (vkActionBarAndBackToTop) {
                                vkActionBarAndBackToTop.destroy();
                            }

                            tableWrapper.off();

                            bbMediaBreakpoints.unregister(mediaBreakpointHandler);
                        });
                    },
                    templateUrl: 'sky/templates/grids/grid.html'
                };
            }])
        .directive('bbGridFilters', ['$window', 'bbResources', function ($window, bbResources) {
            return {
                require: '^bbGrid',
                replace: true,
                transclude: true,
                restrict: 'E',
                scope: {
                    bbOptions: "="
                },
                controller: ['$scope', function ($scope) {
                    $scope.applyFilters = function () {
                        var args = {},
                            options = $scope.bbOptions;

                        if (options && options.applyFilters) {
                            options.applyFilters(args);
                        }

                        $scope.updateFilters(args.filters);
                    };

                    $scope.clearFilters = function () {
                        var args = {},
                            options = $scope.bbOptions;

                        if (options && options.clearFilters) {
                            options.clearFilters(args);
                        }

                        $scope.updateFilters(args.filters);
                    };
                }],
                link: function ($scope, element, attrs, bbGrid) {
                    /*jslint unparam: true */
                    var box = element.find('.grid-filters-box'),
                        filtersContainer = element.find('.grid-filters-container');

                    $scope.viewKeeperOptions = {};

                    bbGrid.viewKeeperChangedHandler = function (val) {
                        $scope.viewKeeperOptions.viewKeeperOffsetElId = val;
                    };

                    bbGrid.toggleFilterMenu = function () {
                        $scope.expanded = !$scope.expanded;
                        if ($scope.expanded) {
                            $window.BBHELP.HelpWidget.close();
                        }
                    };

                    bbGrid.openFilterMenu = function () {
                        $scope.expanded = true;
                    };

                    bbGrid.scope.$watch('gridCreated', function (newValue) {
                        if (newValue) {
                            element.show();
                        }
                    });

                    $scope.updateFilters = function (filters) {
                        bbGrid.setFilters(filters);
                    };

                    $scope.resources = bbResources;

                    $scope.$watch('expanded', function (newValue, oldValue) {
                        var animationDuration = 250;

                        if (newValue !== oldValue) {
                            if (newValue) {
                                box.css('left', '240px');
                                filtersContainer.show();
                                box.animate({ 'left': '0' }, animationDuration);
                            } else {
                                box.animate({ 'left': '240px' }, {
                                    duration: animationDuration,
                                    complete: function () {
                                        box.css('left', '0');
                                        filtersContainer.hide();
                                    }
                                });
                            }
                        }
                    });
                },
                templateUrl: 'sky/templates/grids/filters.html'
            };
        }])
        .directive('bbGridFiltersGroup', function () {
            return {
                replace: true,
                transclude: true,
                restrict: 'E',
                scope: {
                    bbGridFiltersGroupLabel: '=',
                    isCollapsed: '=?bbGridFiltersGroupIsCollapsed'
                },
                templateUrl: 'sky/templates/grids/filtersgroup.html'
            };
        })
        .directive('bbGridFiltersSummary', ['bbResources', function (bbResources) {
            return {
                require: '^bbGrid',
                replace: true,
                transclude: true,
                restrict: 'E',
                scope: {
                    bbOptions: "="
                },
                controller: ['$scope', function ($scope) {
                    $scope.clearFilters = function () {
                        var args = {},
                            options = $scope.bbOptions;

                        if (options && options.clearFilters) {
                            options.clearFilters(args);
                        }

                        $scope.updateFilters(args.filters);
                    };

                    $scope.resources = bbResources;
                }],
                link: function ($scope, element, attrs, bbGrid) {
                    /*jslint unparam: true */
                    var toolbarContainer = element.parents('.bb-grid-container').find('.grid-toolbar-container');

                    toolbarContainer.append(element);

                    $scope.updateFilters = function (filters) {
                        bbGrid.setFilters(filters);
                    };

                    $scope.openFilterMenu = function () {
                        if (bbGrid.openFilterMenu) {
                            bbGrid.openFilterMenu();
                        }
                    };

                    $scope.$watch(function () { return element.is(':visible'); }, function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            bbGrid.syncViewKeepers();
                        }
                    });
                },
                templateUrl: 'sky/templates/grids/filterssummary.html'
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
                                $timeout(function () { bbGrid.syncActionBarViewKeeper(); });
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
/*jslint browser: true, plusplus: true */
/*global angular, jQuery */

(function () {
    'use strict';

    angular.module('sky.helpbutton', [])
        .directive('bbHelpButton', ['$state', function ($state) {
            /// <summary>
            /// This directive provides a button that launches the Blackbaud Help Widget.
            /// The bbHelpKey attribute sets the help key. The widget will show the given key's corresponding help page
            /// The bbSetHelpKeyOverride attribute, when set to "true", makes this directive's help key override the current page help key.
            ///     The help key override will be removed when the directive is removed from the page.
            /// </summary>

            function link(scope, el, attrs) {
                /*jslint unparam: true */
                var oldHelpKeyOverride;

                el.addClass('bb-helpbutton fa fa-question-circle close');

                if (attrs.bbSetHelpKeyOverride && attrs.bbSetHelpKeyOverride.toLowerCase() === 'true') {
                    oldHelpKeyOverride = $state.current.helpKeyOverride;
                    $state.current.helpKeyOverride = attrs.bbHelpKey;

                    el.on("remove", function () {
                        $state.current.helpKeyOverride = oldHelpKeyOverride;
                    });
                }

                el.click(function () {
                    window.BBHELP.HelpWidget.open(attrs.bbHelpKey);
                });
            }

            return {
                link: link
            };
        }]);

}());

/*jslint browser: true, plusplus: true */
/*global angular, jQuery */

(function () {
    'use strict';

    angular.module('sky.helpwidget', [])
        .constant('bbHelpwidgetConfig', {
            productId: 'Sky',
            customLocales: [],
            url: null
        })
        .directive('bbHelpwidget', ['$state', 'bbHelpwidgetConfig', function ($state, bbHelpwidgetConfig) {

            function loadHelpWidget($state) {
                if (!bbHelpwidgetConfig.url) {
                    throw "bbHelpwidgetConfig.url is not defined.";
                }

                jQuery.ajax({
                    cache: true,
                    dataType: 'script',
                    url: bbHelpwidgetConfig.url
                }).done(function () {
                    window.BBHELP.HelpWidget.load({
                        product: bbHelpwidgetConfig.productId,
                        customLocales: bbHelpwidgetConfig.customLocales,
                        getCurrentHelpKey: function () {
                            // $state.current.helpKeyOverride outranks $state.current.pageData.helpKey
                            if ($state.current.helpKeyOverride) {
                                return $state.current.helpKeyOverride;
                            }

                            if ($state.current.pageData) {
                                return $state.current.pageData.helpKey;
                            }
                            return null;
                        }
                    });
                });
            }

            return {
                link: function () {
                    loadHelpWidget($state);
                }
            };
        }]);

}());

/*jslint browser: true, plusplus: true */
/*global angular */

(function () {
    'use strict';

    angular.module('sky.highlight', [])
        .factory('bbHighlight', function () {
            // Copied and modified from here so we don't have yet another jQuery plugin dependency.
            // http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html
            function highlight(el, pat, classn) {
                function innerHighlight(node, pat) {
                    var pos,
                        skip = 0,
                        spannode,
                        middlebit,
                        i,
                        middleclone;

                    if (node.nodeType === 3) {
                        pos = node.data.toUpperCase().indexOf(pat);
                        if (pos >= 0) {
                            classn = classn || 'highlight';

                            spannode = document.createElement('span');
                            spannode.className = String(classn);
                            middlebit = node.splitText(pos);
                            middlebit.splitText(pat.length);
                            middleclone = middlebit.cloneNode(true);
                            spannode.appendChild(middleclone);
                            middlebit.parentNode.replaceChild(spannode, middlebit);
                            skip = 1;
                        }
                    } else if (node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
                        for (i = 0; i < node.childNodes.length; ++i) {
                            i += innerHighlight(node.childNodes[i], pat);
                        }
                    }
                    return skip;
                }

                return el.length && pat && pat.length ? el.each(function () {
                    innerHighlight(this, pat.toUpperCase());
                }) : el;
            }

            function removeHighlight(el) {
                return el.find("span.highlight").each(function () {
                    var parentNode = this.parentNode;

                    parentNode.replaceChild(this.firstChild, this);
                    parentNode.normalize();
                }).end();
            }

            highlight.clear = removeHighlight;

            return highlight;
        })
        .directive('bbHighlight', ['bbHighlight', function (bbHighlight) {
            return {
                link: function (scope, el) {
                    function highlight() {
                        bbHighlight.clear(el);

                        if (scope.highlightText) {
                            bbHighlight(el, scope.highlightText);
                        }
                    }

                    scope.$watch('highlightText', function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            highlight();
                        }
                    });

                    scope.$watch('beacon', function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            scope.$evalAsync(highlight);
                        }
                    }, true);
                },
                restrict: 'A',
                scope: {
                    highlightText: '=bbHighlight',
                    beacon: '=bbHighlightBeacon'
                }
            };
        }]);
}());
/*global angular, define, enquire, require */
(function (window) {
    'use strict';

    var XS_MEDIA_QUERY = '(max-width: 767px)',
        SM_MEDIA_QUERY = '(min-width: 768px) and (max-width: 991px)',
        MD_MEDIA_QUERY = '(min-width: 992px) and (max-width: 1199px)',
        LG_MEDIA_QUERY = '(min-width: 1200px)',
        bp = {},
        handlers = [],
        mediaBreakpoints;

    function updateStatus(newSize) {
        var handler,
            i;

        bp.xs = bp.sm = bp.md = bp.lg = false;
        bp[newSize] = true;

        for (i = 0; i < handlers.length; i += 1) {
            handler = handlers[i];
            if (handler) {
                handler(bp);
            }
        }
    }

    (function (register) {
        if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            require(['enquire'], register);
        } else if (window.enquire) {
            // Browser globals
            register(enquire);
        }
    }(function (enquire) {
        enquire.register(XS_MEDIA_QUERY, function () { updateStatus('xs'); });
        enquire.register(SM_MEDIA_QUERY, function () { updateStatus('sm'); });
        enquire.register(MD_MEDIA_QUERY, function () { updateStatus('md'); });
        enquire.register(LG_MEDIA_QUERY, function () { updateStatus('lg'); });
    }));


    mediaBreakpoints = {
        register: function (callback) {
            handlers.push(callback);

            //Fire handler immediately
            callback(bp);
        },

        unregister: function (callback) {
            var i;

            for (i = 0; i < handlers.length; i += 1) {
                if (handlers[i] === callback) {
                    handlers.splice(i, 1);
                    break;
                }
            }
        },

        getCurrent: function () {
            return bp;
        }
    };

    angular.module('sky.mediabreakpoints', [])
        .factory('bbMediaBreakpoints', function () {
            return mediaBreakpoints;
        });
}(this));
/*jslint browser: true, plusplus: true */
/*global angular */

(function () {
    'use strict';

    angular.module('sky.modal', [])
        .factory('bbModal', ['$modal', function ($modal) {
            return {
                open: function (opts) {
                    // Change default values for modal options
                    opts = angular.extend({
                        backdrop: 'static'
                    }, opts);

                    return $modal.open(opts);
                }
            };
        }])
        .directive('bbModal', function () {
                return {
                    controller: angular.noop,
                    replace: true,
                    transclude: true,
                    restrict: 'E',
                    template: '<div class="bb-modal-content-wrapper" ng-transclude></div>'
                };
        })
        .directive('bbModalBody', function () {
            return {
                restrict: 'A',
                template: function (el) {
                    el.addClass('modal-body');
                }
            };
        })
        .directive('bbModalHeader', function () {
            return {
                controller: angular.noop,
                replace: true,
                transclude: true,
                require: '^bbModal',
                restrict: 'E',
                templateUrl: 'sky/templates/modals/modalheader.html',
                scope: {
                    bbModalHelpKey: '='
                }
            };
        })
        .directive('bbModalFooter', function () {
            return {
                controller: angular.noop,
                replace: true,
                transclude: true,
                require: '^bbModal',
                restrict: 'E',
                template: '<div class="modal-footer" ng-transclude></div>'
            };
        })
        .directive('bbModalFooterButton', function () {
            return {
                replace: true,
                transclude: true,
                require: '^bbModalFooter',
                restrict: 'E',
                template: '<button class="btn btn-white" type="button" ng-transclude></button>'
            };
        })
        .directive('bbModalFooterButtonPrimary', ['bbResources', function (bbResources) {
            return {
                replace: true,
                transclude: true,
                require: '^bbModalFooter',
                restrict: 'E',
                template: '<button class="btn btn-primary" type="submit" ng-transclude></button>',
                link: function ($scope, el) {
                    if (el.children().length === 0) {
                        el.append("<span>" + bbResources.modal_footer_primary_button + "</span>");
                    }
                }
            };
        }])
        .directive('bbModalFooterButtonCancel', ['bbResources', function (bbResources) {
            return {
                replace: true,
                transclude: true,
                require: '^bbModalFooter',
                restrict: 'E',
                template: '<button class="btn btn-white" type="button" ng-click="$parent.$parent.$dismiss(\'cancel\');" ng-transclude></button>',
                link: function ($scope, el) {
                    if (el.children().length === 0) {
                        el.append("<span>" + bbResources.modal_footer_cancel_button + "</span>");
                    }
                }
            };
        }])
}());

/*jslint browser: true, plusplus: true */
/*global angular */

(function () {
    'use strict';

    angular.module('sky.money', [])
        .constant('bbMoneyConfig', {
            currencyPositivePattern: '$n',
            currencyDecimalDigits: 2,
            currencyDecimalSeparator: '.',
            currencyGroupSize: 3,
            currencyGroupSeparator: ',',
            currencySymbol: '$'
        })
        .directive('bbMoneyInput', ['$timeout', 'bbMoneyConfig', function ($timeout, bbMoneyConfig) {
            return {
                restrict: 'A',
                scope: {
                    numericValue: '=bbMoneyInput'
                },
                link: function ($scope, element) {
                    var currencySymbol = bbMoneyConfig.currencySymbol,
                        currencySymbolPlacement;

                    //Derive some options based on the currency formatting pattern from the server.
                    switch (bbMoneyConfig.currencyPositivePattern) {
                    case 0: //$n
                        currencySymbolPlacement = 'p'; //prefix
                        break;
                    case 1: //n$
                        currencySymbolPlacement = 's'; //suffix
                        break;
                    case 2: //$ n
                        currencySymbolPlacement = 'p'; //prefix
                        currencySymbol += ' ';
                        break;
                    case 3: //n $
                        currencySymbolPlacement = 's'; //suffix
                        currencySymbol = ' ' + currencySymbol;
                        break;
                    }

                    element.autoNumeric({
                        aSep: bbMoneyConfig.currencyGroupSeparator,
                        dGroup: bbMoneyConfig.currencyGroupSize,
                        aDec: bbMoneyConfig.currencyDecimalSeparator,
                        aSign: currencySymbol,
                        pSign: currencySymbolPlacement,
                        mDec: bbMoneyConfig.currencyDecimalDigits
                    });

                    //Setup on change handler to update scope value
                    element.change(function () {
                        var value = parseFloat(element.autoNumeric('get'));
                        $scope.numericValue = value;
                        $scope.$apply();
                    });

                    //When focusing in textbox, select all.  This is to workaround not having placeholder text for autonumeric.
                    element.on('focus.bbMoneyInput', function () {
                        $timeout(function () {
                            element.select();
                        });
                    });

                    $scope.$watch('numericValue', function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            if (newValue !== undefined && newValue !== null) {
                                element.autoNumeric('set', newValue);
                            } else {
                                element.val(null);
                            }
                        }
                    });
                }
            };
        }]);
}());

/*global angular, BBAUTH, jQuery */

(function ($) {
    'use strict';

    angular.module('sky.omnibar', [])
        .constant('bbOmnibarConfig', {
            appLookupUrl: '',
            enableHelp: false,
            enableSearch: false,
            productId: 'Sky',
            searchPlaceholder: 'Search',
            serviceName: 'Sky',
            signOutUrl: '',
            tenantId: '',
            url: '//signin.blackbaud.com/omnibar.js'
        })
        .directive('bbOmnibar', ['$window', 'bbOmnibarConfig', function ($window, bbOmnibarConfig) {
            return {
                transclude: true,
                template: '<div class="bb-omnibar-wrap"></div><div class="bb-omnibar-menu-wrap" ng-transclude></div>',
                link: function (scope, el) {
                    var omnibarEl = el.children('.bb-omnibar-wrap'),
                        omnibarMenuEl = el.find('.bb-omnibar-menu-wrap .bb-omnibar-menu');

                    function afterLoad() {
                        var searchBox = omnibarEl.find('.searchbox'),
                            searchContainer = omnibarEl.find('.searchContainer'),
                            searchValue;

                        // No longer need this holding div now that the menu was moved into the right location in the omnibar.
                        el.children(".bb-omnibar-menu-wrap").remove();

                        if (omnibarEl.find(".mobile .productmenucontainer").length === 0) {
                            $(".nav-wrap").addClass("nav-wrap-showmobile");
                        }

                        searchBox.attr('placeholder', bbOmnibarConfig.searchPlaceholder);

                        scope.searchBox = searchBox;

                        searchBox.on('keyup', function (event) {
                            var value = searchBox.val();

                            if (value !== searchValue) {
                                searchValue = value;

                                scope.searchText = value;
                                scope.$apply();
                            }

                            scope.$emit('searchBoxKeyUp', event.keyCode);
                        });

                        scope.$watch('searching', function (searching) {
                            if (searching) {
                                searchContainer.addClass('searching');
                            } else {
                                searchContainer.removeClass('searching');
                            }
                        });

                        scope.$watch('searchText', function (searchText) {
                            searchText = searchText || '';
                            if (searchText !== searchBox.val()) {
                                searchValue = searchText;
                                searchBox.val(searchText);
                            }
                        });

                        scope.$apply();
                    }

                    function userLoaded(userData) {
                        //If the user ID loaded in the omnibar does not match the user who loaded the page, sign the
                        //user out of the application.  This will result in a redirect back to the auth size to update
                        //the user's claims or ask the user to log back in.
                        if (userData.id !== bbOmnibarConfig.authenticationUserId && bbOmnibarConfig.signOutUrl) {

                            if (userData.id === null) {
                                //If userData.id ==null then it may just means the omnibar is stale or there was a problem
                                //with the interaction of the omnibar and the rex shell SPA client side code.
                                //
                                //If we can use localStorage to track data across sessions, then attempt to log out of NXT once
                                //and see if this fixes it, but avoid an infinite redirect loop with the Auth Svc.
                                //
                                //If the browser doesn't support localStorage, then just return.
                                //
                                //If we don't back to the auth sign in site here, then it will just stay on the current page
                                //with the understanding that the omnibar may be in a state of acting as though the user
                                //is signed out.  The page is still secure because the Auth claims are evaluated on the server.
                                //This special case is just about dealing with an edge case issue with client side javascript.
                                if ($window.localStorage) {
                                    var omnibarIndicatesNullUserTime = $window.localStorage.omnibarIndicatesNullUserTime;
                                    if (omnibarIndicatesNullUserTime && (new Date() - Date.parse(omnibarIndicatesNullUserTime)) / 1000 <= 10) {
                                        // We just looped through Auth within the last 10 seconds, so don't leave again now.
                                        return;
                                    }

                                    try {
                                        // Stash the time that we're doing this redirect to avoid infinite loops.
                                        $window.localStorage.omnibarIndicatesNullUserTime = (new Date()).toString();
                                    } catch (e) {
                                        // Safari private browsing will throw an exception on setting localStroage.
                                        return;
                                    }
                                } else {
                                    return;
                                }
                            }

                            // Log out and redirec to auth service.
                            $window.location.href = bbOmnibarConfig.signOutUrl;
                        }
                    }

                    $.ajax({
                        cache: true,
                        dataType: 'script',
                        url: bbOmnibarConfig.url
                    }).done(function () {
                        BBAUTH.Omnibar.load(
                            omnibarEl,
                            {
                                appLookupUrl: bbOmnibarConfig.appLookupUrl,
                                serviceName: bbOmnibarConfig.serviceName,
                                signOutRedirectUrl: bbOmnibarConfig.signOutRedirectUrl,
                                enableSearch: bbOmnibarConfig.enableSearch,
                                afterLoad: afterLoad,
                                userLoaded: userLoaded,
                                productId: bbOmnibarConfig.productId,
                                tenantId: bbOmnibarConfig.tenantId,
                                enableHelp: bbOmnibarConfig.enableHelp,
                                menuEl: omnibarMenuEl
                            }
                        );
                    });
                }
            };
        }])
        .directive('bbOmnibarMenu', function () {
            return {
                replace: true,
                require: '^bbOmnibar',
                restrict: 'E',
                transclude: true,
                template: '<div class="bb-omnibar-menu" ng-transclude></div>'
            };
        });
}(jQuery));

/*global angular */

(function () {
    'use strict';

    var evtNsPos = 0;

    angular.module('sky.pagination', ['ui.bootstrap.pagination'])
        .config(['paginationConfig', function (paginationConfig) {
            paginationConfig.maxSize = 4;
            paginationConfig.itemsPerPage = 5;

            paginationConfig.nextText = paginationConfig.previousText = '';
        }])
        .factory('bbPaging', function () {
            return {
                init: function (sourceData, config) {
                    var paging;

                    function setPageData() {
                        var startingIndex,
                            currentPage;

                        if (!paging.disabled && sourceData) {
                            currentPage = paging.currentPage - 1; // 1-based

                            startingIndex = currentPage * paging.itemsPerPage;
                            paging.items = sourceData.slice(startingIndex, startingIndex + paging.itemsPerPage);
                        }
                    }

                    paging = {
                        currentPage: 1,
                        itemsPerPage: 5,
                        totalItems: sourceData ? sourceData.length : 0,
                        pageChanged: setPageData
                    };

                    angular.extend(paging, config);

                    setPageData();

                    return paging;
                }
            };
        })
        .directive('bbPagination', function () {
            return {
                restrict: 'A',
                scope: {
                    paginationDisabled: '=bbPaginationDisabled'
                },
                compile: function (el, attrs) {
                    var pagedData = attrs.bbPagination;

                    /*jslint white: true */
                    el.html(
                        '<pagination ng-show="' + pagedData + '.totalItems > ' + pagedData + '.itemsPerPage" total-items="' + pagedData + '.totalItems" ng-model="' + pagedData + '.currentPage" ng-change="' + pagedData + '.pageChanged()" items-per-page="' + pagedData + '.itemsPerPage"></pagination>' +
                        '<div class="clearfix"></div>'
                    );
                    /*jslint white: false */

                    return function (scope, el) {
                        scope.$watch('paginationDisabled', function (newValue) {
                            var paginationDummyEl,
                                paginationEl;

                            // Since we don't have complete control over the Angular Bootstrap UI pagination directive,
                            // we can't disable it directly.  Instead just clone the pagination element, disable it
                            // and show it while hiding the original element when pagination is disabled.
                            if (angular.isDefined(newValue)) {
                                paginationEl = el.find('.pagination');

                                if (newValue) {
                                    paginationDummyEl = paginationEl
                                        .clone()
                                        .addClass('bb-pagination-dummy');

                                    paginationEl
                                        .before(paginationDummyEl)
                                        .hide();

                                    paginationDummyEl.find('li').addClass('disabled');
                                } else {
                                    el.find('.bb-pagination-dummy').remove();
                                    paginationEl.show();
                                }
                            }
                        });
                    };
                }
            };
        })
        .directive('bbPaginationContent', ['$timeout', '$window', function ($timeout, $window) {
            return {
                link: function (scope, el) {
                    var evtNs;

                    evtNsPos += 1;

                    evtNs = "bbPaginationContent" + evtNsPos;

                    function removeWindowResizeHandler() {
                        angular.element($window).off('.' + evtNs);
                    }

                    scope.$watch('pagedData', function () {
                        var pageCount,
                            pagedData,
                            tries = 0,
                            windowResizeTimeout;

                        // Try for 1 second to set a min-height on paged data so the paging bar doesn't jump
                        // up when the user hits a page with less than the max number of items.
                        function trySetMinHeight() {
                            $timeout(function () {
                                var currentPage,
                                    height = el.height(),
                                    i,
                                    maxHeight = 0;

                                function changePage(pageNumber) {
                                    pagedData.currentPage = pageNumber;
                                    pagedData.pageChanged();

                                    scope.$apply();
                                }

                                if (pageCount <= 1) {
                                    return;
                                }

                                if (height === 0 && tries < 5) {
                                    tries += 1;
                                    trySetMinHeight();
                                    return;
                                }

                                el.addClass('bb-pagination-content bb-pagination-content-calculating');

                                // Cache the current page so we can put it back.
                                currentPage = pagedData.currentPage;

                                // Reset the min height from any previous iteration.
                                el.css('min-height', 0);

                                // Navigate through each page and find the tallest page.
                                for (i = 1; i <= pageCount; i += 1) {
                                    changePage(i);
                                    maxHeight = Math.max(el.height(), maxHeight);
                                }

                                // Set the min height to the height of the tallest page.
                                el.css('min-height', maxHeight);

                                // Navigate back to the initial page.
                                changePage(currentPage);

                                el.removeClass('bb-pagination-content-calculating');
                            }, 200);
                        }

                        pagedData = scope.pagedData;

                        if (angular.isDefined(scope.pagedData)) {
                            pageCount = Math.ceil(pagedData.totalItems / (pagedData.itemsPerPage || 1));

                            if (pageCount > 1) {
                                trySetMinHeight();

                                removeWindowResizeHandler();

                                angular.element($window).on('resize.' + evtNs, function () {
                                    if (windowResizeTimeout) {
                                        $timeout.cancel(windowResizeTimeout);
                                    }

                                    windowResizeTimeout = $timeout(trySetMinHeight, 500);
                                });

                                el.on('$destroy', removeWindowResizeHandler);
                            }
                        }
                    });
                },
                scope: {
                    pagedData: '=bbPaginationContent'
                }
            };
        }]);
}());
/*global angular */

(function ($) {
    'use strict';

    angular.module('sky.popover', ['sky.data'])
        .directive('bbPopoverTemplatePopup', ['$templateCache', '$compile', '$timeout', function ($templateCache, $compile, $timeout) {
            return {
                restrict: 'EA',
                replace: true,
                scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
                templateUrl: 'sky/templates/popover/popup.html',
                compile: function () {
                    return function ($scope, el) {
                        var compiledEl,
                            html = $templateCache.get($scope.content),
                            popupScope,
                            origScope = $scope.$parent.$parent.$parent;

                        function removeTooltip() {
                            if (el) {
                                el.remove();
                                el = null;
                            }
                            if (popupScope) {
                                popupScope.$destroy();
                                popupScope = null;
                            }
                        };

                        popupScope = origScope.$new();
                        popupScope.hide = function () {
                            $scope.$parent.$parent.isOpen = false;

                            //Borrowed from $tooltip, need to remove the item after the animation
                            $timeout(removeTooltip, 500);
                        };

                        compiledEl = $compile(html)(popupScope);
                        el.find('.popover-content').html(compiledEl);
                        popupScope.$apply();
                    };
                }
            };
        }])
        .directive('bbPopoverTemplate', ['$tooltip', function ($tooltip) {
            return $tooltip('bbPopoverTemplate', 'popover', 'click');
        }]);
}(jQuery));
/*global angular */

(function () {
    'use strict';

    var serviceModules = [];

    angular.module('sky.resources', serviceModules)
        .factory('bbResources', function () {
            return {
                'checklist_select_all': 'Select all', // Text for the link in a checklist to select all items.
                'checklist_clear_all': 'Clear all', // Text for the link in a checklist to clear selections.
                'checklist_no_items': 'No items found', // Text in a checklist when no items are shown based on the current filter.
                'grid_back_to_top': 'Back to top', // Text for link in grid to scroll back to the top.
                'grid_column_picker_all_categories': 'All', // Button text for category filters used to indicate that all columns should be shown in the column picker
                'grid_column_picker_description_header': 'Description', // In the column picker, the header for the column showing the description of the columns to include in the grid.
                'grid_column_picker_header': 'Choose columns to show in the list', // Header text for the grid column picker screen
                'grid_column_picker_name_header': 'Column', // In the column picker, the header for the column showing the names of the columns to include in the grid.
                'grid_column_picker_search_placeholder': 'Search by name', // Search text placeholder for the search box on the grid column picker
                'grid_column_picker_submit': 'Apply changes', // Button text for applying changes made in the grid column picker
                'grid_columns_button': ' Choose columns', // Label for button to select columns to display in a grid.
                'grid_filters_apply': 'Apply filters', // Text for button on filters flyout to apply the selected filters to the grid
                'grid_filters_button': 'Filters', // Label for button to select filters to be applied to a grid.
                'grid_filters_clear': 'Clear', // Text for button on filters flyout to clear the selected filters for the grid
                'grid_filters_header': 'Filter', // Header text for grid filters flyout
                'grid_filters_hide': 'Hide', // Hide link text for grid filters flyout
                'grid_filters_summary_header': 'Filter:', // Header text for filter summary on top of grid
                'grid_load_more': 'Load more', // The text for the button to load additional rows into the grid if more rows are available.
                'grid_search_placeholder': 'Find in this list', // Placeholder text in grid search box
                'modal_footer_cancel_button': 'Cancel', // Default lable text for modal cancel button
                'modal_footer_primary_button': 'Save', // Default lable text for modal primary button
                'month_short_april': 'Apr',
                'month_short_august': 'Aug',
                'month_short_december': 'Dec',
                'month_short_february': 'Feb',
                'month_short_january': 'Jan',
                'month_short_july': 'Jul',
                'month_short_june': 'Jun',
                'month_short_march': 'Mar',
                'month_short_may': 'May',
                'month_short_november': 'Nov',
                'month_short_october': 'Oct',
                'month_short_september': 'Sep',
                'text_expand_see_less': 'See less', // Display less text content
                'text_expand_see_more': 'See more',
                'grid_action_bar_clear_selection': 'Clear selection', // Clear the selections in the grid.
                'grid_action_bar_cancel_mobile_actions': 'Cancel', // Close the menu where you choose an action in mobile multiselect.
                'grid_action_bar_choose_action': 'Choose an action', // Open a menu to choose an action in mobile  multiselect.
                'date_field_invalid_date_message': 'Please enter a valid date', // error message shown when an invalid date is entered.
                'date_range_picker_this_week': 'This week', //text for date range picker
                'date_range_picker_last_week': 'Last week', //text for date range picker
                'date_range_picker_next_week': 'Next week', //text for date range picker
                'date_range_picker_this_month': 'This month', //text for date range picker
                'date_range_picker_last_month': 'Last month', //text for date range picker
                'date_range_picker_next_month': 'Next month', //text for date range picker
                'date_range_picker_this_calendar_year': 'This calendar year', //text for date range picker
                'date_range_picker_last_calendar_year': 'Last calendar year', //text for date range picker
                'date_range_picker_next_calendar_year': 'Next calendar year', //text for date range picker
                'date_range_picker_this_fiscal_year': 'This fiscal year', //text for date range picker
                'date_range_picker_last_fiscal_year': 'Last fiscal year', //text for date range picker
                'date_range_picker_next_fiscal_year': 'Next fiscal year', //text for date range picker
                'date_range_picker_this_quarter': 'This quarter', //text for date range picker
                'date_range_picker_last_quarter': 'Last quarter', //text for date range picker
                'date_range_picker_next_quarter': 'Next quarter', //text for date range picker
                'date_range_picker_at_any_time': 'At any time', //text for date range picker
                'date_range_picker_today': 'Today', //text for date range picker
                'date_range_picker_tomorrow': 'Tomorrow', //text for date range picker
                'date_range_picker_yesterday': 'Yesterday', //text for date range picker
                'date_range_picker_filter_description_this_week': '{0} for this week', //text for date range picker
                'date_range_picker_filter_description_last_week': '{0} from last week', //text for date range picker
                'date_range_picker_filter_description_next_week': '{0} for next week', //text for date range picker
                'date_range_picker_filter_description_this_month': '{0} for this month', //text for date range picker
                'date_range_picker_filter_description_last_month': '{0} from last month', //text for date range picker
                'date_range_picker_filter_description_next_month': '{0} for next month', //text for date range picker
                'date_range_picker_filter_description_this_calendar_year': '{0} for this calendar year', //text for date range picker
                'date_range_picker_filter_description_last_calendar_year': '{0} from last calendar year', //text for date range picker
                'date_range_picker_filter_description_next_calendar_year': '{0} for next calendar year', //text for date range picker
                'date_range_picker_filter_description_this_fiscal_year': '{0} for this fiscal year', //text for date range picker
                'date_range_picker_filter_description_last_fiscal_year': '{0} from last fiscal year', //text for date range picker
                'date_range_picker_filter_description_next_fiscal_year': '{0} for next fiscal year', //text for date range picker
                'date_range_picker_filter_description_this_quarter': '{0} for this quarter', //text for date range picker
                'date_range_picker_filter_description_last_quarter': '{0} from last quarter', //text for date range picker
                'date_range_picker_filter_description_next_quarter': '{0} for next quarter', //text for date range picker
                'date_range_picker_filter_description_at_any_time': '{0} at any time', //text for date range picker
                'date_range_picker_filter_description_today': '{0} for today', //text for date range picker
                'date_range_picker_filter_description_yesterday': '{0} from yesterday', //text for date range picker
                'date_range_picker_filter_description_tomorrow': '{0} for tomorrow' //text for date range picker
            };
        });
}());
/*jslint plusplus: true */
/*global angular */

(function () {
    'use strict';

    var RETRY_INTERVAL = 100,
        RETRY_MAX = 10;

    angular.module('sky.scrollintoview', [])
        .constant('bbScrollIntoViewConfig', {
            reservedBottom: 0,
            reservedTop: 0
        })
        .factory('bbScrollIntoView', ['$window', function ($window) {
            function scrollIntoView(el, options) {
                var currentScrollTop,
                    elBottom,
                    elHeight,
                    elOffset,
                    elTop,
                    isScrolledOffBottom,
                    isScrolledOffTop,
                    newScrollTop,
                    reservedBottom,
                    reservedTop,
                    viewportHeight,
                    windowHeight,
                    windowEl;

                windowEl = angular.element($window);

                options = options || {};
                reservedBottom = options.reservedBottom || 0;
                reservedTop = options.reservedTop || 0;

                elOffset = el.offset();
                elHeight = el.outerHeight();

                elTop = elOffset.top;
                elBottom = elTop + elHeight;

                windowHeight = windowEl.height();
                currentScrollTop = windowEl.scrollTop();

                isScrolledOffBottom = elBottom > windowHeight + (currentScrollTop - reservedBottom);
                isScrolledOffTop = elTop < (currentScrollTop + reservedTop);

                if (isScrolledOffBottom || isScrolledOffTop) {
                    if (isScrolledOffBottom) {
                        newScrollTop = elBottom - (windowHeight + reservedBottom);
                    }

                    viewportHeight = windowHeight - (reservedTop + reservedBottom);

                    if (!isScrolledOffBottom || newScrollTop + elHeight > viewportHeight) {
                        newScrollTop = elTop - reservedTop;
                    }

                    angular.element('html, body').animate(
                        {
                            scrollTop: newScrollTop
                        },
                        {
                            duration: 250
                        }
                    );
                }
            }

            return scrollIntoView;
        }])
        .directive('bbScrollIntoView', ['$timeout', 'bbScrollIntoViewConfig', 'bbScrollIntoView', function ($timeout, bbScrollIntoViewConfig, bbScrollIntoView) {
            function link(scope, el) {
                var previousTimeout,
                    retryCount;

                function doScroll(firstTry) {
                    if (previousTimeout) {
                        // Make sure any pending scrolling is canceled.
                        $timeout.cancel(previousTimeout);
                    }

                    if (firstTry) {
                        retryCount = 0;
                    }

                    if (el.is(':visible') && el.children('.collapsing').length === 0) {
                        bbScrollIntoView(el, bbScrollIntoViewConfig);
                    } else if (retryCount < RETRY_MAX) {
                        // Keep trying to scroll until the element is visible or we run out of retry attempts.
                        retryCount++;
                        previousTimeout = $timeout(doScroll, RETRY_INTERVAL);
                    }
                }

                scope.$watch('trigger', function (newValue, oldValue) {
                    if (newValue && !oldValue) {
                        doScroll(true);
                    }
                });
            }

            return {
                link: link,
                restrict: 'A',
                scope: {
                    trigger: '=bbScrollIntoView'
                }
            };
        }]);
}());
/*jslint browser: true, plusplus: true */
/*global angular */

(function () {
    'use strict';

    var elIdSuffix = 0;

    function createListAnchorItem(id, automationId) {
        var automationAttribute;
        if (automationId) {
            automationAttribute = ' data-bbauto-field="' + automationId + '"';
        }
        return '<li><a href="#' + id + '"' + automationAttribute + '></a></li>';
    }

    function createGroupHeaderDiv() {
        return '<div class="rt-tab-accordion-header"></div>';
    }

    function createTabContentDiv(content, id) {
        var tabContentEl = angular.element(content).wrap('<div id="' + id + '"></div>');
        tabContentEl.append('<div class="clearfix"></div>');

        return angular.element("#" + id);
    }

    function getResponsiveTabHeader(headerCount, headerTitle) {
        var header =
            '<div>' +
            '<span class="bb-tab-header-title-responsive">' + (headerTitle || '') + '</span>' +
            '<span class="bb-tab-header-count-responsive">' + (headerCount >= 0 ? headerCount : '') + '</span>' +
            '<div class="bb-tab-header-chervon-responsive glyphicon glyphicon-chevron-down"></div>' +
            '<div class="bb-tab-header-chervon-responsive glyphicon glyphicon-chevron-up"></div>' +
            '</div>';
        return header;
    }

    function getTabHeader(headerCount, headerTitle) {
        var header =
            '<div>' +
            '<span class="bb-tab-header-title">' + (headerTitle || '') + '</span>' +
            '<span class="bb-tab-header-count">' + (headerCount >= 0 ? headerCount : '') + '</span>' +
            '</div>';
        return header;
    }

    angular.module('sky.tabs', [])
        .directive('bbTab', ['$state', '$rootScope',
            function ($state, $rootScope) {
                return {
                    replace: true,
                    transclude: true,
                    restrict: 'E',
                    templateUrl: 'sky/templates/tabs/tab.html',
                    scope: {
                        bbTabAutomationId: '=',
                        bbTabOptions: '='
                    },
                    controller: ['$scope', function ($scope) {
                        $scope.tabGroups = [];
                        $scope.tabsInitialized = false;

                        this.addTabGroup = function (group) {
                            $scope.tabGroups.push(group);
                        };

                        this.updateTabItemHeader = function (item) {
                            $scope.updateTabItemHeader(item);
                        };
                    }],
                    link: function ($scope, element) {
                        var activeTab = null,
                            nextTabIndexToUse = 0,
                            stateChangeDeregistration;

                        function getActiveTabIndexFromCurrentState() {
                            var i,
                                j,
                                tabGroup,
                                tabGroupItem,
                                tabGroups = $scope.tabGroups;

                            for (i = 0; i < tabGroups.length; i++) {
                                tabGroup = tabGroups[i];
                                for (j = 0; j < tabGroup.tabs.length; j++) {
                                    tabGroupItem = tabGroup.tabs[j];
                                    if (tabGroupItem.sref && $state.is(tabGroupItem.sref)) {
                                        return tabGroupItem.index - 1;
                                    }
                                }
                            }
                        }

                        function buildTabs() {
                            var contentEls,
                                contentIndex = 0,
                                i,
                                j,
                                tabGroups = $scope.tabGroups,
                                tabGroup,
                                tabGroupItem,
                                unorderedListEl = element.find('ul:first');

                            contentEls = element.find('bb-tab-group-item > div');

                            //take div with ids of each tab and move them outside the ul
                            for (i = 0; i < tabGroups.length; i++) {
                                tabGroup = tabGroups[i];
                                element.append(createGroupHeaderDiv());
                                for (j = 0; j < tabGroup.tabs.length; j++) {
                                    tabGroupItem = tabGroup.tabs[j];
                                    tabGroupItem.index = (++nextTabIndexToUse);
                                    tabGroupItem.id = 'bb-tab-id-' + (++elIdSuffix);

                                    unorderedListEl.append(createListAnchorItem(tabGroupItem.id, tabGroupItem.automationId));
                                    element.append(createTabContentDiv(contentEls[contentIndex], tabGroupItem.id));

                                    contentIndex = contentIndex + 1;
                                }
                                unorderedListEl.append('<li class="rt-tab-spacer"></li>');
                                element.append('<div class="rt-tab-accordion-spacer"></div>');
                            }
                            element.find('bb-tab-group').remove();
                        }

                        function activateActiveTabModel() {
                            if (activeTab) {
                                var activeTabModel,
                                    activeTabId = activeTab.selector.substring(1),
                                    i,
                                    j,
                                    sref,
                                    tabGroup,
                                    tabGroupItem,
                                    tabGroups = $scope.tabGroups;

                                for (i = 0; i < tabGroups.length; i++) {
                                    tabGroup = tabGroups[i];
                                    for (j = 0; j < tabGroup.tabs.length; j++) {
                                        tabGroupItem = tabGroup.tabs[j];
                                        if (tabGroupItem.id === activeTabId) {
                                            activeTabModel = tabGroupItem;
                                        }
                                    }
                                }

                                if (activeTabModel) {
                                    sref = activeTabModel.sref;
                                    if (sref) {
                                        if (!$state.is(sref)) {
                                            $state.go(sref);
                                        }
                                    }
                                }
                                //this is where lazy loading/responsive logic would go, fire an event
                            }
                        }

                        function handleTabActivate(event, tab) {
                            /*jslint unparam: true */
                            activeTab = tab;
                            activateActiveTabModel();
                        }

                        function handleTabsActivateState(event, state) {
                            /*jslint unparam: true */
                            if (state.oldState !== state.newState) {
                                activateActiveTabModel();
                            }
                        }

                        //https://github.com/jellekralt/Responsive-Tabs
                        function addResponsiveTabs() {
                            var defaults,
                                fixed,
                                options;

                            defaults = {
                                active: getActiveTabIndexFromCurrentState() || 0,
                                collapsible: 'accordion',
                                rotate: false,
                                startCollapsed: false
                            };

                            options = $scope.bbTabOptions || defaults;

                            fixed = {
                                activate: handleTabActivate,
                                activateState: handleTabsActivateState
                                //Needs implementation with routes
                                //setHash: false
                            };

                            options = angular.extend({}, options, fixed);

                            element.responsiveTabs(options);
                        }

                        function headersExistForAllTabs() {
                            var i,
                                j,
                                tabGroup,
                                tabGroupItem;
                            for (i = 0; i < $scope.tabGroups.length; i++) {
                                tabGroup = $scope.tabGroups[i];
                                for (j = 0; j < tabGroup.tabs.length; j++) {
                                    tabGroupItem = tabGroup.tabs[j];
                                    if (!angular.isDefined(tabGroupItem.header) || tabGroupItem.header === null) {
                                        return false;
                                    }
                                }
                            }
                            return true;
                        }

                        function headerCallBack(data, args) {
                            var tabHeaderInfo = data,
                                tabElements;
                            if (tabHeaderInfo) {
                                tabElements = angular.element('a[href=#' + args.id + ']');
                                if (tabElements[0]) {
                                    angular.element(tabElements[0]).html(getTabHeader(tabHeaderInfo.headerCount, tabHeaderInfo.headerTitle));
                                }
                                if (tabElements[1]) {
                                    angular.element(tabElements[1]).html(getResponsiveTabHeader(tabHeaderInfo.headerCount, tabHeaderInfo.headerTitle));
                                }
                            }

                            $scope.tabsInitialized = headersExistForAllTabs();
                        }

                        function initializeTabHeaders() {
                            var headerCallBackArgs,
                                i,
                                j,
                                tabGroup,
                                tabGroupItem;
                            for (i = 0; i < $scope.tabGroups.length; i++) {
                                tabGroup = $scope.tabGroups[i];
                                for (j = 0; j < tabGroup.tabs.length; j++) {
                                    tabGroupItem = tabGroup.tabs[j];

                                    headerCallBackArgs = { id: tabGroupItem.id };
                                    if (angular.isDefined(tabGroupItem.header) && tabGroupItem.header !== null) {
                                        if (angular.isString(tabGroupItem.header)) {
                                            headerCallBack({ headerTitle: tabGroupItem.header }, headerCallBackArgs);
                                        } else {
                                            headerCallBack({ headerTitle: tabGroupItem.header.headerTitle, headerCount: tabGroupItem.header.headerCount }, headerCallBackArgs);
                                        }
                                    }
                                }
                            }
                        }

                        function afterContentRender() {
                            addResponsiveTabs(element[0], $scope.bbTabOptions);
                            initializeTabHeaders();
                        }

                        buildTabs();

                        afterContentRender();

                        stateChangeDeregistration = $rootScope.$on('$stateChangeSuccess', function () {
                            var tabId = getActiveTabIndexFromCurrentState();

                            if (tabId >= 0 && activeTab && tabId !== activeTab.id) {
                                //The state has changed and the new state matches a different tab
                                //than is current active.  Activate that tab.
                                element.responsiveTabs('activate', tabId);
                            }
                        });

                        $scope.updateTabItemHeader = function (item) {
                            var headerObject;
                            if (angular.isString(item.header)) {
                                headerObject = {
                                    headerTitle: item.header
                                };
                            } else {
                                headerObject = {
                                    headerTitle: item.header.headerTitle,
                                    headerCount: item.header.headerCount
                                };
                            }
                            headerCallBack(
                                headerObject,
                                {
                                    id: item.id
                                }
                            );
                        };

                        $scope.$on('$destroy', function () {
                            stateChangeDeregistration();
                            element.responsiveTabs('destroy');
                        });
                    }
                };
            }])
        .directive('bbTabGroup', function () {
            return {
                require: '^bbTab',
                restrict: 'E',
                scope: {
                },
                controller: ['$scope', function ($scope) {
                    $scope.tabGroupItems = [];

                    this.addTabGroupItem = function (item) {
                        $scope.tabGroupItems.push(item);
                    };

                    this.updateTabItemHeader = function (item) {
                        $scope.tabCtrl.updateTabItemHeader(item);
                    };
                }],
                link: function ($scope, element, attrs, tabCtrl) {
                    /*jslint unparam: true */
                    $scope.tabCtrl = tabCtrl;
                    tabCtrl.addTabGroup({ tabs: $scope.tabGroupItems });
                }
            };
        })
        .directive('bbTabGroupItem', function () {
            return {
                require: '^bbTabGroup',
                restrict: 'E',
                transclude: true,
                scope: {
                    bbTabItemHeaderFunction: '&',
                    bbTabItemHeader: '=',
                    bbTabItemCount: '=',
                    bbTabItemSref: '=',
                    bbTabItemAutomationId: '='
                },
                link: function ($scope, element, attrs, tabGroupCtrl) {
                    /*jslint unparam: true */
                    var item = {
                        header: $scope.bbTabItemHeader,
                        sref: $scope.bbTabItemSref,
                        automationId: $scope.bbTabItemAutomationId,
                        id: null
                    };
                    tabGroupCtrl.addTabGroupItem(item);

                    // Watching the header and its child properties so that changes to counts, etc will update the UI.
                    $scope.$watch('bbTabItemHeader', function (newValue, oldValue) {
                        if (angular.isDefined(newValue) && newValue !== null) {
                            item.header = newValue;
                            tabGroupCtrl.updateTabItemHeader(item);
                        }
                    }, true);
                },
                template: '<div ng-transclude></div>'
            };
        });
}());

/*jslint nomen: true, plusplus: true */
/*global angular */

(function () {
    'use strict';

    var BB_TEMPLATE_RESULT = 'bb-template-result';

    function createItemClassName(index) {
        return 'bb-template-item-' + index;
    }

    function insertTemplateItems(templateEl, items) {
        var i,
            n;

        // Move each item into the template element.
        for (i = 0, n = items.length; i < n; i++) {
            items[i].appendTo(templateEl.find('.' + createItemClassName(i)));
        }
    }

    angular.module('sky.templating', [])
        .directive('bbTemplate', ['bbFormat', function (bbFormat) {
            function createTemplateHtml(template) {
                // The template string itself should not contain HTML, so be sure to escape it to avoid HTML injection.
                template = bbFormat.escape(template);

                // Replace {0}, {1}, etc. with span elements that will serve as placeholders for the item elements.
                return template.replace(/\{(\d+)\}/g, function (match, number) {
                    /*jslint unparam: true */
                    return '<span class="' + createItemClassName(number) + '"></span>';
                });
            }

            return {
                controller: ['$scope', function ($scope) {
                    $scope.items = [];

                    this.addItem = function (item) {
                        $scope.items.push(item);
                    };
                }],
                link: function (scope, el) {

                    scope.$watch('template', function (newValue) {
                        var newEl,
                            oldEl = el.find('.' + BB_TEMPLATE_RESULT),
                            templateHtml;

                        if (angular.isDefined(newValue)) {
                            templateHtml = createTemplateHtml(newValue);

                            // Create and append a new template item, move the existing items to it, then
                            // destroy the old items.  Doing it in this order should ensure any elements
                            // with bindings remain bound after being moved.
                            newEl = angular.element('<span class="' + BB_TEMPLATE_RESULT + '">' + templateHtml + '</span>')
                                .appendTo(el);

                            insertTemplateItems(newEl, scope.items);

                            // Remove old elements if they exist.
                            oldEl.remove();
                        }
                    });
                },
                scope: {
                    template: '=bbTemplate'
                },
                restrict: 'A'
            };
        }])
        .directive('bbTemplateItem', function () {
            return {
                link: function (scope, el, attr, bbFormatCtrl) {
                    /*jslint unparam: true */
                    bbFormatCtrl.addItem(el);
                },
                require: '^bbTemplate',
                restrict: 'AE'
            };
        });
}());
/*jslint plusplus: true */
/*global angular */

(function () {
    'use strict';

    var modules = [
            'sky.resources'
        ];

    function getNewlineCount(value) {
        var matches = value.match(/\n/gi);

        if (matches) {
            return matches.length;
        }

        return 0;
    }

    angular.module('sky.textexpand', modules)
        .directive('bbTextExpand', ['bbResources', 'bbScrollIntoView', function (bbResources, bbScrollIntoView) {
            function link(scope, el, attrs) {
                var isExpanded,
                    maxLength = +attrs.bbTextExpandMaxLength || 200,
                    maxExpandedLength = +attrs.bbTextExpandMaxExpandedLength || 6500,
                    maxNewlines = 1,
                    maxExpandedNewlines = 50;

                function getTruncatedText(value, length, newlines) {
                    var i;

                    if (newlines && getNewlineCount(value) >= newlines) {
                        value = value.replace(/\s+/gi, ' ');
                    }

                    for (i = length - 1; i > length - 10; i--) {
                        if (/\s/.test(value.charAt(i))) {
                            length = i;
                            break;
                        }
                    }

                    return value.substr(0, length);
                }

                scope.$watch(attrs.bbTextExpand, function (newValue) {
                    var collapsedText,
                        expandedText,
                        containerEl,
                        currentHeight,
                        ellipsisEl,
                        expandEl,
                        newHeight,
                        textEl;

                    function animateText(previousText, newText, newExpandText, showEllipsis) {
                        // Measure the current height so we can animate from it.
                        currentHeight = containerEl.height();

                        expandEl.text(newExpandText);
                        textEl.text(newText);

                        newHeight = containerEl.height();

                        if (newHeight < currentHeight) {
                            // The new text is smaller than the old text, so put the old text back before doing
                            // the collapse animation to avoid showing a big chunk of whitespace.
                            textEl.text(previousText);
                        }

                        ellipsisEl.text(showEllipsis ? '...' : '');

                        containerEl
                            .height(currentHeight)
                            .animate(
                                {
                                    height: newHeight
                                },
                                250,
                                function () {
                                    if (newHeight < currentHeight) {
                                        textEl.text(newText);
                                    }
                                    containerEl.css('height', 'auto');
                                }
                            );
                    }

                    containerEl = angular.element('<div></div>');

                    if (newValue) {
                        collapsedText = getTruncatedText(newValue, maxLength, maxNewlines);
                        expandedText = getTruncatedText(newValue, maxExpandedLength, maxExpandedNewlines); // Get text based on max expanded length

                        if (collapsedText !== newValue) {
                            isExpanded = true;

                            textEl = angular.element('<span></span>');
                            textEl.text(collapsedText);

                            ellipsisEl = angular.element('<span class="bb-text-expand-ellipsis">...</span>');

                            expandEl = angular.element('<a href="#"></a>');
                            expandEl.text(bbResources.text_expand_see_more);

                            containerEl
                                .empty()
                                .append(textEl)
                                .append(ellipsisEl)
                                .append(expandEl);

                            expandEl.on('click', function () {
                                if (isExpanded) {
                                    animateText(collapsedText, expandedText, bbResources.text_expand_see_less, (expandedText !== newValue));
                                } else {
                                    animateText(expandedText, collapsedText, bbResources.text_expand_see_more, true);
                                }

                                bbScrollIntoView(expandEl);
                                isExpanded = !isExpanded;

                                return false;
                            });
                        } else {
                            containerEl.text(newValue);
                        }
                    }

                    el.empty().append(containerEl);

                    el.on('$destroy', function () {
                        containerEl = null;
                        expandEl = null;
                        textEl = null;
                    });
                });
            }

            return {
                link: link
            };
        }]);
}());
/*jslint browser: true, plusplus: true */
/*global angular */

(function () {
    'use strict';

    //Removes the specified tiles from the source container and appends them
    //in the specified order to the target container.
    function moveTilesToContainer(sourceContainer, targetContainer, tiles) {
        angular.forEach(tiles, function (tileId) {
            var tile = sourceContainer.find('[data-tile-id="' + tileId + '"]');
            targetContainer.append(tile);
        });
    }

    //Returns an array of tile names in the order they appear in the specified container.
    function parseTileOrder(container) {
        var tiles = [];
        container.find('[data-tile-id]').each(function () {
            tiles.push(angular.element(this).data('tile-id'));
        });
        return tiles;
    }

    angular.module('sky.tiles', ['sky.templates'])
        .directive('bbTile', ['$timeout', function ($timeout) {
            return {
                link: function (scope, el) {
                    var displayModeChanging = false,
                        tileInitialized = false;

                    //determines whether or not a tile is collapsed
                    function tileIsCollapsed(tileId, tiles) {
                        var i,
                            len = tiles.length,
                            tile;

                        for (i = 0; i < len; i++) {
                            tile = tiles[i];

                            if (tile.id === tileId) {
                                return scope.smallTileDisplayMode ? tile.collapsed_small : tile.collapsed;
                            }
                        }

                        return !!scope.smallTileDisplayMode;
                    }

                    //sets the collapsed state of the tile based on the tile settings and the display mode
                    function updateTileState(tiles) {
                        var collapsed;

                        tiles = tiles || [];

                        collapsed = tileIsCollapsed(scope.tileId, tiles);
                        scope.isCollapsed = collapsed;

                        if (collapsed && !tileInitialized) {
                            //in some cases the tile-content div is left in a partially collapsed state. 
                            //   this will ensure that the tile is styled corretly and the tile is completely collapsed
                            $timeout(function () {
                                var contentEl;
                                contentEl = el.find('.tile-content');
                                contentEl.removeClass('collapsing').addClass('collapse');
                            }, 1);
                        }
                    }

                    scope.isCollapsed = false;
                    scope.smallTileDisplayMode = false;
                    scope.tileId = '';

                    scope.titleClick = function () {
                        scope.isCollapsed = !scope.isCollapsed;
                        scope.scrollIntoView = !scope.isCollapsed;
                    };

                    //listens for the tileModeChanged event from the tileDashboard and updates the collapsed state of the tiles based on whether or not the tiles are in small display mode
                    scope.$on('tileDisplayModeChanged', function (event, data) {
                        /*jslint unparam: true */
                        scope.smallTileDisplayMode = data.smallTileDisplayMode || false;

                        if (tileInitialized) {
                            displayModeChanging = true;
                            updateTileState(data.tiles);
                        }
                    });


                    //listens for the tilesInitialized event from the tileDashboard and updates the initial collapsed state of the tiles
                    scope.$on('tilesInitialized', function (event, data) {
                        /*jslint unparam: true */
                        var tiles = data.tiles || [];

                        if (!tileInitialized) {
                            //retrieve the tile id from the parent container
                            scope.tileId = el.parent().attr('data-tile-id') || '';
                            scope.smallTileDisplayMode = data.smallTileDisplayMode || false;
                        }

                        updateTileState(tiles);

                        tileInitialized = true;
                    });

                    //if the collapsed state changes, notify the tileDashboard
                    scope.$watch('isCollapsed', function () {
                        if (tileInitialized && !displayModeChanging) {
                            $timeout(function () {
                                scope.$emit('tileStateChanged', {
                                    tileId: scope.tileId,
                                    collapsed: scope.isCollapsed
                                });
                            });
                        }
                        displayModeChanging = false;

                        if (!scope.isCollapsed) {
                            $timeout(function () {
                                scope.$broadcast('tileRepaint');
                            });
                        }
                    });

                },
                replace: true,
                restrict: 'E',
                scope: {
                    tileHeader: '=bbTileHeader'
                },
                controller: angular.noop,
                templateUrl: 'sky/templates/tiles/tile.html',
                transclude: true
            };
        }])
        .directive('bbTileSection', function () {
            return {
                restrict: 'A',
                template: function (el) {
                    el.addClass('tile-content-section');
                }
            };
        })
        .directive('bbTileDashboard', ['$timeout', 'bbMediaBreakpoints', function ($timeout, bbMediaBreakpoints) {
            return {
                replace: true,
                restrict: 'E',
                scope: {
                    tiles: '=bbTiles',
                    layout: '=bbLayout'
                },
                link: function (scope, element) {
                    var column1 = element.find('[data-dashboard-column="1"]'),
                        column2 = element.find('[data-dashboard-column="2"]'),
                        singleColumnMode = false,
                        smallTileDisplayMode = false,
                        sortableOptions;

                    //Inspects the tiles in each column and updates model accordingly.
                    function parseColumnTiles() {
                        scope.$apply(function () {
                            var layout = scope.layout;

                            if (singleColumnMode) {
                                layout.one_column_layout = parseTileOrder(column1);
                            } else {
                                layout.two_column_layout[0] = parseTileOrder(column1);
                                layout.two_column_layout[1] = parseTileOrder(column2);
                            }
                        });
                    }

                    //Layouts out the tiles based on the current one column or two column configuration
                    function layoutTiles() {
                        var layout = scope.layout;

                        if (layout) {
                            if (singleColumnMode) {
                                moveTilesToContainer(element, column1, layout.one_column_layout);
                            } else {
                                moveTilesToContainer(element, column1, layout.two_column_layout[0]);
                                moveTilesToContainer(element, column2, layout.two_column_layout[1]);
                            }
                        }
                    }

                    function mediabreakpointChangeHandler(breakPoints) {
                        singleColumnMode = (breakPoints.xs || breakPoints.sm);
                        layoutTiles();

                        if (singleColumnMode) {
                            element.removeClass('page-content-multicolumn');
                            column2.hide();
                        } else {
                            element.addClass('page-content-multicolumn');
                            column2.show();
                        }

                        smallTileDisplayMode = breakPoints.xs;

                        scope.$broadcast('tileDisplayModeChanged', {
                            smallTileDisplayMode: smallTileDisplayMode,
                            tiles: scope.tiles
                        });
                    }



                    //Setup jQuery sortable (drag and drop) options for the dashboard columns
                    sortableOptions = {
                        connectWith: '[data-dashboard-column]',
                        update: parseColumnTiles,
                        opacity: 0.8,
                        handle: '.tile-grab-handle',
                        placeholder: 'placeholder ibox',
                        forcePlaceholderSize: true,
                        revert: 250
                    };

                    //Setup jQuery sortable drag/drop for the columns
                    column1.sortable(sortableOptions);
                    column2.sortable(sortableOptions);

                    bbMediaBreakpoints.register(mediabreakpointChangeHandler);

                    element.on('$destroy', function () {
                        bbMediaBreakpoints.unregister(mediabreakpointChangeHandler);
                    });

                    scope.$watch('tiles', function () {
                        $timeout(function () {
                            layoutTiles();
                            scope.$broadcast('tilesInitialized', {
                                smallTileDisplayMode: smallTileDisplayMode,
                                tiles: scope.tiles
                            });
                        });
                    });

                    scope.$on('tileStateChanged', function (event, data) {
                        /*jslint unparam: true */
                        scope.$apply(function () {
                            var i,
                                len = scope.tiles.length,
                                tileId = data.tileId || '',
                                tiles = scope.tiles;

                            for (i = 0; i < len; i++) {
                                if (tiles[i].id === tileId) {
                                    if (smallTileDisplayMode) {
                                        tiles[i].collapsed_small = data.collapsed || false;
                                    } else {
                                        tiles[i].collapsed = data.collapsed || false;
                                    }
                                }
                            }
                        });
                    });
                },
                controller: angular.noop,
                templateUrl: 'sky/templates/tiles/tiledashboard.html'
            };
        }]);
}());
/*jslint browser: true, plusplus: true */
/*global angular, jQuery */

(function ($) {
    'use strict';

    function nextId() {
        nextId.index = nextId.index || 0;
        nextId.index++;
        return 'bbtoast-' + nextId.index;
    }

    function validateOptions(opts) {
        if (opts.message && opts.templateUrl) {
            throw 'You must not provide both a message and a templateUrl.';
        } else if (!opts.message && !opts.templateUrl) {
            throw 'You must provide either a message or a templateUrl.';
        }
    }

    angular.module('sky.toast', ['toastr'])
    .config(['toastrConfig', function (toastrConfig) {
        angular.extend(toastrConfig, {
            closeButton: true,
            newestOnTop: true,
            positionClass: 'toast-bottom-right',
            tapToDismiss: false,
            timeOut: 6000
        });
    }])
    .factory('bbToast', ['toastr', '$templateCache', '$compile', '$controller', '$rootScope', '$q', '$injector', function (toastr, $templateCache, $compile, $controller, $rootScope, $q, $injector) {
        //Based on $modal approach to resolves
        function getResolvePromises(resolves) {
            var promisesArr = [];
            angular.forEach(resolves, function (value) {
                if (angular.isFunction(value) || angular.isArray(value)) {
                    promisesArr.push($q.when($injector.invoke(value)));
                }
            });
            return promisesArr;
        }

        function open(message, config) {
            config = config || {};
            config.iconClass = 'bb-toast';
            return toastr.info(message, '', config);
        }

        function openMessage(opts) {
            return open(opts.message);
        }

        function openWithTemplate(opts) {
            var controller = opts.controller,
                controllerLocals,
                elId,
                resolveIter = 0,
                resolvesPromise,
                templateHtml,
                toast,
                toastScope;

            function insertTemplateInToast() {
                var templateEl = toast.el.find('#' + elId);

                templateEl.html(templateHtml);

                if (controller) {
                    $controller(controller, controllerLocals);
                    $compile(templateEl)(controllerLocals.$scope);
                }
            }

            opts.resolve = opts.resolve || {};

            resolvesPromise = $q.all(getResolvePromises(opts.resolve));

            resolvesPromise.then(function (resolvedVars) {
                if (controller) {
                    controllerLocals = {};
                    controllerLocals.$scope = $rootScope.$new();;
                    angular.forEach(opts.resolve, function (value, key) {
                        controllerLocals[key] = resolvedVars[resolveIter++];
                    });
                }

                templateHtml = $templateCache.get(opts.templateUrl);

                elId = nextId();

                toast = open("<div id='" + elId + "'></div>", { allowHtml: true });

                toastScope = toast.scope;

                //We need to hook in after the toast element has been created and the temporary message
                //defined above exists, but before the toast is visually displayed.  The toastr code adds
                //an init function to the scope when the toast directive is being linked.  An EvalAsync
                //after this occurs will allow us to hook in at the correct moment.
                toastScope.$watch('init', function (newValue, oldValue) {
                    toastScope.$evalAsync(function (scope) {
                        insertTemplateInToast();
                    });
                });
            });
        }

        return {
            open: function (opts) {
                opts = opts || {};
                validateOptions(opts);

                if (opts.templateUrl) {
                    openWithTemplate(opts);
                } else {
                    openMessage(opts);
                }
            }
        };
    }])
}(jQuery));
/*global angular */

(function () {
    'use strict';

    function bbTooltip($compile, $timeout, bbData) {
        // Based on Adomas.NET's answer to this StackOverflow question:
        // http://stackoverflow.com/questions/19029676/angular-ui-tooltip-with-html
        // This allows us to use an HTML template with Angular binding instead of building
        // HTML in the controller which leaves open the potential for HTML injection.
        return {
            restrict: 'A',
            scope: true,
            compile: function (tElem) {
                //Add bootstrap directive
                if (!tElem.attr('tooltip-html-unsafe')) {
                    tElem.attr('tooltip-html-unsafe', '{{tooltip}}');
                }

                return function (scope, el, attrs) {
                    function loadTemplate() {
                        bbData.load({
                            text: attrs.bbTooltip
                        }).then(function (result) {
                            var container = angular.element('<div></div>'),
                                tplContent = result.text;

                            container.html($compile(tplContent.trim())(scope));

                            $timeout(function () {
                                scope.tooltip = container.html();
                            });
                        });
                    }

                    //remove our direcive to avoid infinite loop
                    el.removeAttr('bb-tooltip');

                    //compile element to attach tooltip binding
                    $compile(el)(scope);

                    if (angular.isDefined(attrs.tooltipUpdater)) {
                        scope.$watch(attrs.tooltipUpdater, function () {
                            loadTemplate();
                        });
                    } else {
                        loadTemplate();
                    }
                };
            }
        };
    }


    bbTooltip.$inject = ['$compile', '$timeout', 'bbData'];

    angular.module('sky.tooltip', ['sky.data'])
        .directive('bbTooltip', bbTooltip);

}());
/*jslint browser: true */
/*global angular */

(function () {
    'use strict';

    angular.module('sky.uiselecthelper', [])
        .factory('bbUISelectHelper', ['$parse', function ($parse) {
            var SelectHelper = function () { };

            SelectHelper.prototype.RemoteRefresh = function (searchFunction, searchCriteria, scope, propertyName, control) {
                if ((searchCriteria || '') === '') {
                    control.items = [];
                } else {
                    searchFunction(searchCriteria).then(function (result) {
                        var results = result.data.results,
                            propertyAssignment = $parse(propertyName),
                            filteredResults;

                        //ui-select control doesn't filter out already selected items when updating the available dropdown items via its refresh method.
                        filteredResults = results.filter(function (result) {
                            return control.selected.map(function (existing) { return existing.id; }).indexOf(result.id) < 0;
                        });

                        propertyAssignment.assign(scope, filteredResults);
                    });
                }
            };

            return {
                SelectHelper: function () {
                    return new SelectHelper();
                }
            };
        }]);
}());
/*global angular */

(function () {
    'use strict';
    angular.module('sky.validation', [])
        .directive('bbEmailValidation', [function () {
            var EMAIL_REGEXP = /[\w\-]+@([\w\-]+\.)+[\w\-]+/;
            return {
                require: 'ngModel',
                restrict: '',
                link: function (scope, elm, attrs, ctrl) {
                    /*jslint unparam: true */
                    if (ctrl && ctrl.$validators.email) {
                        ctrl.$validators.email = function (modelValue) {
                            return ctrl.$isEmpty(modelValue) || EMAIL_REGEXP.test(modelValue);
                        };
                    }
                }
            };
        }]);
}());
/*jslint browser: true, plusplus: true */
/*global angular */

(function () {
    'use strict';

    var CLS_VIEWKEEPER = "viewkeeper",
        CLS_VIEWKEEPER_FIXED = CLS_VIEWKEEPER + "-fixed",
        config = {
            viewportMarginTop: 0
        },
        ViewKeeper;

    function nextId() {
        nextId.index = nextId.index || 0;
        nextId.index++;
        return 'viewkeeper-' + nextId.index;
    }

    function getSpacerId(vk) {
        return vk.id + "-spacer";
    }

    function setElPosition(elQ, left, top, bottom, width) {
        elQ.css({
            "top": top,
            "bottom": bottom,
            "left": left
        });

        if (width !== null) {
            elQ.css({ "width": width });
        }
    }

    function unfixEl(vk) {
        var elQ = angular.element(vk.el),
            width;

        angular.element("#" + getSpacerId(vk)).remove();

        elQ.removeClass(CLS_VIEWKEEPER_FIXED);

        vk.currentElFixedLeft = null;
        vk.currentElFixedTop = null;
        vk.currentElFixedBottom = null;
        vk.currentElFixedWidth = null;

        if (vk.setWidth) {
            width = "auto";
        }
        setElPosition(elQ, "", "", "", width);
    }

    function calculateVerticalOffset(vk) {
        var offset,
            verticalOffSetElTop;

        offset = vk.verticalOffSet;

        if (vk.verticalOffSetEl) {
            verticalOffSetElTop = vk.verticalOffSetEl.css('top');

            if (verticalOffSetElTop) {
                verticalOffSetElTop = parseInt(verticalOffSetElTop, 10);
                if (isNaN(verticalOffSetElTop)) {
                    verticalOffSetElTop = 0;
                }
            }

            offset += (vk.verticalOffSetEl.outerHeight() + verticalOffSetElTop);
        }

        return offset;
    }

    ViewKeeper = function (options) {
        var id,
            vk = this;

        options = options || {};

        vk.fixToBottom = options.fixToBottom;
        vk.setWidth = options.setWidth;
        vk.id = id = nextId();
        vk.el = options.el;
        vk.boundaryEl = options.boundaryEl;
        vk.verticalOffSet = options.verticalOffSet || 0;
        vk.setPlaceholderHeight = (options.setPlaceholderHeight !== false);
        vk.onStateChanged = options.onStateChanged;
        vk.isFixed = false;

        if (options.verticalOffSetElId) {
            vk.verticalOffSetEl = angular.element('#' + options.verticalOffSetElId);

            vk.verticalOffSetEl.on('afterViewKeeperSync.' + id, function () {
                vk.syncElPosition();
            });
        }

        angular.element(window).on("scroll." + id + ", resize." + id + ", orientationchange." + id, function () {
            vk.syncElPosition();
        });
    };

    ViewKeeper.prototype = {

        syncElPosition: function () {
            var anchorTop,
                anchorHeight,
                isCurrentlyFixed,
                currentElFixedLeft,
                currentElFixedTop,
                currentElFixedBottom,
                currentElFixedWidth,
                documentQ,
                fixEl,
                boundaryBottom,
                boundaryOffset,
                boundaryQ,
                boundaryTop,
                elFixedLeft,
                elFixedTop,
                elFixedBottom,
                elFixedWidth,
                elHeight,
                elQ,
                needsUpdating,
                scrollLeft,
                scrollTop,
                spacerHeight,
                spacerId,
                spacerQ,
                verticalOffSet,
                vk = this,
                width;

            isCurrentlyFixed = vk.isFixed;

            verticalOffSet = calculateVerticalOffset(vk);

            elQ = angular.element(vk.el);

            // When the element isn't visible, its size can't be calculated, so don't attempt syncing position in this case.
            if (!elQ.is(':visible')) {
                return;
            }

            boundaryQ = angular.element(vk.boundaryEl);
            spacerId = getSpacerId(vk);

            spacerQ = angular.element("#" + spacerId);
            documentQ = angular.element(window.document);

            boundaryOffset = boundaryQ.offset();
            boundaryTop = boundaryOffset.top;
            boundaryBottom = boundaryTop + boundaryQ.height();

            scrollLeft = documentQ.scrollLeft();
            scrollTop = documentQ.scrollTop();

            elHeight = elQ.outerHeight(true);

            if (vk.fixToBottom) {
                elFixedBottom = 0;
            } else {
                // If the element needs to be fixed, this will calculate its position.  The position will be 0 (fully visible) unless
                // the user is scrolling the boundary out of view.  In that case, the element should begin to scroll out of view with the
                // rest of the boundary by setting its top position to a negative value.
                elFixedTop = Math.min((boundaryBottom - elHeight) - scrollTop, verticalOffSet);
            }

            elFixedWidth = boundaryQ.width();
            elFixedLeft = boundaryOffset.left - scrollLeft;

            currentElFixedLeft = vk.currentElFixedLeft;
            currentElFixedTop = vk.currentElFixedTop;
            currentElFixedBottom = vk.currentElFixedBottom;
            currentElFixedWidth = vk.currentElFixedWidth;

            if (spacerQ.length > 0) {
                anchorTop = spacerQ.offset().top;
                anchorHeight = spacerQ.outerHeight(true);
            } else {
                anchorTop = elQ.offset().top;
                anchorHeight = elHeight;
            }

            if (vk.fixToBottom) {
                //Fix el if the natural bottom of the element would not be on the screen
                fixEl = (anchorTop + anchorHeight > scrollTop + window.innerHeight);
            } else {
                fixEl = scrollTop + verticalOffSet + config.viewportMarginTop > anchorTop;
            }

            if ((fixEl && currentElFixedLeft === elFixedLeft && currentElFixedTop === elFixedTop && currentElFixedBottom === elFixedBottom && currentElFixedWidth === elFixedWidth) || (!fixEl && !(currentElFixedLeft !== undefined && currentElFixedLeft !== null))) {
                // The element is either currently fixed and its position and width do not need to change, or the element is not
                // currently fixed and does not need to be fixed.  No changes are needed.
                needsUpdating = false;
            } else {
                needsUpdating = true;
            }

            if (needsUpdating) {
                if (fixEl) {
                    vk.isFixed = true;
                    if (spacerQ.length === 0) {
                        if (vk.setPlaceholderHeight) {
                            spacerHeight = elHeight;
                        } else {
                            spacerHeight = 0;
                        }
                        elQ.after('<div id="' + spacerId + '" style="height: ' + spacerHeight + 'px;"></div>');
                    }

                    elQ.addClass(CLS_VIEWKEEPER_FIXED);

                    vk.currentElFixedTop = elFixedTop;
                    vk.currentElFixedBottom = elFixedBottom;
                    vk.currentElFixedLeft = elFixedLeft;
                    vk.currentElFixedWidth = elFixedWidth;

                    if (vk.setWidth) {
                        width = elFixedWidth;
                    }

                    setElPosition(elQ, elFixedLeft, elFixedTop, elFixedBottom, width);
                } else {
                    vk.isFixed = false;
                    unfixEl(vk);
                }

                //If we changed if the item is fixed, fire the callback
                if (vk.onStateChanged && isCurrentlyFixed !== vk.isFixed) {
                    vk.onStateChanged();
                }
            }
            elQ.trigger('afterViewKeeperSync');
        },

        scrollToTop: function () {
            var anchorTop,
                elQ,
                documentQ,
                spacerId,
                spacerQ,
                verticalOffset,
                vk = this;

            verticalOffset = calculateVerticalOffset(vk);

            documentQ = angular.element(window.document);
            spacerId = getSpacerId(vk);
            spacerQ = angular.element("#" + spacerId);
            elQ = angular.element(vk.el);

            if (spacerQ.length > 0) {
                anchorTop = spacerQ.offset().top;
            } else {
                anchorTop = elQ.offset().top;
            }

            documentQ.scrollTop(anchorTop - verticalOffset - config.viewportMarginTop);
        },

        destroy: function () {
            var id,
                vk = this;

            if (!vk.isDestroyed) {
                id = vk.id;

                angular.element(window).off("scroll." + id + ", resize." + id + ", orientationchange." + id);
                unfixEl(vk);

                if (vk.verticalOffSetEl) {
                    vk.verticalOffSetEl.off("afterViewKeeperSync." + vk.id);
                    vk.verticalOffSetEl = null;
                }

                vk.isDestroyed = true;
            }
        }

    };

    angular.module('sky.viewkeeper', ['sky.mediabreakpoints'])
        .constant('bbViewKeeperConfig', config)
        .factory('bbViewKeeperBuilder', function () {
            return {
                create: function (options) {
                    return new ViewKeeper(options);
                }
            };
        })
        .run(['bbMediaBreakpoints', 'bbViewKeeperConfig', function (bbMediaBreakpoints, bbViewKeeperConfig) {
            function mediaBreakpointHandler(breakpoints) {
                //For user agents in which the omnibar follows you down the page, the ViewKeeper needs
                //to adjust for the height of the omnibar.

                //Ideally these values should be driven from a more appropriate source (omnibar js?)
                bbViewKeeperConfig.viewportMarginTop = breakpoints.xs ? 50 : 30;
            }

            if (/iPad|iPod|iPhone/i.test(window.navigator.userAgent)) {
                //On iOS the omnibar doesn't scroll with you.  Need to account for this on the styling.
                angular.element('body').addClass('omnibar-not-fixed');

                //On iOS we need to have special handling when entering textboxes to correct an issue with fixed
                //elements used by view keeper when the keyboard flys out.
                angular.element(window.document).on('focus', 'input', function () {
                    angular.element('body').addClass('viewkeeper-ignore-fixed');
                }).on('blur', 'input', function () {
                    angular.element('body').removeClass('viewkeeper-ignore-fixed');
                });
            } else {
                bbMediaBreakpoints.register(mediaBreakpointHandler);
            }
        }])
        .directive('bbViewKeeper', ['bbViewKeeperBuilder', function (bbViewKeeperBuilder) {
            function link(scope, el) {
                var vk;

                function destroyVk() {
                    if (vk) {
                        vk.destroy();
                        vk = null;
                    }
                }

                el.on('$destroy', function () {
                    destroyVk();
                });

                scope.$watch('bbBoundaryElId', function () {
                    var boundaryEl,
                        bbBoundaryElId = scope.bbBoundaryElId;

                    if (bbBoundaryElId) {
                        boundaryEl = angular.element('#' + bbBoundaryElId);

                        if (boundaryEl.length === 1) {
                            destroyVk();

                            vk = bbViewKeeperBuilder.create({
                                el: el[0],
                                boundaryEl: boundaryEl[0],
                                setWidth: true
                            });
                        }
                    }
                });
            }

            return {
                link: link,
                restrict: 'A',
                scope: {
                    bbBoundaryElId: '='
                }
            };
        }])
        .directive('bbScrollingViewKeeper', ['$window', function ($window) {
            return {
                scope: {
                    bbScrollingViewKeeper: "="
                },
                link: function (scope, element) {
                    var elementStart,
                        scrollPos,
                        prevScroll,
                        scrollingDown = true,
                        tempTop,
                        verticalOffset,
                        id = scope.$id;

                    function scroll() {
                        if (!element.is(':visible')) {
                            return;
                        }

                        if (angular.element('.bb-omnibar>.desktop').is(':visible')) {
                            verticalOffset = angular.element('.bb-omnibar>.desktop>.bar').outerHeight();
                        } else {
                            verticalOffset = 0;
                        }

                        if (scope.bbScrollingViewKeeper && scope.bbScrollingViewKeeper.viewKeeperOffsetElId) {
                            verticalOffset += angular.element('#' + scope.bbScrollingViewKeeper.viewKeeperOffsetElId).outerHeight();
                        }

                        if (!elementStart) {
                            elementStart = element.offset().top;
                        }
                        scrollPos = $window.scrollY || $window.pageYOffset || $window.document.body.scrollTop || 0;
                        if (prevScroll > scrollPos) {
                            scrollingDown = false;
                        } else {
                            scrollingDown = true;
                        }
                        prevScroll = scrollPos;

                        if (scrollPos >= elementStart - verticalOffset && element.height() + verticalOffset <= $window.document.body.offsetHeight) {
                            if (element.height() < $window.innerHeight) {
                                tempTop = 0;

                                element.removeClass("grid-filters-fixed-bottom").addClass("grid-filters-fixed-top");

                                element.css({
                                    top: verticalOffset + 'px'
                                });
                            } else if (scrollingDown) {
                                if (element.offset().top + element.height() > scrollPos + $window.innerHeight) {
                                    if (!tempTop) {
                                        tempTop = element.offset().top - elementStart;
                                    }

                                    element.removeClass("grid-filters-fixed-top grid-filters-fixed-bottom");

                                    element.css({
                                        top: tempTop
                                    });
                                } else {
                                    tempTop = 0;
                                    element.css({
                                        top: ''
                                    });
                                    element.removeClass("grid-filters-fixed-top").addClass("grid-filters-fixed-bottom");
                                }
                            } else {
                                if (element.offset().top < scrollPos + verticalOffset) {
                                    if (!tempTop) {
                                        tempTop = element.offset().top - elementStart;
                                    }

                                    element.removeClass("grid-filters-fixed-top grid-filters-fixed-bottom");

                                    element.css({
                                        top: tempTop
                                    });
                                } else {
                                    tempTop = 0;

                                    element.removeClass("grid-filters-fixed-bottom").addClass("grid-filters-fixed-top");

                                    element.css({
                                        top: verticalOffset + 'px'
                                    });
                                }
                            }
                        } else {
                            tempTop = 0;
                            element.removeClass("grid-filters-fixed-top grid-filters-fixed-bottom");
                            element.css({
                                top: 0
                            });
                        }
                    }

                    if (!/iPad|iPod|iPhone/i.test($window.navigator.userAgent)) {
                        angular.element($window).on('scroll.' + id + ', orientationchange.' + id, scroll);

                        element.on('$destroy', function () {
                            angular.element($window).off("scroll." + id + ", orientationchange." + id);
                        });
                    }
                },
                restrict: 'A'
            };
        }]);
}());
/*jslint browser: true */
/*global angular, jQuery */

(function ($) {
    'use strict';

    var CLEARWAIT_CLASS = 'bb-wait-clearwait',
        clearBlockOptions,
        fullPageClearBlockOptions,
        fullPageVisibleBlockOptions,
        fullPageZIndex = 20000,
        visibleBlockOptions;

    visibleBlockOptions = {
        message: '<div class="bb-wait-wrap"><div class="bb-wait-spinner"></div></div>'
    };

    clearBlockOptions = {
        message: "",
        fadeOut: 0,
        fadeIn: 0,
        overlayCSS: {
            opacity: 0
        }
    };

    fullPageClearBlockOptions = angular.copy(clearBlockOptions);
    fullPageClearBlockOptions.overlayCSS["z-index"] = fullPageZIndex;

    fullPageVisibleBlockOptions = angular.copy(visibleBlockOptions);
    fullPageVisibleBlockOptions.overlayCSS = { "z-index": fullPageZIndex };
    fullPageVisibleBlockOptions.css = { "z-index": fullPageZIndex + 1 };

    function isBlockUISupported() {
        return ($ && $.blockUI);
    }

    function isFullPage(el) {
        // Returns whether the element specified should be causing a
        // full page wait rather than just on the element itself.
        return $(el)[0] === document.body;
    }

    function blockEl(el, $timeout) {
        var $el = $(el);

        if (!isBlockUISupported()) {
            return;
        }

        $el.addClass(CLEARWAIT_CLASS);

        if (isFullPage(el)) {
            $.blockUI(angular.extend(clearBlockOptions, fullPageClearBlockOptions));
        } else {
            $el.block(clearBlockOptions);
        }

        $timeout(function () {
            // If the element doesn't have the clearwait class, then the wait has already been
            // removed and we don't need to elevate to a visisble wait.
            if ($el.hasClass(CLEARWAIT_CLASS)) {
                if (isFullPage(el)) {
                    $.blockUI(fullPageVisibleBlockOptions);
                } else {
                    $el.block(visibleBlockOptions);
                }
            }
        }, 300);

    }

    function unblockEl(el) {
        var $el = $(el);

        if (!isBlockUISupported()) {
            return;
        }

        if (isFullPage(el)) {
            $.unblockUI();
        } else {
            $el.unblock();
        }

        $el.removeClass(CLEARWAIT_CLASS);
    }

    angular.module('sky.wait', [])
        .directive('bbWait', ['$timeout', function ($timeout) {
            /// <summary>
            /// This directive provides an attribute that can be placed on elements indicating whether they should or shouldn't be blocked for waiting.
            /// </summary>

            if (isBlockUISupported) {
                // Clear any blockUI defaults.  Specifying these in the block call itself just gets appended to the defaults
                // but is incapable of generically clearing them all.
                $.blockUI.defaults.css = {};
                $.blockUI.defaults.overlayCSS = {};
            }

            return {
                restrict: 'A',
                link: function (scope, el, attrs) {
                    scope.$watch(attrs.bbWait, function (value, oldValue) {
                        if (value && !oldValue) {
                            blockEl(el, $timeout);
                        } else if (oldValue && !value) {
                            unblockEl(el);
                        }
                    });
                }
            };
        }]);

}(jQuery));
/*global angular */

(function () {
    'use strict';

    angular.module('sky.window', [])
        .constant('bbWindowConfig', {
            productName: ''
        })
        .factory('bbWindow', ['$window', 'bbWindowConfig', '$timeout', function ($window, bbWindowConfig, $timeout) {
            return {
                setWindowTitle: function (textToAppend) {
                    var title = bbWindowConfig.productName || '';

                    if (textToAppend) {
                        if (title) {
                            title += ' - ';
                        }

                        title += textToAppend;
                    }

                    //Adding a delay so the setWindowTitle method can be safely called after an angular
                    //state change without taking affect until after the browser has completed its
                    //state chagne.  Without this, the previous page will be renamed in the browser history.
                    $timeout(function () {
                        $window.document.title = title;
                    });
                }
            };
        }]);
}());
/*jslint browser: true */
/*global angular */

(function (window) {
    'use strict';

    function defineModule(moment) {
        var modules = [
            'sky.autofocus',
            'sky.charts',
            'sky.check',
            'sky.checklist',
            'sky.data',
            'sky.datefield',
            'sky.daterangepicker',
            'sky.filters',
            'sky.format',
            'sky.grids',
            'sky.helpbutton',
            'sky.helpwidget',
            'sky.highlight',
            'sky.mediabreakpoints',
            'sky.modal',
            'sky.money',
            'sky.omnibar',
            'sky.pagination',
            'sky.popover',
            'sky.resources',
            'sky.scrollintoview',
            'sky.tabs',
            'sky.templating',
            'sky.textexpand',
            'sky.tiles',
            'sky.tooltip',
            'sky.validation',
            'sky.viewkeeper',
            'sky.wait',
            'sky.window',
            'sky.uiselecthelper'
        ];

        try {
            angular.module("toastr");
            modules.push('sky.toast');
        } catch (ignore) {
            /* The toastr module isn't defined.  Do not load sky.toast module */
        }

        angular.module('sky.moment', [])
            .constant('bbMoment', moment);

        angular.module('sky', modules);
    }

    if (typeof window.define === 'function' && window.define.amd) {
        window.define(['moment'], defineModule);
    } else if (window.module !== undefined && window.module && window.module.exports) {
        defineModule(window.require('moment'));
    } else {
        defineModule(window.moment);
    }
}(this));
angular.module('sky.templates', ['sky/templates/charts/scatterplot.html', 'sky/templates/checklist/checklist.html', 'sky/templates/daterangepicker/daterangepicker.html', 'sky/templates/grids/actionbar.html', 'sky/templates/grids/columnpicker.html', 'sky/templates/grids/filters.html', 'sky/templates/grids/filtersgroup.html', 'sky/templates/grids/filterssummary.html', 'sky/templates/grids/grid.html', 'sky/templates/grids/seemore.html', 'sky/templates/modals/modalheader.html', 'sky/templates/popover/popup.html', 'sky/templates/tabs/tab.html', 'sky/templates/tiles/tile.html', 'sky/templates/tiles/tiledashboard.html']);

angular.module("sky/templates/charts/scatterplot.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sky/templates/charts/scatterplot.html",
    "<div class=\"bb-chart-container\" style=\"position: relative\">\n" +
    "  <div ng-style=\"moveBackStyle()\" ng-show=\"moveBackVisible\">\n" +
    "    <a ng-href=\"#\" ng-click=\"moveBack()\" ng-disabled=\"moveBackDisabled()\">\n" +
    "      <i class=\"glyphicon glyphicon-play icon-flipped\"></i>\n" +
    "    </a>\n" +
    "  </div>\n" +
    "  <div ng-style=\"moveForwardStyle()\" ng-show=\"moveForwardVisible\">\n" +
    "    <a ng-href=\"#\" ng-click=\"moveForward()\" ng-disabled=\"moveForwardDisabled()\">\n" +
    "      <i class=\"glyphicon glyphicon-play\"></i>\n" +
    "    </a>\n" +
    "  </div>\n" +
    "  <div class=\"bb-chart\"></div>\n" +
    "</div>");
}]);

angular.module("sky/templates/checklist/checklist.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sky/templates/checklist/checklist.html",
    "<div>\n" +
    "  <div ng-if=\"bbChecklistIncludeSearch\" class=\"checklist-filter-bar\">\n" +
    "    <input type=\"text\" maxlength=\"255\" placeholder=\"{{bbChecklistSearchPlaceholder}}\" ng-model=\"locals.searchText\" ng-model-options=\"{debounce: bbChecklistSearchDebounce}\" data-bbauto-field=\"ChecklistSearch\">\n" +
    "  </div>\n" +
    "  <div class=\"checklist-filter-bar\">\n" +
    "    <a class=\"checklist-link\" data-bbauto-field=\"ChecklistSelectAll\" href=\"#\" ng-click=\"locals.selectAll()\">{{locals.selectAllText}}</a>\n" +
    "    <a class=\"checklist-link\" data-bbauto-field=\"ChecklistClear\" href=\"#\" ng-click=\"locals.clear()\">{{locals.clearAllText}}</a>\n" +
    "  </div>\n" +
    "  <div class=\"checklist-wrapper\">\n" +
    "    <table class=\"table checklist-table\">\n" +
    "      <thead>\n" +
    "        <tr>\n" +
    "          <th class=\"checklist-checkbox-column\"></th>\n" +
    "          <th ng-repeat=\"column in locals.columns\" class=\"{{column.class}}\" ng-style=\"{'width': column.width}\">{{column.caption}}</th>\n" +
    "        </tr>\n" +
    "      </thead>\n" +
    "      <tbody bb-highlight=\"locals.searchText\" bb-highlight-beacon=\"locals.highlightRefresh\" data-bbauto-repeater=\"ChecklistItems\" data-bbauto-repeater-count=\"{{bbChecklistItems.length}}\">\n" +
    "        <tr ng-repeat=\"item in bbChecklistItems\" ng-click=\"locals.rowClicked(item);\">\n" +
    "          <td><input type=\"checkbox\" checklist-model=\"bbChecklistSelectedItems\" checklist-value=\"item\" ng-click=\"$event.stopPropagation();\" data-bbauto-field=\"{{item[bbChecklistAutomationField]}}\" /></td>\n" +
    "          <td ng-repeat=\"column in locals.columns\" class=\"{{column.class}}\" data-bbauto-field=\"{{column.automationId}}\" data-bbauto-index=\"{{$parent.$index}}\">{{item[column.field]}}</td>\n" +
    "        </tr>\n" +
    "      </tbody>\n" +
    "    </table>\n" +
    "    <div class=\"checklist-no-items\" ng-if=\"!bbChecklistItems.length\">{{locals.noItemsText || locals.defaultNoItemsText}}</div>\n" +
    "  </div>\n" +
    "  <div ng-transclude></div>\n" +
    "</div>");
}]);

angular.module("sky/templates/daterangepicker/daterangepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sky/templates/daterangepicker/daterangepicker.html",
    "<div>\n" +
    "    <select data-bbauto-field=\"{{bbDateRangePickerAutomationId}}_DateRangeType\"\n" +
    "            class=\"form-control\"\n" +
    "            ng-options=\"locals.bbDateRangePicker.getDateRangeTypeCaption(t) for t in (bbDateRangePickerOptions.availableDateRangeTypes || locals.bbDateRangePicker.defaultDateRangeOptions)\"\n" +
    "            ng-model=\"bbDateRangePickerValue.dateRangeType\" />\n" +
    "</div>");
}]);

angular.module("sky/templates/grids/actionbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sky/templates/grids/actionbar.html",
    "<div ng-show=\"locals.showActionBar\" data-bbauto-view=\"GridActionBar\">\n" +
    "    <div ng-if=\"!locals.showMobileActions\" class=\"grid-action-bar\">\n" +
    "        <div ng-if=\"!locals.mobileButtons\" class=\"grid-action-bar-buttons\" ng-repeat=\"action in locals.actions\">\n" +
    "            <button class=\"btn\" ng-class=\"{'btn-success': action.isPrimary, 'btn-white': !action.isPrimary}\" data-bbauto-field=\"{{action.automationId}}\" ng-click=\"action.actionCallback()\" ng-disabled=\"action.selections.length < 1\">{{action.title}} ({{action.selections.length}})</button>\n" +
    "        </div>\n" +
    "        <div ng-if=\"locals.mobileButtons\" class=\"grid-action-bar-buttons\">\n" +
    "            <button class=\"btn btn-success\" ng-click=\"locals.chooseAction()\">\n" +
    "                <span class=\"sky-icon sky-icon-multi-action\"></span>\n" +
    "                <span>{{resources.grid_action_bar_choose_action}}</span>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "        <button class=\"btn grid-action-bar-clear-selection\" ng-click=\"locals.clearSelection()\">\n" +
    "            {{resources.grid_action_bar_clear_selection}}\n" +
    "        </button>\n" +
    "    </div>\n" +
    "    <div ng-if=\"locals.showMobileActions\" class=\"grid-action-bar-mobile-buttons\">\n" +
    "        <div class=\"grid-action-bar-btn-container\">\n" +
    "            <div ng-repeat=\"action in locals.actions\">\n" +
    "                <button class=\"grid-action-bar-mobile-btn btn btn-block btn-lg\" ng-class=\"{'btn-success': action.isPrimary, 'btn-white': !action.isPrimary}\" ng-click=\"action.actionCallback()\" ng-disabled=\"action.selections.length < 1\">{{action.title}} ({{action.selections.length}})</button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <button class=\"btn grid-action-bar-mobile-cancel grid-action-bar-clear-selection\" ng-click=\"locals.cancelChooseAction()\">\n" +
    "            {{resources.grid_action_bar_cancel_mobile_actions}}\n" +
    "        </button>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("sky/templates/grids/columnpicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sky/templates/grids/columnpicker.html",
    "<bb-modal data-bbauto-view=\"ColumnPicker\">\n" +
    "  <bb-modal-header bb-modal-help-key=\"$parent.columnPickerHelpKey\">{{resources.grid_column_picker_header}}</bb-modal-header>\n" +
    "  <div bb-modal-body>\n" +
    "    <div class=\"checklist-filter-bar\">\n" +
    "      <input type=\"text\" placeholder=\"{{resources.grid_column_picker_search_placeholder}}\" ng-model=\"locals.searchText\" ng-change=\"applyFilters()\" data-bbauto-field=\"ColumnPickerSearchBox\">\n" +
    "    </div>\n" +
    "    <div class=\"checklist-filter-bar\">\n" +
    "      <button ng-repeat=\"category in categories\" type=\"button\" class=\"btn btn-sm\" ng-click=\"filterByCategory(category)\" ng-class=\"locals.selectedCategory === category ? 'btn-primary' : 'btn-default'\" data-bbauto-field=\"{{category}}\">{{category}}</button>\n" +
    "    </div>\n" +
    "    <div class=\"checklist-wrapper grid-column-picker-wrapper\">\n" +
    "      <table data-bbauto-field=\"ColumnPickerTable\" class=\"table grid-column-picker-table\">\n" +
    "        <thead>\n" +
    "          <tr>\n" +
    "            <th class=\"checklist-checkbox-column\"></th>\n" +
    "            <th class=\"name-column\" data-bbauto-field=\"ColumnNameHeader\">{{resources.grid_column_picker_name_header}}</th>\n" +
    "            <th class=\"description-column\" data-bbauto-field=\"ColumnDescriptionHeader\">{{resources.grid_column_picker_description_header}}</th>\n" +
    "          </tr>\n" +
    "        </thead>\n" +
    "        <tbody bb-highlight=\"locals.searchText\" data-bbauto-repeater=\"ColumnChooserFields\" data-bbauto-repeater-count=\"{{columns.length}}\">\n" +
    "          <tr ng-repeat=\"column in columns\" ng-click=\"column.selected = !column.selected\" ng-show=\"!column.hidden\">\n" +
    "            <td><input data-bbauto-field=\"{{column.name}}\" data-bbauto-index=\"{{$index}}\" type=\"checkbox\" ng-model=\"column.selected\" ng-click=\"$event.stopPropagation();\" /></td>\n" +
    "            <td data-bbauto-field=\"ColumnCaption\" data-bbauto-index=\"{{$index}}\">{{column.caption}}</td>\n" +
    "            <td data-bbauto-field=\"ColumnDescription\" data-bbauto-index=\"{{$index}}\">{{column.description}}</td>\n" +
    "          </tr>\n" +
    "        </tbody>\n" +
    "      </table>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <bb-modal-footer>\n" +
    "    <bb-modal-footer-button-primary data-bbauto-field=\"ColumnPickerSubmit\" ng-click=\"applyChanges()\">{{resources.grid_column_picker_submit}}</bb-modal-footer-button-primary>\n" +
    "    <bb-modal-footer-button-cancel data-bbauto-field=\"ColumnPickerCancel\"></bb-modal-footer-button-cancel>\n" +
    "  </bb-modal-footer>\n" +
    "</bb-modal>");
}]);

angular.module("sky/templates/grids/filters.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sky/templates/grids/filters.html",
    "<div style=\"display:none;\">\n" +
    "    <div bb-scrolling-view-keeper=\"viewKeeperOptions\" class=\"grid-filters\">\n" +
    "        <div class=\"grid-filters-box\" bb-scroll-into-view=\"expanded\">\n" +
    "            <div class=\"grid-filters-icon\" ng-click=\"expanded = !expanded\"></div>\n" +
    "            <div class=\"grid-filters-container\" style=\"display:none;\">\n" +
    "                <div class=\"grid-filters-header\" ng-click=\"expanded = !expanded\">\n" +
    "                    <h4 class=\"grid-filters-header-title\">{{resources.grid_filters_header}}</h4>\n" +
    "                    <span class=\"grid-filters-header-hide\">{{resources.grid_filters_hide}}</span>\n" +
    "                </div>\n" +
    "                <div class=\"grid-filters-body\" ng-transclude></div>\n" +
    "                <div class=\"grid-filters-footer\">\n" +
    "                    <button data-bbauto-field=\"ApplyGridFilters\" class=\"btn btn-primary\" type=\"submit\" ng-click=\"applyFilters()\">{{resources.grid_filters_apply}}</button>\n" +
    "                    <button data-bbauto-field=\"ClearGridFilters\" class=\"btn btn-white\" type=\"button\" ng-click=\"clearFilters()\">{{resources.grid_filters_clear}}</button>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("sky/templates/grids/filtersgroup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sky/templates/grids/filtersgroup.html",
    "<div class=\"form-group\" ng-class=\"isCollapsed ? 'collapsed' : 'collapsible'\">\n" +
    "    <div ng-click=\"isCollapsed = !isCollapsed\">\n" +
    "        <i ng-class=\"'glyphicon-chevron-' + (isCollapsed ? 'down' : 'up')\" class=\"grid-filters-body-group-header-icon glyphicon\"></i>\n" +
    "        <label>{{bbGridFiltersGroupLabel}}</label>\n" +
    "    </div>\n" +
    "    <div class=\"grid-filters-body-group-content\" collapse=\"!!isCollapsed\" ng-transclude></div>\n" +
    "</div>");
}]);

angular.module("sky/templates/grids/filterssummary.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sky/templates/grids/filterssummary.html",
    "<div class=\"toolbar table-toolbar applied-filter-bar\">\n" +
    "    <div class=\"applied-filter-header\">\n" +
    "        <span>{{resources.grid_filters_summary_header}}</span>\n" +
    "    </div>\n" +
    "    <div class=\"applied-filter-content\" ng-click=\"openFilterMenu()\">\n" +
    "        <span class=\"applied-filter-text\" data-bbauto-field=\"FilterSummaryText\" ng-transclude></span>\n" +
    "        <span class=\"sky-icon-close applied-filter-remove\" data-bbauto-field=\"FilterSummaryRemove\" ng-click=\"clearFilters(); $event.stopPropagation();\"></span>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("sky/templates/grids/grid.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sky/templates/grids/grid.html",
    "<section class=\"col-xs-12 bb-grid-container\" data-bbauto-grid=\"{{options.automationId}}\" data-bbauto-timestamp=\"{{locals.timestamp}}\" data-bbauto-repeater=\"{{options.automationId}}\" data-bbauto-repeater-count=\"{{locals.rowcount}}\">\n" +
    "  <div ng-transclude></div>\n" +
    "  <div class=\"grid-toolbar-container\" style=\"display:none;\">\n" +
    "    <div class=\"toolbar table-toolbar\">\n" +
    "      <div data-bbauto-field=\"AddButton\" class='add-button btn-success btn btn-sm' ng-show=\"locals.hasAdd\" ng-click=\"locals.onAddClick()\">\n" +
    "        <span class='toolbar-button-icon sky-icon sky-icon-add-fill'></span>\n" +
    "        <span class='toolbar-button-label'>{{options.onAddClickLabel}}</span>\n" +
    "      </div>\n" +
    "      <div class=\"search-container\">\n" +
    "        <input type=\"text\" placeholder=\"{{resources.grid_search_placeholder}}\" ng-model=\"searchText\" ng-keyup=\"$event.keyCode == 13 && locals.applySearchText();\" data-bbauto-field=\"SearchBox\">\n" +
    "        <div class=\"search-icon\" data-bbauto-field=\"SearchButton\" ng-click=\"locals.applySearchText();\"></div>\n" +
    "      </div>\n" +
    "      <div class=\"toolbar-button column-picker-button\" data-bbauto-field=\"ColumnPickerButton\" ng-show=\"locals.hasColPicker\" ng-click=\"locals.openColumnPicker()\">\n" +
    "        <span class=\"toolbar-button-icon column-picker-button-icon\"></span>\n" +
    "        <span class=\"toolbar-button-label\">{{resources.grid_columns_button}}</span>\n" +
    "      </div>\n" +
    "      <div class=\"toolbar-button filter-button\" data-bbauto-field=\"FilterButton\" ng-show=\"locals.hasFilters\" ng-click=\"locals.toggleFilterMenu();\">\n" +
    "        <span class=\"toolbar-button-icon filter-button-icon\"></span>\n" +
    "        <span class=\"toolbar-button-label\">{{resources.grid_filters_button}}</span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"table-responsive\">\n" +
    "      <table id=\"{{locals.gridId}}\" ng-class=\"{'grid-multiselect' : locals.multiselect}\"></table>\n" +
    "  </div>\n" +
    "  <div class=\"table-loadmore\" data-bbauto-field=\"LoadMoreButton\" ng-show=\"options.hasMoreRows\" ng-click=\"locals.loadMore();\">\n" +
    "    <span class=\"fa fa-cloud-download\"></span>\n" +
    "    <a href=\"#\">{{resources.grid_load_more}}</a>\n" +
    "  </div>\n" +
    "    <div class=\"grid-action-bar-and-back-to-top\">\n" +
    "        <bb-grid-action-bar ng-if=\"locals.multiselect && multiselectActions && updateMultiselectActions\" bb-multiselect-actions=\"multiselectActions\" bb-selections-updated=\"updateMultiselectActions(selections)\">\n" +
    "        </bb-grid-action-bar>\n" +
    "        <div class=\"table-backtotop\" data-bbauto-field=\"BackToTopButton\" ng-show=\"locals.isScrolled\" ng-click=\"locals.backToTop();\">\n" +
    "            <span style=\"float:left\">\n" +
    "                <span class=\"fa fa-arrow-up \"></span>\n" +
    "                <a href=\"#\">{{resources.grid_back_to_top}}</a>\n" +
    "            </span>\n" +
    "            <span style=\"float:right\">\n" +
    "                <span class=\"fa fa-arrow-up \"></span>\n" +
    "                <a href=\"#\">{{resources.grid_back_to_top}}</a>\n" +
    "            </span>\n" +
    "            <div class=\"clearfix\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</section>");
}]);

angular.module("sky/templates/grids/seemore.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sky/templates/grids/seemore.html",
    "<div bb-text-expand=\"data\" bb-text-expand-max-length=\"100\" style=\"white-space: pre-wrap\"></div>");
}]);

angular.module("sky/templates/modals/modalheader.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sky/templates/modals/modalheader.html",
    "<div class=\"modal-header\">\n" +
    "    <h4 class=\"dialogHeader\" ng-transclude></h4>\n" +
    "    <button type=\"button\" class=\"close\" ng-click=\"$parent.$parent.$dismiss('cancel');\">&times;</button>\n" +
    "    <div bb-help-button bb-help-key=\"{{bbModalHelpKey}}\" bb-set-help-key-override=\"true\" data-bbauto-field=\"ModalHelpButton\"></div>\n" +
    "</div>");
}]);

angular.module("sky/templates/popover/popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sky/templates/popover/popup.html",
    "<div class=\"popover {{placement}} fade\" ng-class=\"{ in: isOpen()}\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "\n" +
    "  <div class=\"popover-inner\">\n" +
    "    <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n" +
    "    <div class=\"popover-content\"></div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("sky/templates/tabs/tab.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sky/templates/tabs/tab.html",
    "<div ng-hide=\"!tabsInitialized\" data-bbauto-field=\"{{bbTabAutomationId}}\" class=\"responsiveTabControl\">\n" +
    "    <ul ng-transclude>\n" +
    "\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("sky/templates/tiles/tile.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sky/templates/tiles/tile.html",
    "<section ng-class=\"isCollapsed ? 'collapsed' : 'collapsible'\" class=\"ibox float-e-margins tile\">\n" +
    "  <div bb-scroll-into-view=\"scrollIntoView\">\n" +
    "    <div class=\"ibox-title\" ng-click=\"titleClick()\">\n" +
    "      <h5 class=\"tile-header\">{{tileHeader}}</h5>\n" +
    "      <div class=\"ibox-tools\">\n" +
    "        <i ng-class=\"'glyphicon-chevron-' + (isCollapsed ? 'down' : 'up')\" class=\"glyphicon tile-chevron\"></i>\n" +
    "        <i class=\"tile-grab-handle glyphicon glyphicon-th\" ng-click=\"$event.stopPropagation()\"></i>\n" +
    "      </div>\n" +
    "      <div class=\"clearfix\"></div>\n" +
    "    </div>\n" +
    "    <div collapse=\"isCollapsed\" class=\"ibox-content tile-content\" ng-transclude>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</section>");
}]);

angular.module("sky/templates/tiles/tiledashboard.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sky/templates/tiles/tiledashboard.html",
    "<div class=\"row-fluid\">\n" +
    "  <div class=\"col-md-6 page-content-tile-column page-content-column-sortable\" data-dashboard-column=\"1\">\n" +
    "    <div ng-repeat=\"tile in tiles\" data-tile-id=\"{{tile.id}}\" data-ui-view=\"{{tile.view_name}}\" id=\"{{tile.view_name}}\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"col-md-6 page-content-tile-column page-content-column-sortable\" data-dashboard-column=\"2\">\n" +
    "  </div>\n" +
    "</div>");
}]);

//# sourceMappingURL=sky.js.map