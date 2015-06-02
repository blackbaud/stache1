/*globals angular */

(function () {
    'use strict';

    angular.module('KitchenSink', ['sky', 'ui.bootstrap', 'ui.router', 'ngAnimate', 'ui.select'])
        .run(['bbOmnibarConfig', 'bbHelpwidgetConfig', function (bbOmnibarConfig, bbHelpwidgetConfig) {
            bbOmnibarConfig.enableSearch = true;
            bbOmnibarConfig.enableHelp = true;
            bbHelpwidgetConfig.productId = 'REx';
            bbHelpwidgetConfig.url = '//p1helpui.renxt.blackbaud.net/helpwidget.js';
        }])
        .controller('MainController', angular.noop);
}());