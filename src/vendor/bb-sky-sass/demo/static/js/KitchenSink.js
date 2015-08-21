/*jshint browser: true */
/*globals angular, $, FastClick */

(function ($) {
    'use strict';
    angular
      .module('stache', ['sky', 'ngAnimate', 'ui.bootstrap', 'ui.select'])
      .run(['bbOmnibarConfig', 'bbHelpConfig', 'bbHelpwidgetConfig', 'bbScrollIntoViewConfig', function (bbOmnibarConfig, bbHelpConfig, bbHelpwidgetConfig, bbScrollIntoViewConfig) {
        bbOmnibarConfig.enableSearch = true;
        bbOmnibarConfig.enableHelp = true;
        bbHelpwidgetConfig.productId = 'REx';
        bbHelpConfig.url = bbHelpwidgetConfig.url = '//p1helpui.cdev.renxt.blackbaudhosting.com/helpwidget.min.js';
        bbScrollIntoViewConfig.reservedTop = 30;
      }]);

    $(function () {
      'use strict';
      if (typeof FastClick !== 'undefined') {
        FastClick.attach(document.body);
      }
    });

}(jQuery));
