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
