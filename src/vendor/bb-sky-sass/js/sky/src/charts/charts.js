/*jslint browser: true, plusplus: true */
/*global angular, jQuery */

(function ($) {
    'use strict';

    angular.module('sky.charts', ['sky.resources', 'sky.moment', 'sky.format'])
        .directive('bbChartScatterplot', ['$timeout', '$window', 'bbFormat', 'bbMoment', 'bbResources', function ($timeout, $window, bbFormat, bbMoment, bbResources) {
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
                        plotEl,
                        windowEl = $($window);

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

                    function onOrientationChange() {
                        //When the orientation changes, trigger the plot to pan in no direction.  There is an issue in Safari where
                        //the plot points are not redrawn properly on orientation change even when the grid is forced to reinitialize and redraw.
                        plot.pan({});
                    }

                    el.addClass('bb-chart-rendering');

                    scope.$on('tileRepaint', function () {
                        initialize();
                    });

                    initializePlotElement();

                    transclude(function (clone) {
                        el.append(clone);
                    });

                    windowEl.on('orientationchange', onOrientationChange);

                    scope.$on('$destroy', function () {
                        windowEl.off('orientationchange', onOrientationChange);
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

                                    if (elTop - $window.pageYOffset < 0) {
                                        elTop = $window.pageYOffset;
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
