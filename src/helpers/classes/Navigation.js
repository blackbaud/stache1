/*global: __dirname, module, require */
(function () {
    "use strict";

    var Anchor,
        Core,
        pattern,
        utils;

    Anchor = require(__dirname + '/Anchor');
    Core = require(__dirname + '/Core');
    pattern = require('../../../src/helpers/pattern');
    utils = require('../../../src/helpers/utils');

    /**
     * Navigation
     *
     * @param {} []
     * @param {} []
     */
    function Navigation(anchors, options) {
        var _anchors,
            _breadcrumbPosition,
            _currentUri,
            _numTotalBreadcrumbs,
            _self;

        // Public variables.
        this.defaults = {
            limit: -1
        };

        // Extend any classes.
        if (this.extends) {
            this.extends.constructor.call(this, options);
        }

        // Private variables.
        _anchors = anchors || [];
        _breadcrumbPosition = 0;
        _numTotalBreadcrumbs = 0;
        _currentUri = '';
        _self = this;

        // Private methods.
        this.checkLimit = function (navLinks, limit) {
            if (limit > -1) {
                navLinks.forEach(function (navLink, i) {
                    if (i >= limit) {
                        delete navLinks[i];
                    }
                });
            }
            return utils.cleanArray(navLinks);
        };
        var prepareAnchorsForCurrentUri = function (anchors) {
            var limit = _self.setting('limit');

            if (anchors.length > 0) {
                anchors.forEach(function (anchor, i) {
                    var isActive;

                    isActive = false;

                    // Active page.
                    // (This page's URI is a fragment of the current page's URI.)
                    if (_currentUri.indexOf(anchor.uri) > -1) {

                        // Ignore the home page, for now.
                        if (anchor.uri !== "/") {
                            isActive = true;
                            anchor.isActive = true;
                            _breadcrumbPosition++;
                            anchor.breadcrumbPosition = _breadcrumbPosition;
                        }

                        // Current page.
                        if (_currentUri === anchor.uri) {
                            anchor.isCurrent = true;
                            _numTotalBreadcrumbs = _breadcrumbPosition;

                            // Make sure the number of children doesn't exceed our limit.
                            if (anchor.nav_links) {
                                _self.checkLimit(anchor.nav_links, limit);
                            }
                        }
                    }

                    // Progress to the next level down.
                    if (anchor.nav_links) {
                        anchor.isParent = true;
                        prepareAnchorsForCurrentUri(anchor.nav_links);
                    }

                    // Update the class property.
                    anchors[i] = new Anchor(anchor);

                });
            }

            return utils.cleanArray(anchors);
        };

        // Public methods.
        this.anchors = function (val) {
            if (val === undefined) {
                return _anchors || [];
            }
            _anchors = val;
            return this;
        };
        this.currentUri = function (val) {
            if (val === undefined) {
                return _currentUri;
            }
            _currentUri = val;
            return this;
        };
        this.pattern = function (name, options) {
            var myPattern;

            // Some patterns set the limit property.
            if (options.limit) {
                _self.setting('limit', options.limit);
            }

            // Update the nav links array to reflect the current page.
            this.anchors(prepareAnchorsForCurrentUri(this.anchors()));

//if (_currentUri.indexOf('panel-patterns') > -1) console.log(this.anchors());

            // Generate a pattern.
            myPattern = pattern(name, this, options);

            // Update the navigation's anchors with what the pattern generated.
            if (myPattern) {
                this.anchors(myPattern.anchors());
            }

            return this;
        };
        this.pruneParents = function (navLinks, depth) {
            var temp;

            temp = [];

            if (depth === undefined) {
                depth = 99;
            }

            if (navLinks.length === undefined) {
                return temp;
            }

            navLinks.forEach(function (navLink, i) {

                if (navLink.isActive) {

                    // It's a parent link.
                    if (navLink.nav_links) {

                        // The desired starting position has been found.
                        if (_numTotalBreadcrumbs - depth <= navLink.breadcrumbPosition) {

                            navLink.nav_links.forEach(function (n, i) {

                                // Delete any items that shouldn't be included.
                                if (n.showInNav === false) {
                                    delete navLink.nav_links[i];
                                    return;
                                }

                                // Delete any child nav_links from siblings (let's not show those)
                                if (n.isActive === false && n.nav_links) {
                                    delete navLink.nav_links[i].nav_links;
                                }
                            });

                            temp = navLink.nav_links;
                            return;

                        } else {
                            temp = _self.pruneParents(navLink.nav_links);
                            return;
                        }
                    }

                    // It has no children.
                    else {
                        temp = [];
                    }
                }

                // Remove any children from un-active parents.
                else {
                    if (navLink.showInNav === false) {
                        delete navLinks[i];
                        return;
                    }
                    if (navLink.nav_links) {
                        delete navLinks[i].nav_links;
                    }
                }
            });

            return utils.cleanArray(temp);
        };

        return this;
    }

    Navigation.prototype.extends = Core.prototype;

    module.exports = Navigation;

}());