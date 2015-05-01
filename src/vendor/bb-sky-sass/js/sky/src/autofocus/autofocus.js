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