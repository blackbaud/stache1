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
                var dividend,
                    mDec,
                    formatted,
                    settings,
                    suffix,
                    tempEl = $('<span></span>');
                
                settings = getBaseSettings(bbAutonumericConfig, configType);
                
                if (abbreviate) {
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
                
                return formatted;
            };
        }]);
}(jQuery));
