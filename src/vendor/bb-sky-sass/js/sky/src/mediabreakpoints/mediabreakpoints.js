/*global angular, define, enquire, require */

/** @module Mediabreakpoints
 @description ### Additional Dependencies ##

 - **[enquire.js](http://wicky.nillia.ms/enquire.js/) (2.1.2 or later)**

---

The Media Breakpoints service can call one or more callback functions whenever a [Bootstrap grid system breakpoint](http://getbootstrap.com/css/#grid-media-queries) is hit.  This allows for
manipulating the UI programmatically in cases where CSS media queries are not sufficient.

### Media Breakpoint Methods ###

 - `register(callback)` Registers a callback method with the service that will be called any time a media breakpoint is hit.  The callback function will be called with the following arguments:
  - `breakpoint` An object with `xs`, `sm`, `md` and `lg` properties.  The property corresponding with the current breakpoint will be set to `true` and the rest set to `false`.
 - `unregister(callback)` Unregisters the specified callback method.  This should be called whenever the controller's `$scope` is destroyed.
 - `getCurrent()` Gets the current media breakpoint object.
 */

(function (window) {
    'use strict';

    var mediaBreakpointsConfig = {
            mediaQueries: {
                xs: '(max-width: 767px)',
                sm: '(min-width: 768px) and (max-width: 991px)',
                md: '(min-width: 992px) and (max-width: 1199px)',
                lg: '(min-width: 1200px)'
            }
        },
        bp = {},
        handlers = [],
        mediaBreakpoints;

    function updateStatus(newSize) {
        var handler,
            i;

        bp.xs = bp.sm = bp.md = bp.lg = false;
        bp[newSize] = true;

        for (i = 0; i < handlers.length; i += 1) {
            handler = handlers[i];
            
            /*istanbul ignore else */
            if (handler) {
                handler(bp);
            }
        }
    }

    (function (register) {
        /* istanbul ignore next boilerplate RequireJS detection */
        if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            require(['enquire'], register);
        } else if (window.enquire) {
            // Browser globals
            register(enquire);
        }
    }(function (enquire) {
        var mediaQueries = mediaBreakpointsConfig.mediaQueries,
            p;
        
        function registerQuery(name) {
            enquire.register(mediaQueries[name], function () {
                updateStatus(name);
            });
        }
        
        for (p in mediaQueries) {
            /*istanbul ignore else */
            if (mediaQueries.hasOwnProperty(p)) {
                registerQuery(p);
            }
        }
    }));


    mediaBreakpoints = {
        register: function (callback) {
            handlers.push(callback);

            //Fire handler immediately
            callback(bp);
        },

        unregister: function (callback) {
            var i;

            for (i = 0; i < handlers.length; i += 1) {
                if (handlers[i] === callback) {
                    handlers.splice(i, 1);
                    break;
                }
            }
        },

        getCurrent: function () {
            return bp;
        }
    };

    angular.module('sky.mediabreakpoints', [])
        .constant('bbMediaBreakpointsConfig', mediaBreakpointsConfig)
        .factory('bbMediaBreakpoints', function () {
            return mediaBreakpoints;
        });
}(this));