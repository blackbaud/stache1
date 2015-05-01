/*jslint browser: true, plusplus: true */
/*global angular, jQuery */

/** @module Help
 @description ### Additional Dependencies ###

 - **[easyXDM](http://easyxdm.net/wp/) (2.4.19 or higher)** Used to make cross-domain requests to the help server

---

The Help service allows other Angular components to open or close the help panel programmatically.  When the widget is opened, it will interrogate the page to identify the current help topic and display the relevant help content.  Settings for this service are controlled with the `bbHelpConfig` object.

### bbHelpConfig Settings ###

 - `productId` The current product identifier used to build the URL to the product's help content.
 - `url` The URL to the Help Widget that will be included.
 - `customLocales` Optional.  An array of additional locales for which the product has help content other than the default help content locale.  This array should contain strings like 'en-gb' or 'fr'.

 */

(function () {
    'use strict';

    angular.module('sky.help', ['ui.router'])
        .constant('bbHelpConfig', {
            onHelpLoaded: null,
            productId: 'Sky',
            customLocales: [],
            url: null
        })
        .factory('bbHelp', ['$state', '$window', 'bbHelpConfig', function ($state, $window, bbHelpConfig) {
            function open() {
                var args = arguments;
                
                function openInner() {
                    $window.BBHELP.HelpWidget.open.apply($window.BBHELP.HelpWidget, args);
                }
                
                if ($window.BBHELP && $window.BBHELP.HelpWidget) {
                    openInner();
                } else {
                    if (!bbHelpConfig.url) {
                        throw new Error('bbHelpConfig.url is not defined.');
                    }

                    jQuery.ajax({
                        cache: true,
                        dataType: 'script',
                        url: bbHelpConfig.url
                    }).done(function () {
                        var config = angular.extend({}, bbHelpConfig);

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

                        $window.BBHELP.HelpWidget.load(config);
                        
                        openInner();
                    });
                }
            }
            
            function close() {
                if ($window.BBHELP && $window.BBHELP.HelpWidget) {
                    $window.BBHELP.HelpWidget.close.apply($window.BBHELP.HelpWidget, arguments);
                }
            }
            
            return {
                open: open,
                close: close
            };
        }]);

}());
