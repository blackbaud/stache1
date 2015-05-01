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
