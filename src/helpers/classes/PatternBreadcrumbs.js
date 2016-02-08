(function () {
    "use strict";

    var Anchor,
        Pattern,
        utils;

    Anchor = require(__dirname + '/Anchor');
    Pattern = require(__dirname + '/Pattern');
    utils = require('../../../src/helpers/utils');

    function PatternBreadcrumbs(navigation, options) {
        var _currentUri,
            _anchors,
            _self;

        // Public variables.
        this.defaults = {
            homeLinkName: '',
            homeLinkUri: ''
        };

        // Class inheritance.
        this.inherits && this.inherits.constructor.call(this, navigation, options);

        _self = this;
        _anchors = _self.anchors();
        _currentUri = _self.navigation().currentUri();

        /**
         * Returns an object representing a page's properties, only if its URI is
         * a fragment of the active page's URI. The method receives an array of objects,
         * to be checked against the active URI.
         *
         * @param {array} [navLinks] Array of objects representing pages.
         * @param {string} [currentUri] The path of the active page.
         */
        function findBreadcrumb(navLinks) {
            var breadcrumbs;

            breadcrumbs = [];

            navLinks.forEach(function (navLink, i) {

                // Don't include the Home page because it cannot have sub-directories.
                // (We add the Home page manually, in getBreadcrumbNavLinks.)
                if (navLink.uri !== "/") {

                    // Is this page's URI a fragment of the active page's URI?
                    if (_currentUri.indexOf(navLink.uri) > -1) {

                        breadcrumbs.push(new Anchor({
                            name: navLink.name,
                            uri: navLink.uri
                        }));

                        // Does this page have sub-directories?
                        if (navLink.hasOwnProperty('nav_links')) {
                            breadcrumbs = utils.concatArray(breadcrumbs, findBreadcrumb(navLink.nav_links));
                        }

                        return;
                    }
                }
            });

            // Set the final navigation link as 'current' and return the array.
            if (breadcrumbs.length > 0) {
                breadcrumbs[breadcrumbs.length - 1].isCurrent = true;
                breadcrumbs[breadcrumbs.length - 1].isClickable = false;
                return breadcrumbs;
            }

            // The navigation links didn't contain a breadcrumb.
            return false;
        }

        _anchors = findBreadcrumb(_anchors);

        // Add Home page.
        if (_anchors !== false) {
            _anchors.unshift(new Anchor({
                name: _self.setting('homeLinkName'),
                uri: _self.setting('homeLinkUri')
            }));
        }

        _self.anchors(_anchors);

        return this;
    }

    PatternBreadcrumbs.prototype.inherits = Pattern.prototype;
    PatternBreadcrumbs.prototype.extends = Pattern.prototype.extends;

    module.exports = PatternBreadcrumbs;
}());