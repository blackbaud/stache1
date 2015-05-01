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