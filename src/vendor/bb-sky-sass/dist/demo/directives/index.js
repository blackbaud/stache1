/*jshint browser: true */
/*globals angular, $, FastClick */

(function () {
    'use strict';

    angular.module('stache', ['sky', 'ui.bootstrap', 'ui.router', 'ngAnimate', 'ui.select'])
        .run(['bbOmnibarConfig', 'bbHelpwidgetConfig', 'bbScrollIntoViewConfig', function (bbOmnibarConfig, bbHelpwidgetConfig, bbScrollIntoViewConfig) {
            bbOmnibarConfig.enableSearch = true;
            bbOmnibarConfig.enableHelp = true;
            bbHelpwidgetConfig.productId = 'REx';
            bbHelpwidgetConfig.url = '//p1helpui.renxt.blackbaud.net/helpwidget.js';
            bbScrollIntoViewConfig.reservedTop = 30;
        }])
        .controller('MainController', ['$scope', 'bbWait', function ($scope, bbWait) {
            $scope.$on("bbBeginWait", function (e, opts) {
                e.stopPropagation();
                bbWait.beginPageWait(opts);
            });

            $scope.$on("bbEndWait", function (e, opts) {
                e.stopPropagation();
                bbWait.endPageWait(opts);
            });
        }]);

    $(window).on("hashchange", function () {
        // Little hack to make the anchor links to directives not be blocked by the omnibar.
        window.scrollTo(window.scrollX, window.scrollY - 35);
    });
}());

$(function () {
    'use strict';
    FastClick.attach(document.body);
});
