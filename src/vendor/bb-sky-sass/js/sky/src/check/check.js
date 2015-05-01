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