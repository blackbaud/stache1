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
                        //console.error("Error parsing date value '" + value + "': " + e.toString());
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
                        datefieldHTML = '<span class="add-on input-group-btn"><button class="btn btn-default bb-date-field-calendar-button"><i class="fa fa-calendar"></i></button></span>',
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