/*jshint browser: true */

/*global angular */

/** @module Autofocus
 @description The bb-autofocus directive is used to set focus on a form item when rendered. Use this when the HTML autofocus property behaves finicky with things like angular dynamically loaded templates and such. 
Here focus is set in an in-page form as well as in a modal launched with bbmodal.
 */

(function () {
    'use strict';
    
    angular.module('sky.autofocus', [])
        .directive('bbAutofocus', ['$timeout', function ($timeout) {
            return {
                restrict: 'A',
                link: function ($scope, $element) {
                    /*jslint unparam: true */
                    $timeout(function () {
                        $element.focus();
                    }, 100);
                }
            };
        }]);
}());
/*jslint browser: true, plusplus: true */
/*global angular, jQuery */

/** @module Autonumeric
 @description ### Additional Dependencies ###

 - **[autoNumeric](http://www.decorplanit.com/plugin/) (1.9.27 or higher)** Used to format money values

---

The Autonumeric directive wraps up the autoNumeric jQuery plugin.  It allows for formatting any kind of number, including currency.  This directive must be used in conjunction with the `ngModel` directive where the property bound to `ngModel` is the raw numeric value on your model.

### Autonumeric Options ###

 - `bb-autonumeric` This  can optionally be assigned the name of a property from the `bbAutonumericConfig` object.  If none is specified, it defaults to `number`.
 - `bb-autonumeric-settings` This can be assigned a value that represents a settings object that can be passed to autoNumeric.  These options will override any default options specified in the `bb-autonumeric` attribute.  A complete list of options is available [here](http://www.decorplanit.com/plugin/).
 
### Autonumeric Filter ###

In addition to the directive, there is also a filter that can be used to format numbers.  The filter has the added feature of optionally abbreviating a number according to Sky patterns.  For instance,
numbers over 10,000 will be displayed as 10k, over 1,000,000 as 1m, and 1,000,000,000 as 1b.  The filter takes three arguments:
 
 - `input` The value to format.
 - `configType` The name of the configuration (`number` or `money`) to apply to the value.
 - `abbreviate` A Boolean value indicating whether to abbreviate large numbers.
 */
(function ($) {
    'use strict';
         
    function getBaseSettings(bbAutoNumericConfig, configType) {
        var baseSettings,
            configSettings;

        baseSettings = angular.extend(
            {},
            $.fn.autoNumeric.defaults,
            bbAutoNumericConfig.number
        );

        if (configType) {
            configSettings = bbAutoNumericConfig[configType];
        }

        if (configSettings) {
            angular.extend(baseSettings, configSettings);
        }

        return baseSettings;
    }

    angular.module('sky.autonumeric', ['sky.resources'])
        .constant('bbAutonumericConfig', {
            number: {
                aSep: ',',
                dGroup: 3,
                aDec: '.',
                pSign: 'p',
                mDec: 2
            },
            money: {
                aSign: '$'
            }
        })
        .directive('bbAutonumeric', ['$timeout', 'bbAutonumericConfig', function ($timeout, bbAutoNumericConfig) {
            return {
                require: 'ngModel',
                restrict: 'A',
                link: function ($scope, el, attrs, ngModel) {
                    var customSettings = {};
                    
                    function applySettings() {
                        el.autoNumeric('update', angular.extend({}, getBaseSettings(bbAutoNumericConfig, attrs.bbAutonumeric), customSettings));
                    }
                    
                    function applyCssSettings(el) {
                        if (attrs.bbAutonumeric) {
                            el.addClass('bb-autonumeric-' + attrs.bbAutonumeric);
                        }
                    }

                    if (attrs.bbAutonumericSettings) {
                        $scope.$watch(attrs.bbAutonumericSettings, function (newValue) {
                            customSettings = newValue || {};
                            applySettings();
                        }, true);
                    }
                    
                    el.autoNumeric(getBaseSettings(bbAutoNumericConfig, attrs.bbAutonumeric));
                    applyCssSettings(el);

                    $scope.$watch(attrs.ngModel, function (newValue) {
                        if (newValue !== undefined && newValue !== null) {
                            el.autoNumeric('set', newValue);
                        } else {
                            el.val(null);
                        }
                    });

                    //Setup on change handler to update scope value
                    el.change(function () {
                        return $scope.$apply(function () {
                            var value = parseFloat(el.autoNumeric('get'));
                            
                            if (isNaN(value)) {
                                value = null;
                            }
                            
                            return ngModel.$setViewValue(value);
                        });
                    });

                    // When focusing in textbox, select all.  This is to workaround not having placeholder text for autonumeric.
                    /*
                        istanbul ignore next: the test for this code isn't passing on IE 10 on BrowserStack in automated mode.
                        This isn't mission-critical so I'm just ignoring it for now. 
                    */
                    el.on('focusin.bbAutonumeric', function () {
                        $timeout(function () {
                            el.select();
                        });
                    });
                }
            };
        }])
        .filter('bbAutonumeric', ['bbAutonumericConfig', 'bbResources', function (bbAutonumericConfig, bbResources) {
            return function (input, configType, abbreviate) {
                var aSign,
                    dividend,
                    mDec,
                    formatted,
                    settings,
                    suffix,
                    tempEl = $('<span></span>');
                
                settings = getBaseSettings(bbAutonumericConfig, configType);
                
                if (abbreviate) {
                    if (settings.pSign === 's') {
                        // The suffix needs to go between the number and the currency symbol, so the currency
                        // symbol has to be left off and appended after the number is formatted.
                        aSign = settings.aSign;
                        settings.aSign = '';
                    }
                    
                    input = Math.round(input);
                    
                    if (input >= 1000000000) {
                        dividend = 100000000;
                        suffix = bbResources.autonumeric_abbr_billions;
                    } else if (input >= 1000000) {
                        dividend = 100000;
                        suffix = bbResources.autonumeric_abbr_millions;
                    } else if (input >= 10000) {
                        dividend = 100;
                        suffix = bbResources.autonumeric_abbr_thousands;
                    }
                    
                    if (suffix) {
                        input = Math.floor(input / dividend) / 10;
                        mDec = Math.floor(input) === input ? 0 : 1;
                    } else {
                        mDec = 0;
                    }

                    settings.mDec = mDec;
                }
                
                tempEl.autoNumeric(settings);
                tempEl.autoNumeric('set', input);
                
                formatted = tempEl.text();
                
                if (suffix) {
                    formatted += suffix;
                }
                
                if (abbreviate && settings.pSign === 's' && aSign) {
                    formatted += aSign;
                }
                
                return formatted;
            };
        }]);
}(jQuery));

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

/*jshint browser: true */

/*global angular, jQuery */

/** @module Check
 @description ### Additional Dependencies ###

 - **[icheck.js](http://fronteed.com/iCheck/) (1.0.2 or higher)** 

---

The bbCheck directive allows you to change an input element of type checkbox or radio into a commonly styled selector.  The value that is selected is driven through the ngModel attribute specified on the input element and for radio input types the value to set on the ngModel can be specified by the value attribute.
 */

(function ($) {
    'use strict';
    angular.module('sky.check', [])
        .directive('bbCheck', ['$timeout', function ($timeout) {
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
        }]);
}(jQuery));
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
/*jslint plusplus: true */
/*global angular, jQuery, require */

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

        /*istanbul ignore else: sanity check */
        if (option) {
            if (angular.isString(option) || option.BB_DATA_POST) {
                url = option;

                option = {};
                option[DEFAULT_PROP] = url;
            }

            for (p in option) {
                /*istanbul ignore else */
                if (option.hasOwnProperty(p)) {
                    item = option[p];
                    url = item;

                    props.push(p);
                    urls.push(url);
                }
            }
        }
    }

    function loadManager(options) {
        // A service endpoint for tracking loading items.

        var item,
            loadingItems = [],
            nonblockingForAdditionalItems = false,
            result,
            scope,
            waitingForFirstItem = false;

        function cancelWaiting() {
            options.waitForFirstItem = false;
            options.nonblockWaitForAdditionalItems = false;

            if (nonblockingForAdditionalItems) {
                nonblockingForAdditionalItems = false;
                scope.$emit("bbEndWait", { nonblocking: true });
            }

            if (waitingForFirstItem) {
                waitingForFirstItem = false;
                scope.$emit("bbEndWait");
            }
        }

        function startNonblockingForAdditionalItems() {
            nonblockingForAdditionalItems = true;
            scope.$emit("bbBeginWait", { nonblocking: true });
        }

        function markCompleted(item) {
            var i = loadingItems.indexOf(item);

            if (i !== -1) {
                loadingItems.splice(i, 1);
                if (loadingItems.length === 0) {
                    result.isLoading = false;

                    if (nonblockingForAdditionalItems) {
                        nonblockingForAdditionalItems = false;
                        scope.$emit("bbEndWait", { nonblocking: true });
                    }
                }
            }

            if (!result.isFirstItemLoaded) {
                result.isFirstItemLoaded = true;
                if (waitingForFirstItem) {
                    waitingForFirstItem = false;
                    scope.$emit("bbEndWait");
                }
            }

            if (result.isLoading && options.nonblockWaitForAdditionalItems && !nonblockingForAdditionalItems) {
                startNonblockingForAdditionalItems();
            }
        }

        function registerItem(item) {
            if (!result.isLoading) {
                if (result.isFirstItemLoaded && options.nonblockWaitForAdditionalItems) {
                    startNonblockingForAdditionalItems();
                }
            }
            loadingItems.push(item);
            result.isLoading = true;
        }

        // Initialize values
        scope = options.scope;

        if (options.load) {
            item = {
                name: options.name,
                load: options.load
            };
        }

        result = {
            isFirstItemLoaded: false,
            isLoading: false,
            loadingItems: loadingItems,
            cancelWaiting: cancelWaiting
        };

        if (options.waitForFirstItem) {
            waitingForFirstItem = true;
            scope.$emit("bbBeginWait");
        }

        // Start loading any item that is handed directly to the loader.
        if (item) {
            // Add the current item to the list.
            registerItem(item);

            // Start loading the item.
            result.loaded = item.load().finally(function () {
                markCompleted(item);
                scope.$parent.$emit("bbData.loadManager.markCompleted", item);
            });

            scope.$parent.$emit("bbData.loadManager.registerItem", item);
        }

        if (options.isAggregate) {
            // Listen to items being registered by child loadManagers.
            scope.$on("bbData.loadManager.registerItem", function (e, item) {
                e.stopPropagation();
                registerItem(item);
            });

            // Listen to items being marked completed by child loadManagers.
            scope.$on("bbData.loadManager.markCompleted", function (e, item) {
                e.stopPropagation();
                markCompleted(item);
            });
        }

        return result;
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
                    url += '?' + parts.join('');
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

            function loadData(options) {
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
                        /*jshint validthis: true */
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
            }

            return {
                load: function (options) {
                    if (options.loadManager) {
                        options.loadManager.load = function () {
                            return loadData(options);
                        };

                        return loadManager(options.loadManager).loaded;
                    }

                    return loadData(options);
                },
                loadManager: loadManager,
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

/*jshint browser: true */
/*global angular */

/** @module Datefield
 @description ### Additional Dependencies ###

 - **[bootstrap-datepicker.js](https://bootstrap-datepicker.readthedocs.org/) (1.3.1 or higher)**

---

The DateField directive allows you to use a common textbox with calendar picker for choosing a date.  Values entered into the textbox manually will be validated and cleaned up for date formatting.

### Date Field Settings ###

 - `ng-model` An object to bind the date value in and out of the date field.
 - `bb-date-field-options` Optional.  An options object for customizing the date field.


### Date Field Options ###
 - `formatValue` Optional.  A function that will be called when text is entered directly into the textbox.  The only paramter to the function will be the raw value of the textbox.  The function should return an object or a promise of an object with properties of `formattedValue` and optionally `formattingErrorMessage` if there was a problem when trying to format the input value.
 */

(function () {
    'use strict';
    angular.module('sky.datefield', ['sky.resources', 'sky.moment'])
        .constant('bbDateFieldConfig', {
            currentCultureDateFormatString: 'mm/dd/yyyy',
            twoDigitYearRolloverMax: 29
        })
        .directive('bbDateField', ['$q', '$templateCache', 'bbMoment', 'bbDateFieldConfig', 'bbResources', function ($q, $templateCache, bbMoment, bbDateFieldConfig, bbResources) {

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

            function validateDate(value, required) {
                if (!required && !value) {
                    return true;
                }
                return !/Invalid|NaN/.test(bbMoment(value, bbDateFieldConfig.currentCultureDateFormatString.toUpperCase())) && dateHasSeparator(value);
            }
            
            function beautifyDate(value, format) {
                var datePart,
                    dateArray,
                    date,
                    separator,
                    parts,
                    yearBegin,
                    monthBegin,
                    dayBegin,
                    formatSeparator,
                    lowerFormat,
                    upperFormat = format.toUpperCase(),
                    year,
                    yearPart = upperFormat.indexOf('Y') === 0 ? 0 : 2;

                if (value) {

                    separator = matchSeparator(value); // look for common separators
                    parts = value.split(separator); // split value based on found separator
                    lowerFormat = format.toLowerCase(); // system expects lowercase format
                    
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
                    
                    year = Number(parts[yearPart]);
                    if (year < 100) {
                        parts[yearPart] = year <= bbDateFieldConfig.twoDigitYearRolloverMax ? year + 2000 : year + 1900;
                        value = parts.join(separator);
                        return value;
                    }

                    //If date is passed in as SQL UTC string, we need to do some magic to make sure we don't lose a day due to time zone shifts
                    if (typeof value === "string" && value.indexOf("T00:00:00") !== -1) {
                        datePart = value.split("T")[0];
                        dateArray = datePart.split("-");
                        date = new Date(dateArray[0], (dateArray[1] - 1), dateArray[2]);
                        return stripLocaleCharacterFromDateString(bbMoment(date).format(upperFormat));
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
                        /*istanbul ignore next: sanity check */
                        return value;
                    }
                }

                return value;
            }

            function getLocaleDate(value) {
                var date,
                    dateArray,
                    separator,
                    formatUpper = bbDateFieldConfig.currentCultureDateFormatString.toUpperCase();

                //If the value is not a valid representation of a date, let the validator handle it
                if (!isNaN(value)) {
                    return value;
                }
                
                //If the date array doesn't have enough parts or any part is zero, return it as is and let the validator handle it, otherwise create a date
                separator = value.match(/[.\/\-\s].*?/);
                dateArray = value.split(separator);

                if (dateArray.length !== 3 || dateArray.some(function (e) {
                        return Number(e) === 0;
                    })) {
                    return value;
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
                        datefieldHTML = $templateCache.get('sky/templates/datefield/datefield.html'),
                        errorMessage,
                        skipValidation;

                    function resolveValidation(deferred) {
                        deferred[errorMessage ? 'reject' : 'resolve']();
                    }

                    function setInputDate() {
                        if (ngModel.$viewValue) {
                            el.datepicker('setValue', ngModel.$viewValue);
                            input.val(ngModel.$viewValue);
                        }
                    }

                    function setDateValue(value, trigger) {
                        ngModel.$setViewValue(value, trigger);
                        setInputDate(value);
                    }

                    input = el.children('input');

                    input.on('change', function () {
                        if (input.val() === "") {
                            errorMessage = null;
                            ngModel.invalidFormatMessage = null;
                        }
                        setDateValue(input.val(), 'change');
                    });

                    ////set model value as well as datepicker control value when manually entering a date.
                    ngModel.$asyncValidators.dateFormat = function () {
                        var deferred,
                            localeDate,
                            value,
                            customFormattinedResult;

                        function handleCustomFormattingValidation(result) {
                            var formattedValue;

                            /*istanbul ignore next: sanity check */
                            result = result || {};
                            formattedValue = result.formattedValue;

                            errorMessage = result.formattingErrorMessage;

                            ngModel.invalidFormatMessage = errorMessage;

                            resolveValidation(deferred);

                            if (formattedValue !== value) {
                                skipValidation = true;

                                input.val(formattedValue);
                                setDateValue(formattedValue);
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
                                value = beautifyDate(input.val(), bbDateFieldConfig.currentCultureDateFormatString);
                                /*istanbul ignore else: sanity check */
                                if (angular.isDefined(value)) {
                                    //Need to set input to value to validate
                                    localeDate = getLocaleDate(value);
                                    if (value !== "Invalid date" && localeDate !== "Invalid date") {
                                        if (validateDate(localeDate, ngModel.required)) {
                                            errorMessage = null;
                                            skipValidation = true;
                                            input.val(localeDate);
                                            setDateValue(localeDate);
                                        } else {
                                            errorMessage = bbResources.date_field_invalid_date_message;
                                            ngModel.invalidFormatMessage = errorMessage;
                                            el.datepicker('setValue', '');
                                        }
                                    } else {
                                        errorMessage = bbResources.date_field_invalid_date_message;
                                        ngModel.invalidFormatMessage = errorMessage;
                                        el.datepicker('setValue', '');
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
                        setInputDate(ngModel.$viewValue);
                    };

                    //IE11 inserts left-to-right characters (code 8206) for locale strings, removing for now
                    today = getLocaleDate(new Date());

                    //Set up HTML
                    el.attr('data-date-format', bbDateFieldConfig.currentCultureDateFormatString)
                        .attr('data-date', today)
                        .append(datefieldHTML);

                    if (hasCustomFormatting) {
                        input.addClass('datefield-customformatting');
                    }

                    input.attr('placeholder', (hasCustomFormatting ? "" : bbDateFieldConfig.currentCultureDateFormatString.toLowerCase()));

                    el.datepicker().on('changeDate', function (ev) {
                        var value = null;

                        errorMessage = null;
                        skipValidation = true;

                        // Need to clear validation
                        el.datepicker('set', ev.date);
                        value = el.data('date');
                        validateDate(value, ngModel.required);

                        setDateValue(value);

                        el.datepicker('hide');
                    });

                    //Override the place function to align the picker with the left side of the input
                    el.datepicker.Constructor.prototype.place = function () {
                        /*istanbul ignore next: sanity check */
                        var offset = this.component ? this.component.offset() : this.element.offset();
                        this.picker.css({
                            top: offset.top + this.height,
                            left: offset.left - 118
                        });
                    };
                    
                    //I have to do this because for some reason we're using bootstrap-datepicker-eyecon and not the regular bootstrap datepicker.
                    el.datepicker.Constructor.prototype.remove = function () {
                        this.hide();
                        this.picker.remove();
                        delete this.element.data().datepicker;
                        delete this.element.data().date;
                    };

                    // Setup max length for input control
                    input.attr('maxlength', '10');

                    scope.$on('$destroy', function () {
                        el.datepicker('remove');
                    });
                },
                replace: true,
                require: 'ngModel',
                restrict: 'E',
                template: function (el, attrs) {
                    /*jslint unparam: true */
                    var html = '<div class="date input-group"><input type="text"';

                    if (attrs.id) {
                        html += ' id="' + attrs.id + '"';
                    }

                    if (attrs.bbautoField) {
                        html += ' data-bbauto-field="' + attrs.bbautoField + 'Input"';
                    }

                    html += '/ class="has-right-addon text-box single-line form-control"></div>';

                    return html;
                }
            };
        }]);

}());
/*jshint browser: true */
/*global angular */

/** @module Daterangepicker
 @description The DateRangePicker directive allows you to easily choose a date range from a well-known set of options.  A DateRangePicker service also exists to work hand-in-hand with the directive to provide more service-oriented functionality.

### Date Range Picker Settings ###

 - `bb-date-range-picker-value` An object tracking the value of the date range picker control.  Right now, the only proeprty of the object is `.dateRangeType` gives you the integer (ENUM) value of the date range typ that was selected in the picker.  See the DateRangePicker service for details of this ENUM.
 - `bb-date-range-picker-automation-id` A string to use when creating the bb-auto-field attribute on elements in the date range picker
 - `bb-date-range-picker-options` Optional. An options object that can be provided to customize the behavior of the date range picker.

### Date Range Picker Options Settings ###

 - `availableDateRangeTypes` Optional. An array of integers (`dateRangeTypes` ENUM) to specify the ordered list of date range types to be included in the dropdown.  Common variations can be found in the DateRangePicker service.

### Date Range Picker Service ###
This service provides additional functionality that works closely with the directive.  Below are a list of members provided by the service.

 - `dateRangeTypes` An ENUM of all types of date ranges that are understood by the DateRangePicker and can be available in the dropdown.
 - `defaultDateRangeOptions` An array of `dateRangeTypes` providing the default order and set of date range types that are included in the dropdown.
 - `pastDateRangeOptions` An array of `dateRangeTypes` that are appropriate for filtering for things that have occurred in the past.  For example, you wouldn't want to be able to search for items created 'next month'.
 - `getDateRangeTypeCaption` A function for getting the caption of the dropdown item selected for a given `bb-date-range-picker-value`.
 - `getDateRangeFilterDescription` A function for getting an appropriate description string explaining the meaning of a given `bb-date-range-picker-value`.
 */

(function () {
    'use strict';
    angular.module('sky.daterangepicker', ['sky.resources'])
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
        return tagsToReplace[tag];
    }

    function isEmpty(str) {
        return str === null || angular.isUndefined(str);
    }

    angular.module('sky.format', [])
        .factory('bbFormat', function () {
            return {
                formatText: function (format) {
                    var args;

                    if (isEmpty(format)) {
                        return '';
                    }

                    args = arguments;

                    return String(format).replace(/\{(\d+)\}/g, function (match, capture) {
                        /*jslint unparam: true */
                        return args[parseInt(capture, 10) + 1];
                    });
                },
                escape: function (str) {
                    if (isEmpty(str)) {
                        return '';
                    }

                    return String(str).replace(/[&<>]/g, replaceTag);
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
/*global angular */

(function () {
    'use strict';
    
    angular.module('sky.grids.actionbar', ['sky.mediabreakpoints', 'sky.resources'])
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
}());
/*global angular */

(function () {
    'use strict';
    angular.module('sky.grids.filters', ['sky.help', 'sky.resources', 'sky.mediabreakpoints'])
    .directive('bbGridFilters', ['bbHelp', 'bbResources', 'bbMediaBreakpoints', function (bbHelp, bbResources, bbMediaBreakpoints) {
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
                            $scope.updateFilters(args.filters);
                            
                            if (bbMediaBreakpoints.getCurrent().xs) {
                                $scope.expanded = false;    
                            }
                        }      
                    };
                    $scope.clearFilters = function () {
                        var args = {},
                            options = $scope.bbOptions;

                        if (options && options.clearFilters) {
                            options.clearFilters(args);
                            $scope.updateFilters(args.filters);
                        }
                    };
                }],
                link: function ($scope, element, attrs, bbGrid) {
                    /*jslint unparam: true */
                    var box = element.find('.bb-grid-filters-box'),
                        filtersContainer = element.find('.bb-grid-filters-container');
                    
                    $scope.viewKeeperOptions = {};

                    bbGrid.viewKeeperChangedHandler = function (val) {
                        $scope.viewKeeperOptions.viewKeeperOffsetElId = val;
                    };

                    bbGrid.toggleFilterMenu = function () {
                        $scope.expanded = !$scope.expanded;
                        if ($scope.expanded) {
                            bbHelp.close();
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
                            $scope.updateFilters(args.filters);
                        }
                    };

                    $scope.resources = bbResources;
                    
                }],
                link: function ($scope, element, attrs, bbGrid) {
                    /*jslint unparam: true */
                    var toolbarContainer = element.parents('.bb-grid-container').find('.bb-grid-toolbar-container .bb-grid-filter-summary-container');

                    toolbarContainer.append(element);

                    $scope.updateFilters = function (filters) {
                        bbGrid.setFilters(filters);
                    };

                    $scope.openFilterMenu = function () {
                        if (bbGrid.openFilterMenu) {
                            bbGrid.openFilterMenu();
                        }
                    };

                    $scope.$watch(function () { 
                        return element.is(':visible');
                    }, function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            bbGrid.syncViewKeepers();
                        }
                    });
                },
                templateUrl: 'sky/templates/grids/filterssummary.html'
            };
        }]);
}());

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
        - `allow_see_more` Allows the column to have a see more link to view overflow content.
        - `caption` The text to display in the column header and column chooser.
        - `category` A category for the column, can be used to filter in the column chooser.
        - `center_align` True if the column header and contents should be center aligned. 
        - `controller` The controller function if the column is templated. This allows a cell to perform logic while displaying formatted or complex data.
        - `description` A description for the column, seen in the column chooser.
        - `exclude_from_search` If true, then the column does not highlight text on search.
        - `id` A unique identifier for the column.  The ID is referenced by the option object's `selectedColumnIds` property.
        - `jsonmap` The name of the property that maps to the column's data.
        - `name` The name of the column.
        - `right_align` True if the column header and contents should be right aligned. 
        - `template_url` The url for the column template to show formatted or complex data in a cell. The properties of the cell data object can be accessed using the format `data.property_name`.
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
        MULTISELECT_COLUMN_SIZE = 35,
        DROPDOWN_TOGGLE_COLUMN_SIZE = 40,
        DROPDOWN_TOGGLE_COLUMN_NAME = 'dropdownToggle',
        MULTISELECT_COLUMN_NAME = 'cb',
        TOP_SCROLLBAR_HEIGHT = 18;

    angular.module('sky.grids', ['sky.modal', 'sky.mediabreakpoints', 'sky.viewkeeper', 'sky.highlight', 'sky.resources', 'sky.data', 'sky.grids.columnpicker', 'sky.grids.filters', 'sky.grids.actionbar'])
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
                            /*istanbul ignore else: sanity check */
                            if ($scope.syncViewKeepers) {
                                $scope.syncViewKeepers();
                            }
                        };

                        self.syncActionBarViewKeeper = function () {
                            /*istanbul ignore else: sanity check */
                            if (angular.isFunction($scope.syncActionBarViewKeeper)) {
                                $scope.syncActionBarViewKeeper();
                            }
                        };

                        self.resetMultiselect = function () {
                            /*istanbul ignore else: sanity check */
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
                        var breakpoints = {},
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
                            
                            if (breakpoints.xs) {
                                return column.width_xs > 0 ? column.width_xs : columnDefault;
                            } else if (breakpoints.sm) {
                                return column.width_sm > 0 ? column.width_sm : columnDefault;
                            } else if (breakpoints.md) {
                                return column.width_md > 0 ? column.width_md : columnDefault;
                            } else if (breakpoints.lg) {
                                return column.width_lg > 0 ? column.width_lg : columnDefault;
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
                                    classes: 'grid-dropdown-cell bb-grid-dropdown-cell',
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
                            /*istanbul ignore else: sanity check */
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
                        
                        function getScrollbarHeight() {
                            return (totalColumnWidth > (topScrollbar.width())) && !breakpoints.xs ? TOP_SCROLLBAR_HEIGHT : 0;
                        }
                        
                        function resetTopScrollbar() {
                            topScrollbarDiv.width(totalColumnWidth);
                            topScrollbarDiv.height(getScrollbarHeight());
                            topScrollbar.height(getScrollbarHeight());
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
                        
                        function getLastIndex() {
                            var lastIndex = $scope.options.selectedColumnIds.length - 1;
                            
                            if (locals.multiselect) {
                                lastIndex = lastIndex + 1;
                            }
                            if (getContextMenuItems) {
                                lastIndex = lastIndex + 1;
                            }
                            
                            return lastIndex;
                        }
                        
                        function resizeStart(event, index) {
                            var lastIndex = getLastIndex(),
                                jqGridEl,
                                thEls;
                            
                            jqGridEl = element.find('.ui-jqgrid');
                            
                            //if resizing last element and tableEl smaller than table wrapper
                           
                            if (index === lastIndex && tableWrapperWidth > jqGridEl.width()) {
                                //increase width of child of table-responsive
                                jqGridEl.width(tableWrapperWidth);
                                //increase width of hdiv
                                element.find('.ui-jqgrid-hdiv').width(tableWrapperWidth);
                                //make padding right on tr of headers
                                element.find('.ui-jqgrid-hdiv tr').css('padding-right', tableWrapperWidth.toString() + 'px');
                            }
                            
                            fullGrid.find('.ui-jqgrid-resize-mark').height(fullGrid.height());
                            thEls = element.find('.ui-jqgrid .ui-jqgrid-hdiv .ui-jqgrid-htable th');
                            resizeStartColWidth = parseInt(thEls[index].style.width);

                        }
                        
                        function syncHeaderToTableWrapper() {
                            if (vkHeader.isFixed) {
                                header.width(tableWrapper.width());
                                header.scrollLeft(tableWrapper.scrollLeft());
                            }
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
                                    syncHeaderToTableWrapper();
                                    
                                    return;
                                }
                                resetExtendedColumn();
                            }
                                
                            totalColumnWidth = totalColumnWidth + changedWidth;
                            tableEl.setGridWidth(totalColumnWidth, false);
                            resetTopScrollbar();
                            syncHeaderToTableWrapper();

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

                        function setAllFancyCheck(status) {
                            $(element.find('.cbox')).each(function () {
                                this.checked = status;
                            }).iCheck('update');
                        }
                        
                        function resetMultiselect() {
                            clearSelectedRowsObject();
                            tableEl.resetSelection();
                            
                            setAllFancyCheck(false);
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
                            
                            setAllFancyCheck(status);
                            
                            $scope.$apply();
                        }

                        function updateFancyCheckboxCell(i, status) {
                            var checkboxEl;
                            
                            checkboxEl = element.find('td .cbox');
                            if (checkboxEl.length > (i - 1)) {
                                checkboxEl[(i - 1)].checked = status;
                                checkboxEl.eq(i - 1).iCheck('update');
                            }
                        }
                        
                        function updateFancyCheckboxHeader(status) {
                            var checkboxEl;
                            
                            checkboxEl = header.find('th .cbox');
                            
                            if (checkboxEl.length > 0) {
                                checkboxEl[0].checked = status;
                                checkboxEl.eq(0).iCheck('update');
                            }
                        }
                        
                        function onSelectRow(rowId, status) {
                            var index,
                                row = $scope.options.data[(rowId - 1)];

                            updateFancyCheckboxHeader(false);
                            
                            index = arrayObjectIndexOf(locals.selectedRows, row);

                            if (status === true && index === -1 && row) {
                                locals.selectedRows.push(row);
                                updateFancyCheckboxCell(rowId, true);
                            } else if (status === false && index > -1) {
                                locals.selectedRows.splice(index, 1);
                                updateFancyCheckboxCell(rowId, false);
                            }
                            
                            $scope.$apply();
                        } 
                        
                        function setMultiselectRow(i) {
                            var row;
                            
                            tableEl.setSelection(i, false);
                            row  = $scope.options.data[(i - 1)];
                            locals.selectedRows.push(row);
                            updateFancyCheckboxCell(i, true);
                        }
                        
                        function beforeSelectRow(rowId, e) {
                            var endIndex,
                                i,
                                lastSelectedRow,
                                startIndex = parseInt(rowId);
                            
                            if (e.shiftKey) {
                                lastSelectedRow = tableEl.getGridParam('selrow');
                                resetMultiselect();
                                
                                //if lastSelectedRow is undefined or null, set to 1
                                if (angular.isUndefined(lastSelectedRow) || lastSelectedRow === null) {
                                    lastSelectedRow = 1;
                                }

                                endIndex = parseInt(lastSelectedRow);
                                
                                //set shift click selection first so last selected row is set properly
                                if (endIndex < startIndex) {
                                    for (i = startIndex; i >  endIndex - 1; i = i - 1) {
                                        setMultiselectRow(i);
                                    }
                                } else if (endIndex > startIndex) {
                                    for (i = startIndex; i <  endIndex + 1; i = i + 1) {
                                        setMultiselectRow(i);
                                    }
                                } else {
                                    $scope.$apply();
                                    return true; 
                                }
                                
                                $scope.$apply();
                                return false; 
                            } 
                            return true;
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
                        
                        function setUpFancyCheckHeader() {
                            var headerCheckEl =  header.find('th .cbox');
                            headerCheckEl.iCheck({
                                checkboxClass: 'bb-check-checkbox'
                            });
                            
                            headerCheckEl.off('click.i');
                            element.find('th .bb-check-checkbox').off('click.i');
                            element.find('th .iCheck-helper').off('mousedown');
                            element.find('th .iCheck-helper').off('mouseup');
                            element.find('th .iCheck-helper').off('click');
                            
                            
                            element.find('th .iCheck-helper').on('click', function () {
                                element.find('th .cbox').trigger('click');
                            });
                            
                        }
                        
                        function setUpFancyCheckCell() {
                            element.find('td .cbox').iCheck(
                            {
                                checkboxClass: 'bb-check-checkbox'
                            });
                                    
                            element.find('td .cbox').off('click');
                            element.find('td .bb-check-checkbox').off('click');
                            element.find('td .iCheck-helper').off('click');
                                    
                        }
                        
                        function destroyFancyCheck() {
                            element.find('td .cbox').iCheck('destroy');
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
                            destroyFancyCheck();

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
                                    beforeSelectRow: beforeSelectRow,
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
                                
                                setUpFancyCheckHeader();

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
                            /*istanbul ignore else: sanity check */
                            if ($scope.options) {
                                columns = $scope.options.columns;
                                /*istanbul ignore else: sanity check */
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
                                    /*istanbul ignore else: sanity check */
                                    if (result.text.hasOwnProperty(p)) {
                                        template = result.text[p];

                                        /*istanbul ignore else: sanity check */
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
                            /*istanbul ignore else: sanity check */
                            if (tableDomEl.addJSONData) {
                                loadColumnTemplates(function () {
                                    refreshMultiselect();
                                    
                                    destroyFancyCheck();
                                    
                                    destroyCellScopes();
                                    tableDomEl.addJSONData(rows);
                                    $timeout(highlightSearchText);
                                    handleTableWrapperResize();
                                    /*istanbul ignore next: sanity check */
                                    updateGridLoadedTimestampAndRowCount(rows ? rows.length : 0);
                                    
                                    element.find('td').attr('unselectable', 'on');
                                    
                                    setUpFancyCheckCell();

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

                            /*istanbul ignore else: sanity check */
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
                            /*istanbul ignore else: sanity check */
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
                            /*istanbul ignore else: sanity check */
                            if (vkToolbars) {
                                vkToolbars.syncElPosition();
                            }
                        };

                        $scope.syncActionBarViewKeeper = function () {
                            /*istanbul ignore else: sanity check */
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
                            
                            destroyFancyCheck();
                            $(element.find('th .iCheck-helper')).off('click');
                            
                            bbMediaBreakpoints.unregister(mediaBreakpointHandler);
                        });
                    },
                    templateUrl: 'sky/templates/grids/grid.html'
                };
            }]);
}(jQuery));
/*jslint browser: true, plusplus: true */
/*global angular, jQuery */

/** @module Help
 @description ### Additional Dependencies ###

 - **[easyXDM](http://easyxdm.net/wp/) (2.4.19 or higher)** Used to make cross-domain requests to the help server

---

The Help service allows other Angular components to open or close the help panel programmatically.  When the widget is opened, it will interrogate the page to identify the current help topic and display the relevant help content.  Settings for this service are controlled with the `bbHelpConfig` object.

### bbHelpConfig Settings ###

 - `productId` The current product identifier used to build the URL to the product's help content.
 - `url` The URL to the Help Widget that will be included.
 - `customLocales` Optional.  An array of additional locales for which the product has help content other than the default help content locale.  This array should contain strings like 'en-gb' or 'fr'.

 */

(function () {
    'use strict';

    angular.module('sky.help', ['ui.router'])
        .constant('bbHelpConfig', {
            onHelpLoaded: null,
            productId: 'Sky',
            customLocales: [],
            url: null
        })
        .factory('bbHelp', ['$state', '$window', 'bbHelpConfig', function ($state, $window, bbHelpConfig) {
            function open() {
                var args = arguments;
                
                function openInner() {
                    $window.BBHELP.HelpWidget.open.apply($window.BBHELP.HelpWidget, args);
                }
                
                if ($window.BBHELP && $window.BBHELP.HelpWidget) {
                    openInner();
                } else {
                    if (!bbHelpConfig.url) {
                        throw new Error('bbHelpConfig.url is not defined.');
                    }

                    jQuery.ajax({
                        cache: true,
                        dataType: 'script',
                        url: bbHelpConfig.url
                    }).done(function () {
                        var config = angular.extend({}, bbHelpConfig);

                        if (!config.getCurrentHelpKey) {
                            config.getCurrentHelpKey = function () {
                                // $state.current.helpKeyOverride outranks $state.current.pageData.helpKey
                                if ($state.current.helpKeyOverride) {
                                    return $state.current.helpKeyOverride;
                                }

                                
                                if ($state.current.pageData) {
                                    return $state.current.pageData.helpKey;
                                }
                                return null;
                            };
                        }

                        $window.BBHELP.HelpWidget.load(config);
                        
                        openInner();
                    });
                }
            }
            
            function close() {
                if ($window.BBHELP && $window.BBHELP.HelpWidget) {
                    $window.BBHELP.HelpWidget.close.apply($window.BBHELP.HelpWidget, arguments);
                }
            }
            
            return {
                open: open,
                close: close
            };
        }]);

}());

/*jslint browser: true, plusplus: true */
/*global angular */

/** @module Helpbutton
 @description The Helpbutton directive creates a help icon which can be clicked to launch a specific help key that is different than the default page help context.  Optionally, it can override the page help context throughout the duration that the helpbutton exists on the page.

### Help Button Settings ###

 - `bb-help-key` Specifies the help key that will be opened when the help button is clicked.
 - `bb-set-help-key-override` *(Default: `false`)* If `true`, then this button will override the current page help context, so clicking on the help ear will open to this help key while this button exists.
 
 */

(function () {
    'use strict';

    angular.module('sky.helpbutton', ['sky.help'])
        .directive('bbHelpButton', ['$state', '$window', 'bbHelp', function ($state, $window, bbHelp) {
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
                    bbHelp.open(attrs.bbHelpKey);
                });
            }

            return {
                link: link
            };
        }]);

}());

/*jslint browser: true, plusplus: true */
/*global angular, jQuery */

/** @module Helpwidget
 @description ### *Deprecated* ###

This directive is no longer being maintained.  For showing the help panel from a controller, see the [Help](#help) service.

<s>
### Additional Dependencies ###

 - **[easyXDM](http://easyxdm.net/wp/) (2.4.19 or higher)** Used to make cross-domain requests to the help server

---

The Helpwidget directive includes the help widget on the page.  When the widget is opened, it will interrogate the page to identify the current help topic and display the relevant help content.  Settings for this directive are controlled with the `bbHelpwidgetConfig` object.

### bbHelpwidgetConfig Settings ###

 - `productId` The current product identifier used to build the URL to the product's help content.
 - `url` The URL to the Help Widget that will be included.
 - `customLocales` Optional.  An array of additional locales for which the product has help content other than the default help content locale.  This array should contain strings like 'en-gb' or 'fr'.
 </s>
 */

(function () {
    'use strict';

    angular.module('sky.helpwidget', [])
        .constant('bbHelpwidgetConfig', {
            onHelpLoaded: null,
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
                    var config = angular.extend({}, bbHelpwidgetConfig);

                    if (!config.getCurrentHelpKey) {
                        config.getCurrentHelpKey = function () {
                            // $state.current.helpKeyOverride outranks $state.current.pageData.helpKey
                            if ($state.current.helpKeyOverride) {
                                return $state.current.helpKeyOverride;
                            }

                            if ($state.current.pageData) {
                                return $state.current.pageData.helpKey;
                            }
                            return null;
                        };
                    }

                    window.BBHELP.HelpWidget.load(config);
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

/** @module Highlight
 @description The Highlight directive allows you to highlight portions of text inside DOM elements.  Set the `bb-highlight` attribute to the text you want to highlight and all matching text within the element will be highlighted.

Optionally use the `bb-highlight-beacon` attribute to reprocess the matching text content when content is changed.
 */


(function () {
    'use strict';

    angular.module('sky.highlight', [])
        .factory('bbHighlight', function () {
            var DATA_CLASS_NAME = 'bb-hightlight-class',
                DEFAULT_CLASS_NAME = 'highlight';
        
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
                    
                    classn = classn || DEFAULT_CLASS_NAME;

                    el.data(DATA_CLASS_NAME, classn);
                    
                    if (node.nodeType === 3) {
                        pos = node.data.toUpperCase().indexOf(pat);
                        if (pos >= 0) {
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
                var classn = el.data(DATA_CLASS_NAME) || DEFAULT_CLASS_NAME;

                return el.find('span.' + classn).each(function () {
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

                    scope.$watch('highlightText', function () {
                        highlight();
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

/** @module Mediabreakpoints
 @description ### Additional Dependencies ##

 - **[enquire.js](http://wicky.nillia.ms/enquire.js/) (2.1.2 or later)**

---

The Media Breakpoints service can call one or more callback functions whenever a [Bootstrap grid system breakpoint](http://getbootstrap.com/css/#grid-media-queries) is hit.  This allows for
manipulating the UI programmatically in cases where CSS media queries are not sufficient.

### Media Breakpoint Methods ###

 - `register(callback)` Registers a callback method with the service that will be called any time a media breakpoint is hit.  The callback function will be called with the following arguments:
  - `breakpoint` An object with `xs`, `sm`, `md` and `lg` properties.  The property corresponding with the current breakpoint will be set to `true` and the rest set to `false`.
 - `unregister(callback)` Unregisters the specified callback method.  This should be called whenever the controller's `$scope` is destroyed.
 - `getCurrent()` Gets the current media breakpoint object.
 */

(function (window) {
    'use strict';

    var mediaBreakpointsConfig = {
            mediaQueries: {
                xs: '(max-width: 767px)',
                sm: '(min-width: 768px) and (max-width: 991px)',
                md: '(min-width: 992px) and (max-width: 1199px)',
                lg: '(min-width: 1200px)'
            }
        },
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
            
            /*istanbul ignore else */
            if (handler) {
                handler(bp);
            }
        }
    }

    (function (register) {
        /* istanbul ignore next boilerplate RequireJS detection */
        if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            require(['enquire'], register);
        } else if (window.enquire) {
            // Browser globals
            register(enquire);
        }
    }(function (enquire) {
        var mediaQueries = mediaBreakpointsConfig.mediaQueries,
            p;
        
        function registerQuery(name) {
            enquire.register(mediaQueries[name], function () {
                updateStatus(name);
            });
        }
        
        for (p in mediaQueries) {
            /*istanbul ignore else */
            if (mediaQueries.hasOwnProperty(p)) {
                registerQuery(p);
            }
        }
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
        .constant('bbMediaBreakpointsConfig', mediaBreakpointsConfig)
        .factory('bbMediaBreakpoints', function () {
            return mediaBreakpoints;
        });
}(this));
/*jshint browser: true */
/*global angular, jQuery */

/** @module Modal
 @description The Modal directive and service can be used to launch modals in a consistent way in a Sky application.  Rather than using the ui-bootstrap `$modal.open`, use `bbModal.open` instead.  This will take the same options object but allows for some custom default behaviors in Sky.

In addition to the `bbModal` service for lauching modals, a `bb-modal` directive should be used to have common look-and-feel for modal content.  Within `bb-modal`, use `bb-modal-header` to include a common modal header, `bb-modal-footer` to include a common modal footer and buttons, and `bb-modal-body` to wrap the modal's body content.

### Modal Header Settings ###

 - `bb-modal-help-key` Specifies the help key for the modal.  This will be be linked from a help button included in the modal header.

### Modal Footer Buttons ##

 - `bb-modal-footer-button` Generic button for the modal footer.  HTML included in this tag will be included in the contents of the button.  You must register events for the button manually.

 - `bb-modal-footer-primary-button` Primary button for the modal footer which will have a custom look.  Default content is 'Save', but HTML included in this tag will be included as the contents of the button if provided.  You must register events for the button manually.

 - `bb-modal-footer-cancel-button` Cancel button for the modal footer.  Default content is 'Cancel', but HTML included in this tag will be included as the contents of the button if provided.  This button will automatically cancel the modal form.

 */

(function ($) {
    'use strict';
    
    var openModalCount = 0;
    
    angular.module('sky.modal', ['sky.helpbutton', 'sky.resources', 'ui.bootstrap'])
        .factory('bbModal', ['$modal', '$window', function ($modal, $window) {
            return {
                open: function (opts) {
                    var bodyEl,
                        isIOS,
                        modalInstance,
                        scrollTop;
                    
                    function modalClosed() {
                        openModalCount--;
                        if (isIOS) {
                            bodyEl
                                .removeClass('bb-modal-open-mobile')
                                .scrollTop(scrollTop);
                        }
                        
                        bodyEl = null;
                    }
                    
                    isIOS = /iPad|iPod|iPhone/i.test($window.navigator.userAgent);
                    bodyEl = $(document.body);
                    
                    // Change default values for modal options
                    opts = angular.extend({
                        backdrop: 'static',
                        windowClass: 'bb-modal'
                    }, opts);
                    
                    // Mobile browsers exhibit weird behavior when focusing on an input element
                    // inside a position: fixed element (in this case the modal), and it also
                    // doesn't propery prohibit scrolling on the window.  Adding this CSS class
                    // will change the body position to fixed and the modal position to absolute
                    // to work around this behavior.
                    if (isIOS) {
                        // Setting the body position to be fixed causes it to be scrolled to the
                        // top.  Cache the current scrollTop and set it back when the modal is 
                        // closed.
                        scrollTop = bodyEl.scrollTop();
                        bodyEl.addClass('bb-modal-open-mobile');
                    }

                    modalInstance = $modal.open(opts);
                    openModalCount++;
                    
                    modalInstance.result.then(modalClosed, modalClosed);
                    
                    return modalInstance;
                }
            };
        }])
        .directive('bbModal', ['$timeout', function ($timeout) {
            function getPixelValue(val) {
                val = val || '0';
                
                return parseFloat(val.replace('px', ''));
            }
            
            return {
                controller: ['$scope', function ($scope) {
                    this.setBodyEl = function (bodyEl) {
                        $scope.bodyEl = bodyEl;
                    };
                }],
                replace: true,
                transclude: true,
                restrict: 'E',
                templateUrl: 'sky/templates/modal/modal.html',
                link: function ($scope, el) {
                    var bodyEl,
                        resizeTimeout,
                        windowEl = $(window);
                    
                    function fitToWindow() {
                        var margin,
                            modalParentEl,
                            newMaxHeight,
                            reservedHeight;
                        
                        if (bodyEl) {
                            modalParentEl = el.parents('.modal-dialog');

                            margin = getPixelValue(modalParentEl.css('margin-bottom')) + getPixelValue(modalParentEl.css('margin-top'));
                            
                            reservedHeight = margin + el.find('.modal-header').outerHeight() + el.find('.modal-footer').outerHeight();

                            newMaxHeight = windowEl.height() - reservedHeight;

                            bodyEl.css('max-height', newMaxHeight);
                        }
                    }
                             
                    $scope.$watch('bodyEl', function (newValue) {
                        bodyEl = newValue;
                        fitToWindow();
                    });
                    
                    $timeout(function () {
                        fitToWindow();
                    }, 0);

                    windowEl.on('resize.bbModal' + $scope.$id, function () {
                        $timeout.cancel(resizeTimeout);
                        
                        resizeTimeout = $timeout(function () {
                            fitToWindow();
                        }, 250);
                    });
                    
                    el.on('$destroy', function () {
                        windowEl.off('.bbModal' + $scope.$id);
                    });
                }
            };
        }])
        .directive('bbModalBody', function () {
            return {
                link: function (scope, el, attrs, modalCtrl) {
                    modalCtrl.setBodyEl(el);
                },
                require: '^bbModal',
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
                templateUrl: 'sky/templates/modal/modalheader.html',
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
                templateUrl: 'sky/templates/modal/modalfooter.html'
            };
        })
        .directive('bbModalFooterButton', function () {
            return {
                replace: true,
                transclude: true,
                require: '^bbModalFooter',
                restrict: 'E',
                templateUrl: 'sky/templates/modal/modalfooterbutton.html'
            };
        })
        .directive('bbModalFooterButtonPrimary', ['bbResources', function (bbResources) {
            return {
                replace: true,
                transclude: true,
                require: '^bbModalFooter',
                restrict: 'E',
                templateUrl: 'sky/templates/modal/modalfooterbuttonprimary.html',
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
                templateUrl: 'sky/templates/modal/modalfooterbuttoncancel.html',
                link: function ($scope, el) {
                    if (el.children().length === 0) {
                        el.append("<span>" + bbResources.modal_footer_cancel_button + "</span>");
                    }
                }
            };
        }]);
}(jQuery));

/*global angular */

(function (window) {
    'use strict';

    function defineModule(moment) {
        angular.module('sky.moment', [])
            .constant('bbMoment', moment);
    }
    
    /*istanbul ignore next boilerplate require gunk */
    if (typeof window.define === 'function' && window.define.amd) {
        window.define(['moment'], defineModule);
    } else if (window.module !== undefined && window.module && window.module.exports) {
        defineModule(window.require('moment'));
    } else {
        defineModule(window.moment);
    }

}(this));
/*jslint browser: true, plusplus: true */
/*global angular */

/** @module Money
 @description ### *Deprecated* ###

This directive is no longer being maintained.  For formatting currency in a textbox, see the [Autonumeric](#autonumeric) directive.

<s>
### Additional Dependencies ###

 - **[autoNumeric](http://www.decorplanit.com/plugin/) (1.9.27 or higher)** Used to format money values

---

The Money Input directive formats currency values as the user types in the input field.  The formatting options can be set globally using the `bbMoneyConfig` service.

### Config Options ###

 - `currencyPositivePattern` *(Default: `$n`)* The pattern used to format positive currency values.
 - `currencyDecimalDigits` *(Default: `2`)* The number of digits to display after the decimal separator.
 - `currencyDecimalSeparator` *(Default: `.`)* The character to display before the decimal digits.
 - `currencyGroupSize` *(Default: `3`)* The number of digits each group should contain before displaying the group separator character.
 - `currencyGroupSeparator` *(Default: `,`)* The character to display between groups.
 - `currencySymbol` *(Default: `$`)* The symbol that represents the value's currency type.
 </s>
 */

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

/*global angular, jQuery */

/** @module Navbar
 @description The navbar directive creates a Bootstrap `nav` element with the appropriate Sky classes applied to it and its children, and also adds behavior such as showing sub-navigation items when the user hovers over the dropdown.
 */

(function ($) {
    'use strict';

    function toggleOpen(el, action) {
        $(el)[action + 'Class']('open');
    }

    angular.module('sky.navbar', [])
        .directive('bbNavbar', function () {
            return {
                restrict: 'E',
                replace: true,
                transclude: true,
                templateUrl: 'sky/templates/navbar/navbar.html',
                link: function (scope, el) {
                    /*jslint unparam: true */
                    $(el).on('mouseenter', '.dropdown', function () {
                        toggleOpen(this, 'add');
                    }).on('mouseleave', '.dropdown', function () {
                        toggleOpen(this, 'remove');
                    }).on('click', '.dropdown-menu a', function () {
                        toggleOpen($('.dropdown', el), 'remove');
                    });
                }
            };
        });
}(jQuery));
/*global angular, jQuery */

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
                            $(".bb-navbar").addClass("bb-navbar-showmobile");
                        }

                        searchBox.attr('placeholder', bbOmnibarConfig.searchPlaceholder);

                        scope.searchBox = searchBox;

                        searchBox.on('keyup', function (event) {
                            var value = searchBox.val();

                            /*istanbul ignore else */
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
                                        /*istanbul ignore next: super edge case */
                                        return;
                                    }
                                } else {
                                    return;
                                }
                            }

                            // Log out and redirect to auth service.
                            $window.location.href = bbOmnibarConfig.signOutUrl;
                        }
                    }

                    $.ajax({
                        cache: true,
                        dataType: 'script',
                        url: bbOmnibarConfig.url
                    }).done(function () {
                        var loadOptions = angular.extend(bbOmnibarConfig, {
                            afterLoad: afterLoad,
                            userLoaded: userLoaded,
                            menuEl: omnibarMenuEl
                        });

                        $window.BBAUTH.Omnibar.load(omnibarEl, loadOptions);
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

/** @module Page
 @description The Page directive provides functionality around loading pages.

### Page Settings ###

 - `bb-page-status` The status of the page.
    - `LOADING` Denotes the page is currently loading.
    - `LOADED` Denotes the page has successfully finished loading.
    - `NOT_AUTHORIZED` Denotes the page has finished loading and should show the unauthorized content.
    - `NOT_FOUND` Denotes the page is has finished loading and should redirect to the not found page.
 - `bb-page-uses-load-manager` Allow the page to use the bb-data load manager.
 */

(function () {
    'use strict';

    angular.module('sky.page', [])
        .constant('bbPageConfig', {
            redirectUrl: null,
            notFoundUrl: null
        })
        .factory('bbPage', [function () {
            var pageStatuses;

            pageStatuses = {
                LOADING: 0,
                LOADED: 1,
                NOT_AUTHORIZED: 2,
                //ERROR: 3,
                NOT_FOUND: 4
            };

            return {
                pageStatuses: pageStatuses
            };
        }])
        .directive('bbPage', ['$window', 'bbResources', 'bbPage', 'bbPageConfig', 'bbData', '$location',
            function ($window, bbResources, bbPage, bbPageConfig, bbData, $location) {
                function link(scope, element) {
                    var loadManager,
                        locals;

                    function navigateAway() {
                        $window.location.href = bbPageConfig.redirectUrl || $window.location.origin;
                    }

                    function noPageStatusSpecified() {
                        return element.attr('bb-page-status') === undefined;
                    }
                    
                    function onShowing() {
                        if (scope.bbPageUsesLoadManager) {
                            loadManager = locals.loadManager = bbData.loadManager({
                                scope: scope,
                                waitForFirstItem: true,
                                nonblockWaitForAdditionalItems: true,
                                isAggregate: true
                            });
                        }
                    }

                    locals = scope.locals = {
                        navigateAway: navigateAway,
                        noPageStatusSpecified: noPageStatusSpecified,
                        pageStatuses: bbPage.pageStatuses,
                        onShowing: onShowing
                    };

                    scope.resources = bbResources;

                    scope.$watch('bbPageStatus', function (value, oldValue) {
                        scope.value = "something";
                        scope.oldValue = oldValue;

                        if (!value) {
                            scope.$emit("bbBeginWait");
                        } else if (value && !oldValue) {
                            scope.$emit("bbEndWait");
                        }

                        if (value === locals.pageStatuses.NOT_AUTHORIZED) {
                            if (loadManager) {
                                loadManager.cancelWaiting();
                            }
                        } else if (value === locals.pageStatuses.NOT_FOUND) {
                            if (loadManager) {
                                loadManager.cancelWaiting();
                            }

                            $location.path(bbPageConfig.notFoundUrl).replace();
                        }

                    });
                }

                return {
                    restrict: 'E',
                    scope: {
                        bbPageStatus: '=?',
                        bbPageUsesLoadManager: '@?'
                    },
                    templateUrl: 'sky/templates/page/page.html',
                    transclude: true,
                    link: link
                };
            }]);
}());
/*global angular */

/** @module Pagination
 @description The Pagination directive allows list data to be displayed across multiple pages.  When the number of items in the list exceeds the page size, a pagination control is displayed.

The `bb-pagination-content` directive and the `bbPaging` service are used in conjunction with this directive.  The `bb-pagination-content` is used to wrap the paged content so that the height of the wrapper can be kept as a constant height across pages regardless of contents.  When the list data is bound, the height of the largest page will be used for the wrapper so that the height of the list will not fluctuate as the user pages through it.
The `bbPaging` service is used to create the paged data and responds to changes in the pagination directive.

### Pagination Settings ###

 - `bb-pagination` The paged data initialized by the `bbPaging` service.
 - `bb-pagination-disabled` Determines whether the use can interact with the pagination control.

### Pagination Content Settings ##

 - `bb-pagination-content` The paged data initialized by the `bbPaging` service.
  
### Paging Settings ##
These are optional properties of the object passed to `bbPaging.init()`

 - `currentPage` *(Default: `1`)* The initial page to display
 - `itemsPerPage` *(Default: `5`)* The number of items to display per page
 */

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
/*global angular, jQuery */

/** @module Popover
 @description The `bb-popover-template` directive enables an HTML-formatted popover to be displayed via a trigger element. This directive is an alternative to the `popover` directive from Angular UI Bootstrap, making it easier
to define markup in a template rather than directly in the view's controller.

The `bb-popover-template` attribute should specify a URL for a template in the `$templateCache` that will be used as the popover content. The scope applied to this template inherits the current scope.  A `hide` function is also
provided on the scope to dismiss the popover.

The directive is built as a thin wrapper of the [Angular UI Bootstrap Popver](http://angular-ui.github.io/bootstrap/) directive and supports all of it's optional properties.
 */

(function ($) {
    'use strict';

    angular.module('sky.popover', ['sky.data'])
        .directive('bbPopoverTemplatePopup', ['$templateCache', '$compile', '$timeout', '$window', function ($templateCache, $compile, $timeout, $window) {
            return {
                restrict: 'EA',
                replace: true,
                scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
                templateUrl: 'sky/templates/popover/popup.html',
                compile: function () {
                    return function ($scope, el) {
                        var compiledEl,
                            html = $templateCache.get($scope.content),
                            origScope,
                            popoverFlyoutScope,
                            popoverTriggerScope,
                            windowEl = $($window);

                        function removeTooltip() {
                            /*istanbul ignore else: sanity check */
                            if (el) {
                                el.remove();
                                el = null;
                            }
                            /*istanbul ignore else: sanity check */
                            if (popoverFlyoutScope) {
                                popoverFlyoutScope.$destroy();
                                popoverFlyoutScope = null;
                            }
                        }

                        function windowClickHandler(e) {
                            if (!el.is(e.target) && el.has(e.target).length === 0) {
                                $scope.$apply(function () {
                                    popoverFlyoutScope.hide();
                                });
                            }
                        }

                        //Get the scope of the popover directive.
                        popoverTriggerScope = $scope.$parent.$parent;

                        //Get the original scope that contains the popover directive
                        origScope = popoverTriggerScope.$parent;

                        //Create a new scope that will be bound to the template inside the flyout.  Base
                        //this scope on the original scope that contained the popover directive.
                        popoverFlyoutScope = origScope.$new();

                        popoverFlyoutScope.hide = function () {
                            $scope.$parent.$parent.isOpen = false;

                            //Borrowed from $tooltip, need to remove the item after the animation
                            $timeout(removeTooltip, 500);
                        };

                        $scope.$watch('isOpen()', function (value) {
                            if (value) {
                                $timeout(function () {
                                    windowEl.on('click', windowClickHandler);
                                });
                            } else {
                                windowEl.off('click', windowClickHandler);
                            }
                        });

                        compiledEl = $compile(html)(popoverFlyoutScope);
                        el.find('.popover-content').html(compiledEl);
                        popoverFlyoutScope.$apply();
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
        .constant('bbResources', {
            /* Strings are defined in separate JSON files located in js/sky/locales. */
        });
}());
/*jshint browser: true */
/*global angular */

/** @module Scroll into view
 @description The `bb-scroll-into-view` directive causes an element to scroll into the viewport whenever its bound value changes.

### Settings ###

 - `bb-scroll-into-view` The value that triggers the scroll.
 - `bb-scroll-into-view-highlight` A Boolean indicating whether the element should be highlighted when scrolling completes.
*/

(function () {
    'use strict';

    var CLS_HIGHLIGHTING = 'bb-scroll-into-view-highlighting',
        RETRY_INTERVAL = 100,
        RETRY_MAX = 10;

    angular.module('sky.scrollintoview', [])
        .constant('bbScrollIntoViewConfig', {
            reservedBottom: 0,
            reservedTop: 0
        })
        .factory('bbScrollIntoView', ['$window', 'bbScrollIntoViewConfig', function ($window, bbScrollIntoViewConfig) {
            function highlightEl(el, options) {
                if (options.highlight) {
                    
                    // The automatic CSS class removal should be factored out once we have some more instances
                    // where we use animations.
                    el
                        .addClass(CLS_HIGHLIGHTING)
                        .one(
                            'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', 
                            /*istanbul ignore next */
                            function () {
                                el.removeClass(CLS_HIGHLIGHTING);
                            }
                        );
                }
            }
            
            function getScrollableParentEl(el) {
                var overflowY,
                    parentEl = el.parent();
                
                while (parentEl.length > 0) {
                    if (parentEl.is('body')) {
                        return parentEl;
                    }
                    
                    overflowY = parentEl.css('overflow-y');
                    
                    /*istanbul ignore else: sanity check (the computed overflow property will likely never return a non-string value) */
                    if (angular.isString(overflowY)) {
                        switch (overflowY.toUpperCase()) {
                        case 'AUTO':
                        case 'HIDDEN':
                        case 'SCROLL':
                            return parentEl;
                        }
                    }
                    
                    parentEl = parentEl.parent();
                }
            }
            
            function scrollIntoView(el, options) {
                var currentScrollTop,
                    elBottom,
                    elHeight,
                    elOffset,
                    elTop,
                    elToScroll,
                    isScrolledOffBottom,
                    isScrolledOffTop,
                    newScrollTop,
                    parentEl,
                    parentElIsBody,
                    parentHeight,
                    reservedBottom,
                    reservedTop,
                    viewportHeight;

                parentEl = getScrollableParentEl(el);
                parentElIsBody = parentEl.is('body');
                
                options = options || {};
                
                reservedBottom = options.reservedBottom;
                reservedTop = options.reservedTop;
                
                if (!angular.isDefined(reservedBottom)) {
                    reservedBottom = 0;
                    
                    if (parentElIsBody) {
                        reservedBottom = bbScrollIntoViewConfig.reservedBottom || 0;
                    }
                }
                
                if (!angular.isDefined(reservedTop)) {
                    reservedTop = 0;
                    
                    if (parentElIsBody) {
                        reservedTop = bbScrollIntoViewConfig.reservedTop || 0;
                    }
                }
                
                if (options.highlight) {
                    reservedBottom += 50;
                    reservedTop += 50;
                }
                
                currentScrollTop = parentEl.scrollTop();
                
                elOffset = el.offset();
                elHeight = el.outerHeight();

                elTop = elOffset.top;
                
                if (!parentElIsBody) {
                    elTop = (elTop - parentEl.offset().top) + currentScrollTop;
                }
                
                elBottom = elTop + elHeight;

                parentHeight = parentElIsBody ? angular.element(window).height() : parentEl.height();

                isScrolledOffBottom = elBottom > parentHeight + (currentScrollTop - reservedBottom);
                isScrolledOffTop = elTop < (currentScrollTop + reservedTop);

                if (isScrolledOffBottom || isScrolledOffTop) {
                    if (isScrolledOffBottom) {
                        newScrollTop = elBottom - (parentHeight - reservedBottom);
                    }

                    viewportHeight = parentHeight - (reservedTop + reservedBottom);

                    // Ensure the top of the element is visible after scrolling even if it is currently
                    // scrolled off the bottom of the viewport.
                    if (!isScrolledOffBottom || elHeight > viewportHeight) {
                        newScrollTop = elTop - reservedTop;
                    }
                    
                    elToScroll = parentElIsBody ? angular.element('html, body') : parentEl;

                    elToScroll.animate(
                        {
                            scrollTop: newScrollTop
                        },
                        {
                            duration: 250,
                            always: function () {
                                highlightEl(el, options);
                            }
                        }
                    );
                } else {
                    highlightEl(el, options);
                }
            }

            return scrollIntoView;
        }])
        .directive('bbScrollIntoView', ['$timeout', 'bbScrollIntoViewConfig', 'bbScrollIntoView', function ($timeout, bbScrollIntoViewConfig, bbScrollIntoView) {
            function link(scope, el, attrs) {
                var options,
                    previousTimeout,
                    retryCount;

                function doScroll(firstTry) {
                    if (previousTimeout) {
                        // Make sure any pending scrolling is canceled.
                        $timeout.cancel(previousTimeout);
                    }

                    if (firstTry) {
                        retryCount = 0;
                    }
                    
                    /*istanbul ignore else: hard to reach in a unit test */
                    if (el.is(':visible') && el.children('.collapsing').length === 0) {
                        options = angular.extend({}, bbScrollIntoViewConfig);

                        if (attrs.bbScrollIntoViewHighlight) {
                            options.highlight = scope.$eval(attrs.bbScrollIntoViewHighlight);
                        }
                        
                        bbScrollIntoView(el, options);
                    } else if (retryCount < RETRY_MAX) {
                        // Keep trying to scroll until the element is visible or we run out of retry attempts.
                        retryCount++;
                        previousTimeout = $timeout(doScroll, RETRY_INTERVAL);
                    }
                }

                /*istanbul ignore else: sanity check */
                if (attrs.bbScrollIntoView) {
                    scope.$watch(attrs.bbScrollIntoView, function (newValue, oldValue) {
                        if (newValue && newValue !== oldValue) {
                            doScroll(true);
                        }
                    });
                }
            }

            return {
                link: link,
                restrict: 'A'
            };
        }]);
}());
/*jslint browser: true */
/*global angular, jQuery */

/** @module Searchfield
 @description ### Additional Dependencies ###

 - **[ui-select](https://github.com/angular-ui/ui-select) (0.11.0 or higher - .js and .css files needed)**

---

The Searchfield directive allows you to easily build single- and multi-search fields that can be filtered as the user types.  This directive uses all the syntax and settings of the `ui-select` third party control (see the `ui-select` documentation for more information, options, and settings).

The search field can be used for a local search (i.e. dropdown box where you have all the data already loaded), or it can be used for a remote search to search larger datasets on a server.  Both types support single- and multi-search capabilities.

### Local Search Settings ###

 - `ui-select-choices`
   - `repeat` Required. An expression that defines the array of choices.  If a `filter` is included, then the choices will be filtered by what the user types, otherwise it will behave just a like a normal dropdown box.  See the `ui-select` documentation for more information.

### Remote Search Settings ###
 
 - `ui-select-choices`
   - `repeat` Required. An expression that defines the array of choices that will be populated from a remote server.  See the `ui-select` documentation for more information.
   - `refresh` Required. A function call to load the results from a remote server. The function should at least take `$select.search` as a parameter, and it should guard against calling the remote server with an empty search value.
     - ***NOTE:** The search control needs to know when you get results back from the server in order to properly display a "no results" message when necessary.  In your refresh function, after you receive and store the results, then you MUST fire the `bbSearchFinished` event like this:  `$scope.$broadcast('bbSearchFinished');`.*
   - `refresh-delay` Optional. The delay in milliseconds after the last keystroke before kicking off the remote search. Default from `ui-select` is 1000 ms.

### Single Search Settings ###

 - `ui-select-match` The text of the selection to display in the search field. Note: The value should use the `$select.selected` syntax.
   - `allow-clear` Optional. Allows you to clear the current value by rendering an "X" button.
   - `placeholder` Optional. Default text when no selection is present.

### Multiple Search Settings ###

 - `ui-select`
   - `multiple` Required. Styles the search to accept multiple search values.
 - `ui-select-match` The text of the selection to display in the search field. Note: The value should use the `$item` syntax.
   - `placeholder` Optional. Default text when no selection is present.
 */

(function ($) {
    'use strict';

    angular.module('sky.searchfield', ['sky.resources'])
        .directive('uiSelectMatch', ['$timeout', function ($timeout) {
            return {
                restrict: 'EA',
                replace: false,
                require: '^uiSelect',
                link: function (scope, element, attrs, $select) {
                    var selectContainerEl,
                        origSizeSearchInputFunc,
                        matchEl,
                        windowResizeTimeout;

                    function sizeMatchItems() {
                        //The main logic flow for this function was taken from the ui-select's "sizeSearchInput()" function.
                        //Some things are done below in order to give the tags time to render before we try to fix any
                        //text overflow issues that may be present.

                        function updateIfVisible(containerOffsetWidth) {
                            var visible = (containerOffsetWidth > 0);

                            if (visible) {
                                //Get the container width minus any padding
                                containerOffsetWidth -= containerOffsetWidth - angular.element(selectContainerEl).width();

                                //For each match item, set the properly width so that text overflows properly
                                matchEl.find('.ui-select-match-item').css({
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: containerOffsetWidth
                                });
                            }

                            return visible;
                        }

                        $timeout(function () { //Give tags time to render correctly
                            updateIfVisible(selectContainerEl.offsetWidth);
                        });
                    }

                    if ($select.multiple) {
                        matchEl = element;
                        selectContainerEl = matchEl.parent().parent()[0];
                        origSizeSearchInputFunc = $select.sizeSearchInput;

                        //Hook into the ui-select function that controls resizing for multi search
                        $select.sizeSearchInput = function () {
                            origSizeSearchInputFunc();
                            sizeMatchItems();
                        };

                        //Resize any tags on load
                        sizeMatchItems();
                
                        $(window).on('resize.searchField' + scope.$id, function () {
                            $timeout.cancel(windowResizeTimeout);
                            
                            windowResizeTimeout = $timeout(function () {
                                sizeMatchItems();
                            }, 250);
                        });
                        
                        scope.$on('$destroy', function () {
                            $(window).off('resize.searchField' + scope.$id);
                        });
                    }
                }
            };
        }])
        .directive('uiSelectChoices', ['bbResources', function (bbResources) {
            return {
                restrict: 'EA',
                replace: false,
                require: '^uiSelect',
                link: function (scope, element, attrs, $select) {
                    var searching,
                        selectContainerEl,
                        msgEl;

                    function updateUIForSearch(showSearchingMsg) {
                        var msg;

                        // Remove the no results message if it's currently displayed
                        if (msgEl) {
                            msgEl.remove();
                            msgEl = null;
                        }

                        if (searching && $select.items.length === 0) {
                            // Display the "Searching..." or "No results..." message - only when we have empty results because we
                            //don't want the message to popup over a list of results as the user types.
                            msg = showSearchingMsg ? bbResources.searchfield_searching : bbResources.searchfield_no_records;
                            msgEl = angular.element('<ul class="ui-select-choices ui-select-choices-content dropdown-menu"><li class="bb-searchfield-no-records">' + msg + '</li></ul>');
                            selectContainerEl.append(msgEl);
                        }
                    }

                    function clearResults() {
                        searching = false;
                        $select.items = []; // Clear out current result set
                        updateUIForSearch();
                    }

                    //Remote Searches Only
                    //If the refresh attribute is set the control is being used as a remote search
                    if (attrs.refresh) {
                        selectContainerEl = angular.element(element).parent();
                        searching = false;

                        //Watch when the search field is opened/closed so that we can update the UI and remove
                        //the no results message, and remove the results for the next search.
                        scope.$watch('$select.open', function () {
                            clearResults();
                        });

                        //Watch the search results collection for any changes.
                        //NOTE: This does NOT fire when the collection is empty and the search result
                        //comes back empty.  To handle that case, see the "bbSearchFinished" event below.
                        scope.$watchCollection('$select.items', function () {
                            updateUIForSearch();
                        });

                        //This event should be fired by the consuming code after it gets and stores the results
                        //from the remote server.  This allows us to handle the problem above where $watchCollection
                        //doesn't fire when the collection is empty and the results also come back empty.
                        scope.$on("bbSearchFinished", function () {
                            updateUIForSearch();
                        });

                        //Watch all changes to the search text that the user is typing.
                        scope.$watch('$select.search', function (search) {
                            searching = (search && search.length > 0);

                            if (searching) {
                                //Initially shows the "Searching..." message until results come back from the remote server
                                updateUIForSearch(true);
                            } else {
                                clearResults();
                            }
                        });
                    }
                }
            };
        }]);
}(jQuery));
/*jslint browser: true, plusplus: true */
/*global angular */

/** @module Tabs
 @description ### *Deprecated* ###

This directive is no longer being maintained.  For creating tabs, see the [Angular UI Bootstrap](https://angular-ui.github.io/bootstrap/) tabs directive and use it in conjunction with the [Tabscroll](#tabscroll) and [Tabsref](#tabsref) components if needed.

<s>
### Additional Dependencies ###

 - **[jQuery Responsive Tabs](https://github.com/jellekralt/Responsive-Tabs) (1.4.2 or higher)**
 - **[Angular UI Router](https://github.com/angular-ui/ui-router) (0.2.13 or higher)**

---

The Tabs directive allows for content to be organized into a set of tabs.  The tabs can be grouped together across the tab bar in a `bb-tab-group`.  Within the group,  `bb-tab-group-item` specifies the tab components that can be opened.

### Tab Group Item Settings ###

 - `bb-tab-item-header` The name of the tab
 - `bb-tab-item-count` Optional.  The number of items in the tab.
 - `bb-tab-item-header-function` Optional.  A function which can calculate the tab header and item count.
 - `bbTabItemSref` Optional.  Defines the state reference (?) for the tab.
 </s>
 */

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
        .directive('bbTab', ['$state', '$rootScope', '$timeout',
            function ($state, $rootScope, $timeout) {
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
                                            // JPB - Delay calling state.go because the state change will fail
                                            // if it is triggered while in the middle of processing of another state change.
                                            // This can happen if you browse to the page without specifying the state of a particular tab
                                            // and then this code tries to switch you over to the state of the first tab.
                                            $timeout(function () {
                                                $state.go(sref);
                                            }, 0);
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
                    $scope.$watch('bbTabItemHeader', function (newValue) {
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
/*global angular, jQuery */

/** @module Tabscroll
 @description ### Additional Dependencies ###

The `bb-tab-scroll` directive causes the row of tabs to be horizontally scrollable when the width of the tabs exceeds the width of its container.  The tabs are also animated to indicate to the user that they can be scrolled.

### Tab Scroll Settings ###

 - `bb-tab-scroll-ready` Used to indicate the tabs are ready to be animated.  This should be used when the tabs are loaded dynamically based on some asynchronous logic like loading data from a web server.
 */

(function ($) {
    'use strict';
    
    var tabScrollId = 0;
    
    angular.module('sky.tabscroll', ['ui.bootstrap.tabs'])
        .directive('bbTabScroll', ['$timeout', '$window', function ($timeout, $window) {
            return {
                require: 'tabset',
                link: function (scope, el, attrs) {
                    var lastWindowResizeTimeout,
                        lastWindowWidth;
                    
                    function getNavTabsEl() {
                        return el.children('.nav-tabs');
                    }
                    
                    function getScrollLeftForEl(navTabsEl, selector) {
                        var elWidth,
                            scrollLeft,
                            tabEl,
                            tabLeft,
                            tabPosition,
                            tabRight;
                        
                        if (angular.isString(selector)) {
                            tabEl = navTabsEl.children(selector);
                        } else {
                            tabEl = selector;
                        }
                        
                        tabPosition = tabEl.position();
                        
                        if (tabPosition) {
                            tabLeft = tabPosition.left;
                            
                            if (tabLeft < 0) {
                                scrollLeft = tabLeft + navTabsEl[0].scrollLeft;
                            } else {
                                elWidth = el.width();
                                tabRight = tabLeft + tabEl.width();
                                
                                if (tabRight > elWidth) {
                                    scrollLeft = navTabsEl[0].scrollLeft + (tabRight - elWidth);
                                }
                            }
                        }
                        
                        return scrollLeft;
                    }
                    
                    function getScrollLeft(navTabsEl) {
                        return getScrollLeftForEl(navTabsEl, '.active') || 0;
                    }
                    
                    function stopAnimateTabScroll(navTabsEl) {
                        navTabsEl.stop(true, true);
                    }
                    
                    function animateTabScroll(navTabsEl, scrollLeft, duration) {
                        stopAnimateTabScroll(navTabsEl);
                        
                        navTabsEl
                            .animate(
                                {
                                    scrollLeft: scrollLeft
                                },
                                {
                                    duration: duration || 500
                                }
                            );
                    }
                    
                    function showTabsCanScroll(force) {
                        var hasOverflow,
                            navTabsEl = getNavTabsEl(),
                            overflowOccurred,
                            scrollLeft;

                        /*istanbul ignore else: sanity check */
                        if (navTabsEl.length > 0) {
                            hasOverflow = angular.isDefined(getScrollLeftForEl(navTabsEl, 'li:first')) ||
                                angular.isDefined(getScrollLeftForEl(navTabsEl, 'li:last'));
                            
                            force = force || angular.isDefined(getScrollLeftForEl(navTabsEl, '.active'));
                            
                            overflowOccurred = !showTabsCanScroll.previousHadOverflow && hasOverflow;
                            
                            if (force || overflowOccurred) {
                                scrollLeft = getScrollLeft(navTabsEl);

                                stopAnimateTabScroll(navTabsEl);

                                if (overflowOccurred) {
                                    navTabsEl.scrollLeft(navTabsEl[0].scrollWidth - el.width());
                                }

                                animateTabScroll(navTabsEl, scrollLeft);
                            }
                        }
                        
                        showTabsCanScroll.previousHadOverflow = hasOverflow;
                    }
                    
                    tabScrollId++;
                    
                    el.addClass('bb-tab-scroll');
                    
                    if (attrs.bbTabScrollReady) {
                        scope.$watch(attrs.bbTabScrollReady, function (newValue, oldValue) {
                            if (newValue && newValue !== oldValue) {
                                showTabsCanScroll(true);
                            }
                        });
                    }
                    
                    lastWindowWidth = $($window).width();
                    
                    // Show initial scroll animation whenever the window width changes.
                    $($window).on('resize.tabscroll' + tabScrollId, function () {
                        var windowWidth = $($window).width();
                        
                        if (lastWindowWidth !== windowWidth) {
                            $timeout.cancel(lastWindowResizeTimeout);
                            
                            lastWindowResizeTimeout = $timeout(function () {
                                showTabsCanScroll();
                            }, 250);
                        }
                        
                        lastWindowWidth = windowWidth;
                    });
                    
                    // Ensure that when a tab is clicked the tab is fully visible and not partially
                    // scrolled off either side.
                    el.on('click', '> .nav-tabs > li', function () {
                        var navTabsEl,
                            scrollLeft;
                        
                        navTabsEl = getNavTabsEl();
                        scrollLeft = getScrollLeftForEl(navTabsEl, $(this));
                                
                        if (angular.isDefined(scrollLeft)) {
                            animateTabScroll(navTabsEl, scrollLeft, 250);
                        }
                    });
                    
                    el.on('$destroy', function () {
                        $($window).off('.tabscroll' + tabScrollId);
                    });
                }
            };
        }]);
}(jQuery));
/*global angular */

/** @module Tabsref
 @description ### Additional Dependencies ###

 - **[Angular UI Router](https://github.com/angular-ui/ui-router) (0.2.13 or higher)**

---

The Tab Sref directive adds the ability to change the page's URL when the user clicks a tab.  This also allows for users to navigate straight to a selected tab from a hyperlink.

### Tab Sref Settings ###

 - `bb-tab-sref` The name of the state where the application should navigate when the tab is selected.
 */

(function () {
    'use strict';
    
    angular.module('sky.tabsref', ['ui.bootstrap.tabs'])
        .directive('bbTabSref', ['$rootScope', '$state', '$timeout', function ($rootScope, $state, $timeout) {
            return {
                require: ['^tabset', 'tab'],
                link: function (scope, el, attrs, controllers) {
                    var active = attrs.active,
                        sref = attrs.bbTabSref,
                        stateChangeDeregistration,
                        tabsetCtrl = controllers[0];

                    function checkCurrentState() {
                        if ($state.is(sref)) {
                            tabsetCtrl.select(el.isolateScope());
                        }
                    }
                    
                    /*istanbul ignore else sanity check */
                    if (active && sref) {
                        checkCurrentState();
                        
                        stateChangeDeregistration = $rootScope.$on('$stateChangeSuccess', function () {
                            checkCurrentState();
                        });

                        scope.$watch(active, function (newValue) {
                            if (newValue && !$state.is(sref)) {
                                // JPB - Delay calling state.go because the state change will fail
                                // if it is triggered while in the middle of processing of another state change.
                                // This can happen if you browse to the page without specifying the state of a particular tab
                                // and then this code tries to switch you over to the state of the first tab.
                                $timeout(function () {
                                    $state.go(sref);
                                }, 0);
                            }
                        });
                        
                        scope.$on('$destroy', function () {
                            stateChangeDeregistration();
                        });
                    }
                }
            };
        }]);
}());

/*jslint nomen: true, plusplus: true */
/*global angular */

/** @module Templating
 @description The Templating directives allow you to place formatted text inside a tokenized string template.  This avoids the need to build HTML manually on the server or in a custom directive where HTML injection bugs are common.
The string template is specified with the `bb-template` attribute, and child elements with the `bb-template-item` attribute are the elements that contain the formatted text.

### Template Settings ###

 - `bb-template` The tokenized string that represents the template.  Tokens use the {n} notation where n is the ordinal of the item to replace the token.
 */

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

    angular.module('sky.templating', ['sky.format'])
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

/** @module Textexpand 
 @description The Text Expand directive truncates long text with an ellipsis and a "Read more" link that allows the user to fully expand the text.  If the text length falls below the specified threshold then no action is taken.

Note that collapsed text will have newlines removed.  Also, if one or more newlines are detected, the text is automatically collapsed regardless of the total length of the text.

### Text Expand Settings ###

 - `bb-text-expand` The text to truncate.
 - `bb-text-expand-max-length` *(Default: 200)* The number of characters to show before truncating the text.  The directive will attempt to look back up to 10 characters for a space and truncate there in order to avoid truncating in the middle of a word.

The Text Expand Repeater directive truncates a list of repeater items and will initially display a set number of items.  Any items over the set maximum limit are hidden until the user elects to expand the list.

### Text Expand Repeater Settings ###

- `bb-text-expand-repeater-max` The maximum number of items to show before truncating the repeater list.
- `bb-text-expand-repeater-data` The name of the property containing the repeater data.
 */

(function () {
    'use strict';

    var modules = [
            'sky.resources',
            'sky.scrollintoview'
        ];

    function getNewlineCount(value) {
        var matches = value.match(/\n/gi);

        if (matches) {
            return matches.length;
        }

        return 0;
    }

    angular.module('sky.textexpand', modules)
        .directive('bbTextExpandRepeater', ['bbResources', function (bbResources) {
            function link(scope, el, attrs) {
                scope.$watch(attrs.bbTextExpandRepeaterData, function (data) {
                    var length,
                        maxToShow,
                        seeMoreEl,
                        seeMoreText = bbResources.text_expand_see_more,
                        seeLessText = bbResources.text_expand_see_less;

                    if (data) {
                        length = data.length;
                        maxToShow = +attrs.bbTextExpandRepeaterMax;
                        seeMoreEl = angular.element('<a class="bb-text-expand-see-more">' + seeMoreText + '</a>');

                        if (length > maxToShow) {
                            el.find('li:gt(' + (maxToShow - 1) + ')').addClass('bb-text-expand-toggle-li').hide().end().append(
                                seeMoreEl.click(function () {
                                    seeMoreEl.siblings('.bb-text-expand-toggle-li').toggle(100);
                                    if (seeMoreEl.hasClass('bb-text-expand-see-more')) {
                                        seeMoreEl.text(seeLessText);
                                    } else {
                                        seeMoreEl.text(seeMoreText);
                                    }
                                    
                                    seeMoreEl.toggleClass('bb-text-expand-see-more');
                                })
                            );
                        }
                    }
                });
            }

            return {
                link: link
            };
        }])
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

                    // Jump ahead one character and see if it's a space, and if it isn't,
                    // back up to the first space and break there so a word doesn't get cut
                    // in half.
                    for (i = length; i > length - 10; i--) {
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
                        textEl,
                        spaceEl;

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

                    /* istanbul ignore else: nothing happens when there's no value, so there's nothing to test. */
                    if (newValue) {
                        collapsedText = getTruncatedText(newValue, maxLength, maxNewlines);
                        expandedText = getTruncatedText(newValue, maxExpandedLength, maxExpandedNewlines); // Get text based on max expanded length

                        if (collapsedText !== newValue) {
                            isExpanded = true;

                            textEl = angular.element('<span class="bb-text-expand-text"></span>');
                            textEl.text(collapsedText);

                            ellipsisEl = angular.element('<span class="bb-text-expand-ellipsis">...</span>');

                            spaceEl = angular.element('<span class="bb-text-expand-space"> </span>');

                            expandEl = angular.element('<a href="#" class="bb-text-expand-see-more"></a>');
                            expandEl.text(bbResources.text_expand_see_more);

                            containerEl
                                .empty()
                                .append(textEl)
                                .append(ellipsisEl)
                                .append(spaceEl)
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

                    /* istanbul ignore next: these internal variables can't be tested. */
                    el.on('$destroy', function () {
                        containerEl = null;
                        expandEl = null;
                        textEl = null;
                        spaceEl = null;
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

/** @module Tiles
 @description The `bb-tile` directive creates a collapsible container and is the bulding block for pages and forms in a Sky application.  The `bb-tile-section` directive is used to create padded sections inside a `bb-tile` element. Additionally, the `bb-tile-header-content` directive may be placed inside the `bb-tile` directive to add summary information to the tile.  If you simply need to show a check mark indicating the tile has data, you can add a `bb-tile-header-check` element to the `bb-tile-header-content` element.

When used on forms, it automatically adjusts the background color on the form and shrinks the tile header.

### Tile Settings ###

 - `bb-tile-header` The header text for the tile.
 - `bb-tile-settings-click` A function to call when the user clicks the settings button (indicated by a wrench icon) in the tile header.  If not specified, the settings button is not displayed.
 */

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

    angular.module('sky.tiles', ['sky.mediabreakpoints'])
        .directive('bbTile', ['$timeout', function ($timeout) {
            return {
                link: function (scope, el, attrs) {
                    var displayModeChanging = false,
                        tileInitialized = false,
                        parentModal;

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

                        tiles = tiles || /*istanbul ignore next: default value */ [];

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
                    
                    function updateHeaderContent() {
                        var wrapperEl;
                        
                        scope.hasHeaderContent = !!scope.headerContentEl;
                        
                        if (scope.headerContentEl) {
                            wrapperEl = el.find('.bb-tile-header-with-content:first');
                            
                            wrapperEl.append(scope.headerContentEl);
                        }
                    }
                    
                    scope.isCollapsed = scope.bbTileCollapsed || false;
                    scope.smallTileDisplayMode = false;
                    scope.tileId = '';

                    //If the tile is inside a modal form, then add a class to modify the form background color.
                    parentModal = el.parents('div.modal-body');
                    if (parentModal && parentModal.length > 0) {
                        parentModal.addClass('modal-body-tiled');
                    }

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
                        var tiles = data.tiles || /*istanbul ignore next: default value */ [];

                        if (!tileInitialized) {
                            //retrieve the tile id from the parent container
                            scope.tileId = el.parent().attr('data-tile-id') || /*istanbul ignore next: default value */ '';
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
                        
                        scope.bbTileCollapsed = scope.isCollapsed;
                    });

                    if (attrs.bbTileCollapsed) {
                        scope.$watch('bbTileCollapsed', function (newValue) {
                            scope.isCollapsed = newValue;
                        });
                    }
                    
                    scope.hasSettings = !!attrs.bbTileSettingsClick;
                    
                    updateHeaderContent();
                },
                replace: true,
                restrict: 'E',
                scope: {
                    bbTileCollapsed: '=?',
                    bbTileSettingsClick: '&?',
                    tileHeader: '=bbTileHeader'
                },
                controller: ['$scope', function ($scope) {
                    this.setHeaderContentEl = function (el) {
                        $scope.headerContentEl = el;
                    };
                }],
                templateUrl: 'sky/templates/tiles/tile.html',
                transclude: true
            };
        }])
        .directive('bbTileHeaderContent', function () {
            return {
                replace: true,
                require: '^bbTile',
                restrict: 'E',
                link: function (scope, el, attrs, tileCtrl) {
                    tileCtrl.setHeaderContentEl(el);
                },
                templateUrl: 'sky/templates/tiles/tileheadercontent.html',
                transclude: true
            };
        })
        .directive('bbTileHeaderCheck', function () {
            return {
                replace: true,
                require: '^bbTileHeaderContent',
                restrict: 'E',
                templateUrl: 'sky/templates/tiles/tileheadercheck.html'
            };
        })
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
                    layout: '=bbLayout',
                    allCollapsed: '=bbTileDashboardAllCollapsed'
                },
                link: function (scope, element, attrs) {
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
                    
                    function fireDisplayModeChanged() {
                        scope.$broadcast('tileDisplayModeChanged', {
                            smallTileDisplayMode: smallTileDisplayMode,
                            tiles: scope.tiles
                        });
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
                        
                        fireDisplayModeChanged();
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
                    
                    scope.$watch('allCollapsed', function (newValue) {
                        var i,
                            n,
                            tiles = scope.tiles;
                        
                        // Check for an explicit true/false here since null/undefined is the
                        // indeterminate state.
                        if (newValue === true || newValue === false) {
                            for (i = 0, n = tiles.length; i < n; i++) {
                                if (smallTileDisplayMode) {
                                    tiles[i].collapsed_small = newValue;
                                } else {
                                    tiles[i].collapsed = newValue;
                                }
                            }
                        
                            fireDisplayModeChanged();
                        }
                    });
                    
                    scope.$on('tileStateChanged', function (event, data) {
                        /*jslint unparam: true */
                        scope.$apply(function () {
                            var allCollapsed = null,
                                collapsed,
                                collapsedProp,
                                i,
                                n,
                                tile,
                                tileId = data.tileId || /*istanbul ignore next: default value */ '',
                                tiles = scope.tiles;

                            collapsed = data.collapsed || false;
                            collapsedProp = smallTileDisplayMode ? 'collapsed_small' : 'collapsed';
                            
                            for (i = 0, n = tiles.length; i < n; i++) {
                                tile = tiles[i];
                                
                                if (tile.id === tileId) {
                                    tile[collapsedProp] = collapsed;
                                }
                                
                                if (i > 0 && tile[collapsedProp] !== allCollapsed) {
                                    allCollapsed = null;
                                } else {
                                    allCollapsed = tile[collapsedProp];
                                }
                            }
                            
                            if (attrs.bbTileDashboardAllCollapsed) {
                                scope.allCollapsed = allCollapsed;
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
/*global angular */

/** @module Toast
 @description ### Additional Dependencies ###

 - **[angular-toastr](https://github.com/Foxandxss/angular-toastr) (1.0.0-beta.2 or higher)**
 - **[ng-animate](https://docs.angularjs.org/api/ngAnimate) (optional, 1.3 or higher)**

---

The Toast service can be used to launch toats in a consistent way in a Sky application.  The service has a single method, `bbToast.open` used to launch a toast.  Optionally include the `ngAnimate` module in the application for toasts to fade in and out.

### Open Configuration Options ##

 - `message` Used to provide a basic string message for simple toasts.

 - `templateUrl` Url for a template in the `$templateCache`.  Used to provide an HTML template when displaying complex toasts.  Cannot be combined with the `message` option.

 - `controller` Used in conjunction with `templateUrl`.  Specifies the name of a controller to apply to the template's scope.

 - `resolve` Items that will be resolved and passed to the controller as locals.
 */

(function () {
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
                        controllerLocals.$scope = $rootScope.$new();
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
                    toastScope.$watch('init', function () {
                        toastScope.$evalAsync(function () {
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
        }]);
}());

/*global angular */

/** @module Tooltip
 @description The Tooltip directive enables an HTML-formatted tooltip to be displayed via a trigger element.  This directive wraps up the Angular UI Bootstrap Tooltip directive while making it easier
to define markup in a template rather than directly in the view's controller.

### Tooltip Settings ##

In addition to all the properties from the [Angular UI Bootstrap Tooltip](http://angular-ui.github.io/bootstrap/) directive, these properties may also be specified:

 - `bb-tooltip` URL for a template in the `$templateCache`.  The template HTML may contain bindings to properties in the current scope.

 - `tooltip-updater` Optional.  A property on the scope that can be watched by the directive so that when this property's value changes, the contents of the tooltip are refreshed.
 */

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
                /*istanbul ignore else */
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
/*global angular */

/** @module Validation
 @description The email validation directive allows you to validate email strings in input fields.

### Email Validation Settings ###

- `ng-model` An object to bind the email value to on the input.
- `type=email` indicates that email validation can be used.
 */

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

    var CLS_VIEWKEEPER_FIXED = 'bb-viewkeeper-fixed viewkeeper-fixed',
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

        /*istanbul ignore else: sanity check */
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

        options = options || /* istanbul ignore next */ {};

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
        .run(['$document', '$window', 'bbMediaBreakpoints', 'bbViewKeeperConfig', function ($document, $window, bbMediaBreakpoints, bbViewKeeperConfig) {
            function mediaBreakpointHandler(breakpoints) {
                //For user agents in which the omnibar follows you down the page, the ViewKeeper needs
                //to adjust for the height of the omnibar.

                //Ideally these values should be driven from a more appropriate source (omnibar js?)
                bbViewKeeperConfig.viewportMarginTop = breakpoints.xs ? 50 : 30;
            }

            if (/iPad|iPod|iPhone/i.test($window.navigator.userAgent)) {
                //On iOS the omnibar doesn't scroll with you.  Need to account for this on the styling.
                angular.element('body').addClass('omnibar-not-fixed');

                //On iOS we need to have special handling when entering textboxes to correct an issue with fixed
                //elements used by view keeper when the keyboard flys out.
                angular.element(document).on('focus', 'input', function () {
                    angular.element('body').addClass('bb-viewkeeper-ignore-fixed viewkeeper-ignore-fixed');
                }).on('blur', 'input', function () {
                    angular.element('body').removeClass('bb-viewkeeper-ignore-fixed viewkeeper-ignore-fixed');
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

                    /*istanbul ignore else */
                    if (bbBoundaryElId) {
                        boundaryEl = angular.element('#' + bbBoundaryElId);

                        /*istanbul ignore else */
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
                            if (element.height() + verticalOffset < $window.innerHeight) {
                                tempTop = 0;

                                element.removeClass('bb-grid-filters-fixed-bottom grid-filters-fixed-bottom').addClass('bb-grid-filters-fixed-top grid-filters-fixed-top');

                                element.css({
                                    top: verticalOffset + 'px'
                                });
                            } else if (scrollingDown) {
                                if (element.offset().top + element.height() > scrollPos + $window.innerHeight) {
                                    /*istanbul ignore else: sanity check */
                                    if (!tempTop) {
                                        tempTop = element.offset().top - elementStart;
                                    }

                                    element.removeClass('bb-grid-filters-fixed-top bb-grid-filters-fixed-bottom grid-filters-fixed-top grid-filters-fixed-bottom');

                                    element.css({
                                        top: tempTop
                                    });
                                } else {
                                    tempTop = 0;
                                    element.css({
                                        top: ''
                                    });
                                    element.removeClass('bb-grid-filters-fixed-top grid-filters-fixed-top').addClass('bb-grid-filters-fixed-bottom grid-filters-fixed-bottom');
                                }
                            } else {
                                if (element.offset().top < scrollPos + verticalOffset) {
                                    /*istanbul ignore else: sanity check */
                                    if (!tempTop) {
                                        tempTop = element.offset().top - elementStart;
                                    }

                                    element.removeClass('bb-grid-filters-fixed-top bb-grid-filters-fixed-bottom grid-filters-fixed-top grid-filters-fixed-bottom');

                                    element.css({
                                        top: tempTop
                                    });
                                } else {
                                    tempTop = 0;

                                    element.removeClass('bb-grid-filters-fixed-bottom grid-filters-fixed-bottom').addClass('bb-grid-filters-fixed-top grid-filters-fixed-top');

                                    element.css({
                                        top: verticalOffset + 'px'
                                    });
                                }
                            }
                        } else {
                            tempTop = 0;
                            element.removeClass('bb-grid-filters-fixed-top bb-grid-filters-fixed-bottom grid-filters-fixed-top grid-filters-fixed-bottom');
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

/** @module Wait
 @description ### Additional Dependencies ###

 - **[jquery.blockUI.js](http://malsup.com/jquery/block/) (2.66.0-2013.10.09 or higher)**

---

The Wait directive allows you to disable and visually indicate that an element is in a waiting state.
If the value bound to `bb-wait` is truthy, then the element will begin waiting until the value becomes falsey.

When `bb-wait` is set to true, the element will initially be blocked with a clear mask, but after 300ms a visual indicator will cover the element as well.
This will allow for the element to immediately be disabled but not cause visual disturbances for very brief waits.

### Multiple Waits ###
You can set the value of `bb-wait` to a numeric value to track a count of simultaneous waits.
When waits are added, increment the wait count and when they are removed then decrement the count.
This will cause the wait UI to only clear once all waits are removed.

### Full Page Waits ###
If bb-wait is added to the `<body>` tag, then a full-page version of the wait UI will be created.

### Raising Wait Events ###
Wait events can be raised from one controller to another by calling `$scope.$emit("bbBeginWait");` and `$scope.$emit("bbEndWait");` respectively.
A controller can capture that event and begin waiting its element by listening for the event and updating its own bb-wait directive.
When doing so, itshould call `stopPropagation()` on the event so that other parents won't catch it as well.
Uncaught events will raise all the way to the main controller of the application which can cause the entire page to wait.

    $scope.$on("bbBeginWait", function (event) {
        event.stopPropagation();
        $scope.myElementWaitCount += 1;
    });

### Wait Service ###
In addition to the `bb-wait` directive, a `bbWait` service exists to allow functional access to adding and removing waits on elements or the page as a whole.
This service supports the following functions

 - `beginElWait(element)` - Adds a wait for the specified element. Implicitly tracks a wait count for the element.
 - `endElWait(element)` - Removes a wait for the specified element. Implicitly tracks a wait count for the element and clears the wait UI when the count is 0.
 - `clearElWait(element)` - Removes all waits for the specified element and will clear any wait UI.
 - `beginPageWait()` - Adds a wait for the whole page (same as body element). Implicitly tracks a wait count for the element.
 - `endPageWait()` - Removes a wait for the whole page (same as body element). Implicitly tracks a wait count for the element and clears the wait UI when the count is 0.
 - `clearPageWait()` - Removes all waits for the whole page (same as body element) and will clear any wait UI.
 */

(function ($) {
    'use strict';

    angular.module('sky.wait', [])
        .factory('bbWait', ['$timeout', function ($timeout) {

            var addWait,
                removeWait,
                clearBlockOptions,
                fullPageClearBlockOptions,
                fullPageVisibleBlockOptions,
                fullPageZIndex = 20000,
                nonBlockWaitCountAttr = 'bb-wait-non-block-count',
                visibleBlockOptions,
                showingWaitAttr = 'bb-wait-showingwait',
                waitCountAttr = 'bb-wait-count';

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
                // Returns whether jquery.blockUI is loaded.
                return ($ && $.blockUI);
            }

            function isFullPage(el) {
                // Returns whether the element specified should be causing a
                // full page wait rather than just on the element itself.
                return $(el)[0] === document.body;
            }

            function getWaitCount(el, nonblocking) {
                // Returns the elements current wait count
                var attr = nonblocking ? nonBlockWaitCountAttr : waitCountAttr;
                return parseInt($(el).data(attr) || 0, 10);
            }

            function setWaitCount(el, count, nonblocking) {
                var attr = nonblocking ? nonBlockWaitCountAttr : waitCountAttr;

                // Sets the elements current wait count
                if (!count) {
                    $(el).removeData(attr);
                } else {
                    $(el).data(attr, count);
                }
            }

            function nonblockEl(el, options) {
                var childOptions = angular.extend({}, options),
                    nonblock = $(el).children(".bb-wait-nonblock");

                if (nonblock.length === 0) {
                    nonblock = $("<div class='bb-wait-nonblock'></div>");
                    $(el).append(nonblock);
                    $(nonblock).click(function () {
                        nonblock.hide();
                    });
                }
                nonblock.show();

                childOptions.nonblocking = false;

                addWait(nonblock[0], childOptions);
            }

            function unNonblockEl(el, options) {
                var childOptions = angular.extend({}, options),
                    nonblock = $(el).children(".bb-wait-nonblock");

                if (nonblock.length > 0) {
                    childOptions.nonblocking = false;
                    removeWait(nonblock[0], childOptions);
                }
            }

            function blockEl(el, options) {
                // Shows the element block UI.

                var customBlockOptions,
                    $el = $(el);

                if (!isBlockUISupported()) {
                    return;
                }

                /* istanbul ignore if: this doesn't seem ever be hit; maybe revisit. */
                if ($el.data(showingWaitAttr)) {
                    // If we're already showing the block, then don't start this again.
                    // Using a different flag than the count itself to support delaying the unblock.
                    return;
                }

                function showFullBlock() {
                    /* istanbul ignore if: this doesn't seem ever be hit; maybe revisit. */
                    if (!$el.data(showingWaitAttr)) {
                        // If we're no longer showing the wait then the block was removed before the visible block was added.
                        // We shouldn't continue to add the visible block.
                        return;
                    }

                    if (isFullPage(el)) {
                        $.blockUI(angular.extend({}, fullPageVisibleBlockOptions, customBlockOptions));
                    } else {
                        $el.block(angular.extend({}, visibleBlockOptions, customBlockOptions));
                    }
                }

                options = angular.extend({}, {
                    visualBlockDelay: 300
                }, options || /* istanbul ignore next: sanity check */ {});

                customBlockOptions = {
                    fadeIn: options.fadeIn
                };

                $el.data(showingWaitAttr, true);

                if (options.visualBlockDelay) {
                    if (isFullPage(el)) {
                        $.blockUI(fullPageClearBlockOptions);
                    } else {
                        $el.block(clearBlockOptions);
                    }

                    $timeout(showFullBlock, options.visualBlockDelay);
                } else {
                    showFullBlock();
                }
            }

            function unblockEl(el) {
                // Removes the element block UI.

                // Including a setTimeout here so that if a block is immediately re-added, then there won't be a blink
                // between turning off the current block and then adding another.
                // This timeout could default to something higher than 0 or we could make it configurable if needed.
                // A set timeout of 0 handles blocks added without async operations before starting another, which
                // would indicate that the block should have been maintained anyways.
                $timeout(function () {
                    /* istanbul ignore else: sanity check */
                    if (getWaitCount(el) === 0) {
                        var $el = $(el);

                        if (!isBlockUISupported()) {
                            return;
                        }

                        if (isFullPage(el)) {
                            $.unblockUI();
                        } else {
                            $el.unblock();
                        }
                        $(el).removeData(showingWaitAttr);
                    }
                }, 0);
            }

            addWait = function (el, options) {
                options = options || {};

                // Increases the element wait count and shows the wait if the count is above 0.
                var count = getWaitCount(el, options.nonblocking);
                count += 1;

                setWaitCount(el, count, options.nonblocking);
                if (count === 1) {
                    if (options.nonblocking) {
                        nonblockEl(el, options);
                    } else {
                        blockEl(el, options);
                    }
                }
            };

            removeWait = function (el, options) {
                options = options || {};

                // Decreases the element wait count and hides the wait if the count is at 0.
                var count = getWaitCount(el, options.nonblocking);
                if (count > 0) {
                    count -= 1;

                    setWaitCount(el, count, options.nonblocking);
                    if (count === 0) {
                        if (options.nonblocking) {
                            unNonblockEl(el, options);
                        } else {
                            unblockEl(el, options);
                        }
                    }
                }
            };

            function clearAllWaits(el) {
                // Forcibly clears out the wait count for an element
                setWaitCount(el, 0);
                unblockEl(el);
                setWaitCount(el, 0, true);
                unNonblockEl(el);
            }

            if (isBlockUISupported()) {
                // Clear any blockUI defaults.  Specifying these in the block call itself just gets appended to the defaults
                // but is incapable of generically clearing them all.
                $.blockUI.defaults.css = {};
                $.blockUI.defaults.overlayCSS = {};
            }

            return {
                beginElWait: function (el, options) {
                    addWait(el, options);
                },
                beginPageWait: function (options) {
                    addWait(document.body, options);
                },
                clearElWait: function (el) {
                    clearAllWaits(el);
                },
                clearPageWait: function () {
                    clearAllWaits(document.body);
                },
                endElWait: function (el, options) {
                    removeWait(el, options);
                },
                endPageWait: function (options) {
                    removeWait(document.body, options);
                }
            };
        }])
        .directive('bbWait', ['bbWait', function (bbWait) {
            /// <summary>
            /// This directive provides an attribute that can be placed on elements indicating whether they should or shouldn't be blocked for waiting.
            /// </summary>
            return {
                restrict: 'A',
                link: function (scope, el, attrs) {
                    var firstScopeLoad = true;
                    scope.$watch(attrs.bbWait, function (value, oldValue) {
                        if (value && (!oldValue || firstScopeLoad)) {
                            bbWait.beginElWait(el);
                        } else if (oldValue && !value) {
                            bbWait.endElWait(el);
                        }
                        firstScopeLoad = false;
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
                setWindowTitle: function (title) {
                    var textToAppend = bbWindowConfig.productName;

                    if (textToAppend) {
                        title = title || '';

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
/*jslint browser: true, plusplus: true */
/*global angular */

/** @module Wizard
 @description Wizards are used on a modal form when the user needs to perform a set of pre-defined steps in a particular order.  The Sky Wizard works in conjunction with the [Angular UI Bootstrap](http://angular-ui.github.io/bootstrap/) tabs component.  Placing the `bb-wizard` directive on a UI Bootstrap `tabset` element will cause the tabs to look and behave like a Sky wizard.

Sky Wizards also have the concept of a completed step which is denoted by the `bb-wizard-step-complete` directive.  When present on a `tab` and bound to a truthy value, the step's tab will be displayed as completed.

Finally there is a `bbWizardNavigator` service that provides some convenience methods for navigating through the wizard's steps.  This will typically be used by wiring the navigator up to your modal's previous and next buttons.

The `bbWizardNavigator` service has an `init()` function that takes an `options` object with the following properties:

- `steps` An array of steps. Each step should have the following properties:


 - `active` Indicates whether the step is the currently active step.  This should be the same property that is bound to the UI Bootstrap `tab` directive's `active` property.
 - `disabled()` A function that returns a boolean indicating whether the tab is disabled.  This should be the same function that is bound to the UI Bootstrap `tab` directive's `disabled` property.
 - `complete()` A function that returns a boolean indicating whether the tab is complete.  This should be the same function that is bound to the tab's `bb-wizard-step-complete` property.

The `bbWizardNavigator` also exposes the following methods:

- `previousText()` Returns the text for the modal's Previous button.  This usually doesn't change while the user interacts with the widget.
- `nextText()` Returns the text for the modal's Next button.  This changes to "Finish" when the user is on the last step.
- `goToPrevious()` Navigates the user to the previous step.
- `goToNext()` Navigates the user to the next step.
- `previousDisabled()` Indicates whether the previous step is disabled.  This should be bound to the `ng-disabled` property of the modal's Previous button.
- `nextDisabled()` Indicates whether the next step is disabled.  This should be bound to the `ng-disabled` property of the modal's Next button.
 */

(function () {
    'use strict';

    angular.module('sky.wizard', ['sky.resources', 'ui.bootstrap.tabs'])
        .directive('bbWizard', function () {
            return {
                link: function (scope, el) {
                    /*jslint unparam: true */
                    el.addClass('bb-wizard');
                },
                require: 'tabset',
                restrict: 'A'
            };
        })
        .directive('bbWizardStepComplete', function () {
            return {
                link: function (scope, el, attrs) {
                    scope.$watch(attrs.bbWizardStepComplete, function (newValue) {
                        el[newValue ? 'addClass' : 'removeClass']('bb-wizard-step-complete');
                    });
                }
            };
        })
        .factory('bbWizardNavigator', ['bbResources', function (bbResources) {
            function stepIsDisabled(step) {
                return angular.isFunction(step.disabled) && step.disabled();
            }

            return {
                init: function (options) {
                    /*jslint unparam: true */
                    var steps,
                        finish;

                    function getPreviousStep() {
                        var i,
                            n,
                            previousStep,
                            step;

                        for (i = 0, n = steps.length; i < n; i++) {
                            step = steps[i];

                            if (step.active && i > 0) {
                                previousStep = steps[i - 1];

                                if (!stepIsDisabled(previousStep)) {
                                    return previousStep;
                                }

                                break;
                            }
                        }

                        return null;
                    }

                    function getNextStep() {
                        var i,
                            n,
                            nextStep,
                            step;

                        for (i = 0, n = steps.length; i < n; i++) {
                            step = steps[i];

                            if (step.active && i + 1 < n) {
                                nextStep = steps[i + 1];

                                if (!stepIsDisabled(nextStep)) {
                                    return nextStep;
                                }

                                break;
                            }
                        }

                        return null;
                    }

                    function setActiveStep(step) {
                        if (step) {
                            step.active = true;
                        }
                    }

                    function lastStepIsActive() {
                        return steps[steps.length - 1].active;
                    }

                    options = options || {};

                    steps = options.steps;
                    finish = options.finish;

                    return {
                        previousText: function () {
                            return bbResources.wizard_navigator_previous;
                        },
                        nextText: function () {
                            return lastStepIsActive() ? bbResources.wizard_navigator_finish : bbResources.wizard_navigator_next;
                        },
                        goToPrevious: function () {
                            setActiveStep(getPreviousStep());
                        },
                        goToNext: function () {
                            if (lastStepIsActive()) {
                                if (angular.isFunction(finish)) {
                                    finish();
                                }
                            } else {
                                setActiveStep(getNextStep());
                            }
                        },
                        previousDisabled: function () {
                            return !getPreviousStep();
                        },
                        nextDisabled: function () {
                            return !getNextStep() && !lastStepIsActive();
                        }
                    };
                }
            };
        }]);
}());
/*jslint browser: true */
/*global angular */

(function () {
    'use strict';

    var modules = [
        'sky.autofocus',
        'sky.autonumeric',
        'sky.charts',
        'sky.check',
        'sky.checklist',
        'sky.data',
        'sky.datefield',
        'sky.daterangepicker',
        'sky.filters',
        'sky.format',
        'sky.grids',
        'sky.help',
        'sky.helpbutton',
        'sky.helpwidget',
        'sky.highlight',
        'sky.mediabreakpoints',
        'sky.modal',
        'sky.moment',
        'sky.money',
        'sky.navbar',
        'sky.omnibar',
        'sky.page',
        'sky.pagination',
        'sky.popover',
        'sky.resources',
        'sky.scrollintoview',
        'sky.searchfield',
        'sky.tabs',
        'sky.tabscroll',
        'sky.tabsref',
        'sky.templates',
        'sky.templating',
        'sky.textexpand',
        'sky.tiles',
        'sky.tooltip',
        'sky.validation',
        'sky.viewkeeper',
        'sky.wait',
        'sky.window',
        'sky.wizard'
    ];

    try {
        angular.module('toastr');
        modules.push('sky.toast');
    } catch (ignore) {
        /* The toastr module isn't defined.  Do not load sky.toast module */
    }

    angular.module('sky', modules);

}());
/*jshint unused: false */
/*global angular, bbResourcesOverrides */

(function () {
'use strict';

var bbResourcesOverrides;
    
bbResourcesOverrides = {
    "autonumeric_abbr_billions": "b", // The suffix to show after an abbreviated value in the billions (e.g. $1.2b)
    "autonumeric_abbr_millions": "m", // The suffix to show after an abbreviated value in the millions (e.g. $1.2m)
    "autonumeric_abbr_thousands": "k", // The suffix to show after an abbreviated value in the thousands (e.g. $1.2k)
    "checklist_select_all": "Select all", // Text for the link in a checklist to select all items.
    "checklist_clear_all": "Clear all", // Text for the link in a checklist to clear selections.
    "checklist_no_items": "No items found", // Text in a checklist when no items are shown based on the current filter.
    "grid_back_to_top": "Back to top", // Text for link in grid to scroll back to the top.
    "grid_column_picker_all_categories": "All", // Button text for category filters used to indicate that all columns should be shown in the column picker
    "grid_column_picker_description_header": "Description", // In the column picker, the header for the column showing the description of the columns to include in the grid.
    "grid_column_picker_header": "Choose columns to show in the list", // Header text for the grid column picker screen
    "grid_column_picker_name_header": "Column", // In the column picker, the header for the column showing the names of the columns to include in the grid.
    "grid_column_picker_search_placeholder": "Search by name", // Search text placeholder for the search box on the grid column picker
    "grid_column_picker_submit": "Apply changes", // Button text for applying changes made in the grid column picker
    "grid_columns_button": " Choose columns", // Label for button to select columns to display in a grid.
    "grid_filters_apply": "Apply filters", // Text for button on filters flyout to apply the selected filters to the grid
    "grid_filters_button": "Filters", // Label for button to select filters to be applied to a grid.
    "grid_filters_clear": "Clear", // Text for button on filters flyout to clear the selected filters for the grid
    "grid_filters_header": "Filter", // Header text for grid filters flyout
    "grid_filters_hide": "Hide", // Hide link text for grid filters flyout
    "grid_filters_summary_header": "Filter:", // Header text for filter summary on top of grid
    "grid_load_more": "Load more", // The text for the button to load additional rows into the grid if more rows are available.
    "grid_search_placeholder": "Find in this list", // Placeholder text in grid search box
    "modal_footer_cancel_button": "Cancel", // Default lable text for modal cancel button
    "modal_footer_primary_button": "Save", // Default lable text for modal primary button
    "month_short_april": "Apr",
    "month_short_august": "Aug",
    "month_short_december": "Dec",
    "month_short_february": "Feb",
    "month_short_january": "Jan",
    "month_short_july": "Jul",
    "month_short_june": "Jun",
    "month_short_march": "Mar",
    "month_short_may": "May",
    "month_short_november": "Nov",
    "month_short_october": "Oct",
    "month_short_september": "Sep",
    "page_noaccess_button": "Return to a non-classified page",
    "page_noaccess_description": "Sorry, you don\'t have rights to this page.\nIf you feel you should, please contact your system administrator.",
    "page_noaccess_header": "Move along, there\'s nothing to see here",
    "text_expand_see_less": "See less", // Display less text content
    "text_expand_see_more": "See more",
    "grid_action_bar_clear_selection": "Clear selection", // Clear the selections in the grid.
    "grid_action_bar_cancel_mobile_actions": "Cancel", // Close the menu where you choose an action in mobile multiselect.
    "grid_action_bar_choose_action": "Choose an action", // Open a menu to choose an action in mobile  multiselect.
    "date_field_invalid_date_message": "Please enter a valid date", // error message shown when an invalid date is entered.
    "date_range_picker_this_week": "This week", //text for date range picker
    "date_range_picker_last_week": "Last week", //text for date range picker
    "date_range_picker_next_week": "Next week", //text for date range picker
    "date_range_picker_this_month": "This month", //text for date range picker
    "date_range_picker_last_month": "Last month", //text for date range picker
    "date_range_picker_next_month": "Next month", //text for date range picker
    "date_range_picker_this_calendar_year": "This calendar year", //text for date range picker
    "date_range_picker_last_calendar_year": "Last calendar year", //text for date range picker
    "date_range_picker_next_calendar_year": "Next calendar year", //text for date range picker
    "date_range_picker_this_fiscal_year": "This fiscal year", //text for date range picker
    "date_range_picker_last_fiscal_year": "Last fiscal year", //text for date range picker
    "date_range_picker_next_fiscal_year": "Next fiscal year", //text for date range picker
    "date_range_picker_this_quarter": "This quarter", //text for date range picker
    "date_range_picker_last_quarter": "Last quarter", //text for date range picker
    "date_range_picker_next_quarter": "Next quarter", //text for date range picker
    "date_range_picker_at_any_time": "At any time", //text for date range picker
    "date_range_picker_today": "Today", //text for date range picker
    "date_range_picker_tomorrow": "Tomorrow", //text for date range picker
    "date_range_picker_yesterday": "Yesterday", //text for date range picker
    "date_range_picker_filter_description_this_week": "{0} for this week", //text for date range picker
    "date_range_picker_filter_description_last_week": "{0} from last week", //text for date range picker
    "date_range_picker_filter_description_next_week": "{0} for next week", //text for date range picker
    "date_range_picker_filter_description_this_month": "{0} for this month", //text for date range picker
    "date_range_picker_filter_description_last_month": "{0} from last month", //text for date range picker
    "date_range_picker_filter_description_next_month": "{0} for next month", //text for date range picker
    "date_range_picker_filter_description_this_calendar_year": "{0} for this calendar year", //text for date range picker
    "date_range_picker_filter_description_last_calendar_year": "{0} from last calendar year", //text for date range picker
    "date_range_picker_filter_description_next_calendar_year": "{0} for next calendar year", //text for date range picker
    "date_range_picker_filter_description_this_fiscal_year": "{0} for this fiscal year", //text for date range picker
    "date_range_picker_filter_description_last_fiscal_year": "{0} from last fiscal year", //text for date range picker
    "date_range_picker_filter_description_next_fiscal_year": "{0} for next fiscal year", //text for date range picker
    "date_range_picker_filter_description_this_quarter": "{0} for this quarter", //text for date range picker
    "date_range_picker_filter_description_last_quarter": "{0} from last quarter", //text for date range picker
    "date_range_picker_filter_description_next_quarter": "{0} for next quarter", //text for date range picker
    "date_range_picker_filter_description_at_any_time": "{0} at any time", //text for date range picker
    "date_range_picker_filter_description_today": "{0} for today", //text for date range picker
    "date_range_picker_filter_description_yesterday": "{0} from yesterday", //text for date range picker
    "date_range_picker_filter_description_tomorrow": "{0} for tomorrow", //text for date range picker
    "searchfield_searching": "Searching...", //text for ui-select search control while performing a remote search
    "searchfield_no_records": "Sorry, no matching records found", // text for ui-select search control when no records are found,
    "wizard_navigator_finish": "Finish", // Text displayed on the next button when a wizard is ready for completion.
    "wizard_navigator_next": "Next", // Text displayed on a wizard"s next button.
    "wizard_navigator_previous": "Previous" // Text displayed on a wizard"s previous button.
};

angular.module('sky.resources')
    .config(['bbResources', function (bbResources) {
        angular.extend(bbResources, bbResourcesOverrides);
    }]);
}());
angular.module('sky.templates', []).run(['$templateCache', function($templateCache) {
    $templateCache.put('sky/templates/charts/scatterplot.html',
        '<div class="bb-chart-container">\n' +
        '    <div ng-style="moveBackStyle()" ng-show="moveBackVisible">\n' +
        '        <a ng-href="#" ng-click="moveBack()" ng-disabled="moveBackDisabled()">\n' +
        '            <i class="glyphicon glyphicon-play icon-flipped"></i>\n' +
        '        </a>\n' +
        '    </div>\n' +
        '    <div ng-style="moveForwardStyle()" ng-show="moveForwardVisible">\n' +
        '        <a ng-href="#" ng-click="moveForward()" ng-disabled="moveForwardDisabled()">\n' +
        '            <i class="glyphicon glyphicon-play"></i>\n' +
        '        </a>\n' +
        '    </div>\n' +
        '    <div class="bb-chart"></div>\n' +
        '</div>');
    $templateCache.put('sky/templates/checklist/checklist.html',
        '<div>\n' +
        '  <div ng-if="bbChecklistIncludeSearch" class="bb-checklist-filter-bar checklist-filter-bar">\n' +
        '    <input type="text" maxlength="255" placeholder="{{bbChecklistSearchPlaceholder}}" ng-model="locals.searchText" ng-model-options="{debounce: bbChecklistSearchDebounce}" data-bbauto-field="ChecklistSearch">\n' +
        '  </div>\n' +
        '  <div class="bb-checklist-filter-bar checklist-filter-bar">\n' +
        '    <a class="bb-checklist-link checklist-link" data-bbauto-field="ChecklistSelectAll" href="#" ng-click="locals.selectAll()">{{locals.selectAllText}}</a>\n' +
        '    <a class="bb-checklist-link checklist-link" data-bbauto-field="ChecklistClear" href="#" ng-click="locals.clear()">{{locals.clearAllText}}</a>\n' +
        '  </div>\n' +
        '  <div class="bb-checklist-wrapper checklist-wrapper">\n' +
        '    <table class="table bb-checklist-table checklist-table">\n' +
        '      <thead>\n' +
        '        <tr>\n' +
        '          <th class="bb-checklist-checkbox-column checklist-checkbox-column"></th>\n' +
        '          <th ng-repeat="column in locals.columns" class="{{column.class}}" ng-style="{\'width\': column.width}">{{column.caption}}</th>\n' +
        '        </tr>\n' +
        '      </thead>\n' +
        '      <tbody bb-highlight="locals.searchText" bb-highlight-beacon="locals.highlightRefresh" data-bbauto-repeater="ChecklistItems" data-bbauto-repeater-count="{{bbChecklistItems.length}}">\n' +
        '        <tr ng-repeat="item in bbChecklistItems" ng-click="locals.rowClicked(item);" class="bb-checklist-row checklist-row">\n' +
        '          <td><input bb-check type="checkbox" checklist-model="bbChecklistSelectedItems" checklist-value="item" ng-click="$event.stopPropagation();" data-bbauto-field="{{item[bbChecklistAutomationField]}}" /></td>\n' +
        '          <td ng-repeat="column in locals.columns" class="{{column.class}}" data-bbauto-field="{{column.automationId}}" data-bbauto-index="{{$parent.$index}}">{{item[column.field]}}</td>\n' +
        '        </tr>\n' +
        '      </tbody>\n' +
        '    </table>\n' +
        '    <div class="bb-checklist-no-items checklist-no-items" ng-if="!bbChecklistItems.length">{{locals.noItemsText || locals.defaultNoItemsText}}</div>\n' +
        '  </div>\n' +
        '  <div ng-transclude></div>\n' +
        '</div>');
    $templateCache.put('sky/templates/datefield/datefield.html',
        '<span class="add-on input-group-btn">\n' +
        '    <button type="button" class="btn btn-default bb-date-field-calendar-button">\n' +
        '        <i class="fa fa-calendar"></i>\n' +
        '    </button>\n' +
        '</span>');
    $templateCache.put('sky/templates/daterangepicker/daterangepicker.html',
        '<div>\n' +
        '    <select data-bbauto-field="{{bbDateRangePickerAutomationId}}_DateRangeType"\n' +
        '            class="form-control"\n' +
        '            ng-options="locals.bbDateRangePicker.getDateRangeTypeCaption(t) for t in (bbDateRangePickerOptions.availableDateRangeTypes || locals.bbDateRangePicker.defaultDateRangeOptions)"\n' +
        '            ng-model="bbDateRangePickerValue.dateRangeType" />\n' +
        '</div>');
    $templateCache.put('sky/templates/grids/actionbar.html',
        '<div ng-show="locals.showActionBar" data-bbauto-view="GridActionBar">\n' +
        '    <div ng-if="!locals.showMobileActions" class="bb-grid-action-bar grid-action-bar">\n' +
        '        <div ng-if="!locals.mobileButtons" class="bb-grid-action-bar-buttons grid-action-bar-buttons" ng-repeat="action in locals.actions">\n' +
        '            <button class="btn" ng-class="{\'btn-success\': action.isPrimary, \'btn-white\': !action.isPrimary}" data-bbauto-field="{{action.automationId}}" ng-click="action.actionCallback()" ng-disabled="action.selections.length < 1">{{action.title}} ({{action.selections.length}})</button>\n' +
        '        </div>\n' +
        '        <div ng-if="locals.mobileButtons" class="bb-grid-action-bar-buttons grid-action-bar-buttons">\n' +
        '            <button class="btn btn-success" ng-click="locals.chooseAction()">\n' +
        '                <span class="sky-icon sky-icon-multi-action"></span>\n' +
        '                <span>{{resources.grid_action_bar_choose_action}}</span>\n' +
        '            </button>\n' +
        '        </div>\n' +
        '        <button class="btn bb-grid-action-bar-clear-selection grid-action-bar-clear-selection" ng-click="locals.clearSelection()">\n' +
        '            {{resources.grid_action_bar_clear_selection}}\n' +
        '        </button>\n' +
        '    </div>\n' +
        '    <div ng-if="locals.showMobileActions" class="bb-grid-action-bar-mobile-buttons grid-action-bar-mobile-buttons">\n' +
        '        <div class="bb-grid-action-bar-btn-container grid-action-bar-btn-container">\n' +
        '            <div ng-repeat="action in locals.actions">\n' +
        '                <button class="bb-grid-action-bar-mobile-btn grid-action-bar-mobile-btn btn btn-block btn-lg" ng-class="{\'btn-success\': action.isPrimary, \'btn-white\': !action.isPrimary}" ng-click="action.actionCallback()" ng-disabled="action.selections.length < 1">{{action.title}} ({{action.selections.length}})</button>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '        <button class="btn bb-grid-action-bar-mobile-cancel grid-action-bar-mobile-cancel bb-grid-action-bar-clear-selection grid-action-bar-clear-selection" ng-click="locals.cancelChooseAction()">\n' +
        '            {{resources.grid_action_bar_cancel_mobile_actions}}\n' +
        '        </button>\n' +
        '    </div>\n' +
        '</div>');
    $templateCache.put('sky/templates/grids/columnpicker.html',
        '<bb-modal data-bbauto-view="ColumnPicker">\n' +
        '  <bb-modal-header bb-modal-help-key="$parent.columnPickerHelpKey">{{resources.grid_column_picker_header}}</bb-modal-header>\n' +
        '  <div bb-modal-body>\n' +
        '    <div class="bb-checklist-filter-bar checklist-filter-bar">\n' +
        '      <input type="text" placeholder="{{resources.grid_column_picker_search_placeholder}}" ng-model="locals.searchText" ng-change="applyFilters()" data-bbauto-field="ColumnPickerSearchBox">\n' +
        '    </div>\n' +
        '    <div class="bb-checklist-filter-bar checklist-filter-bar">\n' +
        '      <button ng-repeat="category in categories" type="button" class="btn btn-sm" ng-click="filterByCategory(category)" ng-class="locals.selectedCategory === category ? \'btn-primary\' : \'btn-default\'" data-bbauto-field="{{category}}">{{category}}</button>\n' +
        '    </div>\n' +
        '    <div class="bb-checklist-wrapper checklist-wrapper bb-grid-column-picker-wrapper grid-column-picker-wrapper">\n' +
        '      <table data-bbauto-field="ColumnPickerTable" class="table bb-grid-column-picker-table grid-column-picker-table">\n' +
        '        <thead>\n' +
        '          <tr>\n' +
        '            <th class="bb-checklist-checkbox-column checklist-checkbox-column"></th>\n' +
        '            <th class="bb-checklist-name-column name-column" data-bbauto-field="ColumnNameHeader">{{resources.grid_column_picker_name_header}}</th>\n' +
        '            <th class="bb-checklist-description-column description-column" data-bbauto-field="ColumnDescriptionHeader">{{resources.grid_column_picker_description_header}}</th>\n' +
        '          </tr>\n' +
        '        </thead>\n' +
        '        <tbody bb-highlight="locals.searchText" data-bbauto-repeater="ColumnChooserFields" data-bbauto-repeater-count="{{columns.length}}">\n' +
        '          <tr ng-repeat="column in columns" ng-click="column.selected = !column.selected" ng-show="!column.hidden">\n' +
        '            <td><input data-bbauto-field="{{column.name}}" data-bbauto-index="{{$index}}" type="checkbox" ng-model="column.selected" ng-click="$event.stopPropagation();" /></td>\n' +
        '            <td data-bbauto-field="ColumnCaption" data-bbauto-index="{{$index}}">{{column.caption}}</td>\n' +
        '            <td data-bbauto-field="ColumnDescription" data-bbauto-index="{{$index}}">{{column.description}}</td>\n' +
        '          </tr>\n' +
        '        </tbody>\n' +
        '      </table>\n' +
        '    </div>\n' +
        '  </div>\n' +
        '  <bb-modal-footer>\n' +
        '    <bb-modal-footer-button-primary data-bbauto-field="ColumnPickerSubmit" ng-click="applyChanges()">{{resources.grid_column_picker_submit}}</bb-modal-footer-button-primary>\n' +
        '    <bb-modal-footer-button-cancel data-bbauto-field="ColumnPickerCancel"></bb-modal-footer-button-cancel>\n' +
        '  </bb-modal-footer>\n' +
        '</bb-modal>');
    $templateCache.put('sky/templates/grids/filters.html',
        '<div style="display:none;">\n' +
        '    <div bb-scrolling-view-keeper="viewKeeperOptions" class="bb-grid-filters grid-filters">\n' +
        '        <div class="bb-grid-filters-box grid-filters-box" bb-scroll-into-view="expanded">\n' +
        '            <div class="bb-grid-filters-icon grid-filters-icon" ng-click="expanded = !expanded"></div>\n' +
        '            <div class="bb-grid-filters-container grid-filters-container" style="display:none;">\n' +
        '                <div class="bb-grid-filters-header grid-filters-header" ng-click="expanded = !expanded">\n' +
        '                    <h4 class="bb-grid-filters-header-title grid-filters-header-title">{{resources.grid_filters_header}}</h4>\n' +
        '                    <span class="bb-grid-filters-header-hide grid-filters-header-hide">{{resources.grid_filters_hide}}</span>\n' +
        '                </div>\n' +
        '                <div class="bb-grid-filters-body grid-filters-body" ng-transclude></div>\n' +
        '                <div class="bb-grid-filters-footer grid-filters-footer">\n' +
        '                    <button data-bbauto-field="ApplyGridFilters" class="btn btn-primary" type="submit" ng-click="applyFilters()">{{resources.grid_filters_apply}}</button>\n' +
        '                    <button data-bbauto-field="ClearGridFilters" class="btn btn-white" type="button" ng-click="clearFilters()">{{resources.grid_filters_clear}}</button>\n' +
        '                </div>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</div>');
    $templateCache.put('sky/templates/grids/filtersgroup.html',
        '<div class="form-group" ng-class="isCollapsed ? \'collapsed\' : \'collapsible\'">\n' +
        '    <div ng-click="isCollapsed = !isCollapsed">\n' +
        '        <i ng-class="\'glyphicon-chevron-\' + (isCollapsed ? \'down\' : \'up\')" class="bb-grid-filters-body-group-header-icon grid-filters-body-group-header-icon glyphicon"></i>\n' +
        '        <label>{{bbGridFiltersGroupLabel}}</label>\n' +
        '    </div>\n' +
        '    <div class="bb-grid-filters-body-group-content grid-filters-body-group-content" collapse="!!isCollapsed" ng-transclude></div>\n' +
        '</div>');
    $templateCache.put('sky/templates/grids/filterssummary.html',
        '<div class="toolbar bb-table-toolbar table-toolbar bb-applied-filter-bar applied-filter-bar">\n' +
        '    <div class="bb-applied-filter-header applied-filter-header">\n' +
        '        <span>{{resources.grid_filters_summary_header}}</span>\n' +
        '    </div>\n' +
        '    <div class="bb-applied-filter-content applied-filter-content" ng-click="openFilterMenu()">\n' +
        '        <span class="bb-applied-filter-text applied-filter-text" data-bbauto-field="FilterSummaryText" ng-transclude></span>\n' +
        '        <span class="sky-icon-close bb-applied-filter-remove applied-filter-remove" data-bbauto-field="FilterSummaryRemove" ng-click="clearFilters(); $event.stopPropagation();"></span>\n' +
        '    </div>\n' +
        '</div>\n' +
        '');
    $templateCache.put('sky/templates/grids/grid.html',
        '<section class="col-xs-12 bb-grid-container" data-bbauto-grid="{{options.automationId}}" data-bbauto-timestamp="{{locals.timestamp}}" data-bbauto-repeater="{{options.automationId}}" data-bbauto-repeater-count="{{locals.rowcount}}">\n' +
        '    <div ng-transclude></div>\n' +
        '    <div class="bb-grid-toolbar-container grid-toolbar-container" style="display:none;">\n' +
        '        <div class="toolbar bb-table-toolbar table-toolbar">\n' +
        '            <div data-bbauto-field="AddButton" class="bb-grid-toolbar-btn-add add-button btn-success btn btn-sm" ng-show="locals.hasAdd" ng-click="locals.onAddClick()">\n' +
        '                <span class="toolbar-button-icon sky-icon sky-icon-add-fill"></span>\n' +
        '                <span class="toolbar-button-label">{{options.onAddClickLabel}}</span>\n' +
        '            </div>\n' +
        '            <div class="bb-search-container search-container">\n' +
        '                <input type="text" placeholder="{{resources.grid_search_placeholder}}" ng-model="searchText" ng-keyup="$event.keyCode == 13 && locals.applySearchText();" data-bbauto-field="SearchBox">\n' +
        '                <div class="bb-search-icon search-icon" data-bbauto-field="SearchButton" ng-click="locals.applySearchText();"></div>\n' +
        '            </div>\n' +
        '            <div class="bb-toolbar-btn toolbar-button bb-column-picker-btn column-picker-button" data-bbauto-field="ColumnPickerButton" ng-show="locals.hasColPicker" ng-click="locals.openColumnPicker()">\n' +
        '                <span class="bb-toolbar-btn-icon toolbar-button-icon bb-column-picker-btn-icon column-picker-button-icon"></span>\n' +
        '                <span class="bb-toolbar-btn-label toolbar-button-label">{{resources.grid_columns_button}}</span>\n' +
        '            </div>\n' +
        '            <div class="bb-toolbar-btn toolbar-button bb-filter-btn filter-button" data-bbauto-field="FilterButton" ng-show="locals.hasFilters" ng-click="locals.toggleFilterMenu();">\n' +
        '                <span class="bb-toolbar-btn-icon toolbar-button-icon bb-filter-btn-icon filter-button-icon"></span>\n' +
        '                <span class="bb-toolbar-btn-label toolbar-button-label">{{resources.grid_filters_button}}</span>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '        <div class="bb-grid-filter-summary-container">\n' +
        '        </div>\n' +
        '        <div class="bb-grid-top-scrollbar">\n' +
        '            <div></div>\n' +
        '        </div>    \n' +
        '    </div>\n' +
        '    \n' +
        '    <div class="clearfix"></div>\n' +
        '    \n' +
        '    <div class="table-responsive">\n' +
        '        \n' +
        '        <table id="{{locals.gridId}}" class="bb-grid-table" bb-wait="options.loading" ng-class="{\'grid-multiselect\' : locals.multiselect}"></table>\n' +
        '    </div>\n' +
        '    \n' +
        '    <div ng-if="!paginationOptions" class="bb-table-loadmore table-loadmore" data-bbauto-field="LoadMoreButton" ng-show="options.hasMoreRows" ng-click="locals.loadMore();">\n' +
        '        <span class="fa fa-cloud-download"></span>\n' +
        '        <a href="#">{{resources.grid_load_more}}</a>\n' +
        '    </div>\n' +
        '    \n' +
        '    <div ng-if="paginationOptions" class="bb-grid-pagination-container">\n' +
        '        <pagination ng-show="paginationOptions.recordCount > options.data.length" total-items="paginationOptions.recordCount" items-per-page="paginationOptions.itemsPerPage" ng-model="locals.currentPage" ng-change="paginationOptions.pageChanged()" max-size="paginationOptions.maxPages"></pagination>\n' +
        '        <div class="clearfix"></div>\n' +
        '    </div>\n' +
        '    \n' +
        '    <div class="bb-grid-action-bar-and-back-to-top grid-action-bar-and-back-to-top">\n' +
        '        <bb-grid-action-bar ng-if="locals.multiselect && multiselectActions && updateMultiselectActions" bb-multiselect-actions="multiselectActions" bb-selections-updated="updateMultiselectActions(selections)">\n' +
        '        </bb-grid-action-bar>\n' +
        '        <div class="bb-table-backtotop table-backtotop" data-bbauto-field="BackToTopButton" ng-show="locals.isScrolled" ng-click="locals.backToTop();">\n' +
        '            <span style="float:left">\n' +
        '                <span class="fa fa-arrow-up "></span>\n' +
        '                <a href="#">{{resources.grid_back_to_top}}</a>\n' +
        '            </span>\n' +
        '            <span style="float:right">\n' +
        '                <span class="fa fa-arrow-up "></span>\n' +
        '                <a href="#">{{resources.grid_back_to_top}}</a>\n' +
        '            </span>\n' +
        '            <div class="clearfix"></div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</section>');
    $templateCache.put('sky/templates/grids/seemore.html',
        '<div bb-text-expand="data" bb-text-expand-max-length="100" style="white-space: pre-wrap"></div>');
    $templateCache.put('sky/templates/modal/modal.html',
        '<div class="bb-modal-content-wrapper" ng-transclude></div>');
    $templateCache.put('sky/templates/modal/modalfooter.html',
        '<div class="modal-footer" ng-transclude></div>\n' +
        '');
    $templateCache.put('sky/templates/modal/modalfooterbutton.html',
        '<button class="btn btn-white" type="button" ng-transclude></button>');
    $templateCache.put('sky/templates/modal/modalfooterbuttoncancel.html',
        '<button class="btn btn-link" type="button" ng-click="$parent.$parent.$dismiss(\'cancel\');" ng-transclude></button>');
    $templateCache.put('sky/templates/modal/modalfooterbuttonprimary.html',
        '<button class="btn btn-primary" type="submit" ng-transclude></button>');
    $templateCache.put('sky/templates/modal/modalheader.html',
        '<div class="modal-header">\n' +
        '    <h4 class="bb-dialog-header" ng-transclude></h4>\n' +
        '    <button type="button" class="close" ng-click="$parent.$parent.$dismiss(\'cancel\');">&times;</button>\n' +
        '    <div bb-help-button bb-help-key="{{bbModalHelpKey}}" bb-set-help-key-override="true" data-bbauto-field="ModalHelpButton"></div>\n' +
        '    <div class="clearfix"></div>\n' +
        '</div>');
    $templateCache.put('sky/templates/navbar/navbar.html',
        '<nav class="navbar navbar-default bb-navbar" ng-transclude></nav>');
    $templateCache.put('sky/templates/page/page.html',
        '<section ng-if="locals.noPageStatusSpecified() || bbPageStatus === locals.pageStatuses.LOADED">\n' +
        '    <div ng-transclude ng-init="locals.onShowing()"></div>\n' +
        '</section>\n' +
        '<section class="container-fluid page-content-column-container" ng-show="bbPageStatus === locals.pageStatuses.NOT_AUTHORIZED">\n' +
        '    <div class="row">\n' +
        '        <section class="page-content-column col-xs-12 m-t-xl text-center">\n' +
        '            <div class="m">\n' +
        '                <h3>\n' +
        '                    {{resources.page_noaccess_header}}\n' +
        '                </h3>\n' +
        '            </div>\n' +
        '            <div class="bb-page-noaccess-description">{{resources.page_noaccess_description}}</div>\n' +
        '            <div class="m-lg">\n' +
        '                <button class="btn btn-lg btn-primary" ng-click="locals.navigateAway()" data-bbauto-field="NavigateAwayButton">\n' +
        '                    {{resources.page_noaccess_button}}\n' +
        '                </button>\n' +
        '            </div>\n' +
        '        </section>\n' +
        '    </div>\n' +
        '</section>');
    $templateCache.put('sky/templates/popover/popup.html',
        '<div class="popover {{placement}} fade" ng-class="{ in: isOpen()}">\n' +
        '  <div class="arrow"></div>\n' +
        '\n' +
        '  <div class="popover-inner">\n' +
        '    <h3 class="popover-title" ng-bind="title" ng-show="title"></h3>\n' +
        '    <div class="popover-content"></div>\n' +
        '  </div>\n' +
        '</div>');
    $templateCache.put('sky/templates/tabs/tab.html',
        '<div ng-hide="!tabsInitialized" data-bbauto-field="{{bbTabAutomationId}}" class="responsiveTabControl">\n' +
        '    <ul ng-transclude>\n' +
        '\n' +
        '    </ul>\n' +
        '</div>');
    $templateCache.put('sky/templates/tiles/tile.html',
        '<section ng-class="isCollapsed ? \'collapsed\' : \'collapsible\'" class="ibox bb-tile tile">\n' +
        '    <div bb-scroll-into-view="scrollIntoView">\n' +
        '        <div class="ibox-title" ng-click="titleClick()">\n' +
        '            <div class="row">\n' +
        '                <div class="bb-tile-header-with-content col-xs-8">\n' +
        '                    <h5 class="bb-tile-header tile-header">{{tileHeader}}</h5>\n' +
        '                </div>\n' +
        '                <div class="col-xs-4">\n' +
        '                    <div class="ibox-tools">\n' +
        '                        <i ng-class="\'glyphicon-chevron-\' + (isCollapsed ? \'down\' : \'up\')" class="glyphicon bb-tile-chevron tile-chevron"></i>\n' +
        '                        <i ng-if="hasSettings" class="bb-tile-settings glyphicon glyphicon-wrench" ng-click="$event.stopPropagation();bbTileSettingsClick();"></i>\n' +
        '                        <i class="bb-tile-grab-handle tile-grab-handle glyphicon glyphicon-th" ng-click="$event.stopPropagation()"></i>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '        <div collapse="isCollapsed" class="ibox-content bb-tile-content tile-content" ng-transclude>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</section>');
    $templateCache.put('sky/templates/tiles/tiledashboard.html',
        '<div class="row-fluid">\n' +
        '  <div class="col-md-6 page-content-tile-column page-content-column-sortable" data-dashboard-column="1">\n' +
        '    <div ng-repeat="tile in tiles" data-tile-id="{{tile.id}}" data-ui-view="{{tile.view_name}}" id="{{tile.view_name}}">\n' +
        '    </div>\n' +
        '  </div>\n' +
        '\n' +
        '  <div class="col-md-6 page-content-tile-column page-content-column-sortable" data-dashboard-column="2">\n' +
        '  </div>\n' +
        '</div>');
    $templateCache.put('sky/templates/tiles/tileheadercheck.html',
        '<i class="fa fa-check bb-tile-header-check"></i>');
    $templateCache.put('sky/templates/tiles/tileheadercontent.html',
        '<div class="bb-tile-header-content" ng-transclude></div>');
}]);

//# sourceMappingURL=sky.js.map