/*global: __dirname, module, require */
(function () {
    "use strict";

    var Pattern,
        utils;

    Pattern = require(__dirname + '/Pattern');
    utils = require('../../../src/helpers/utils');

    function PatternShowcase(navigation, options) {
        var _anchors,
            _self;

        // Public variables.
        this.defaults = {
            arrangement: 'float',
            containerClass: 'showcase',
            doPruneParents: true,
            numColumnsPhone: 1,
            numColumnsTablet: 2,
            numColumnsDesktop: 3,
            numColumnsLargeDesktop: 4,
            sameHeight: false,
            type: 'media'
        };

        // Class inheritance.
        if (this.inherits) {
            this.inherits.constructor.call(this, navigation, options);
        }

        _self = this;
        _anchors = _self.anchors();

        /**
         *
         * @param {} []
         */
        function assignTemplate(navLinks) {
            var template = 'partial-' + _self.setting('type');
            navLinks.forEach(function (navLink) {
                navLink.template = template;
            });
            return navLinks;
        }

        /**
         *
         * @param {} []
         */
        function columnize(navLinks) {
            var breakpoints,
                maxColumnWidth;

            maxColumnWidth = 12;
            breakpoints = [
                {
                    name: 'Phone',
                    width: _self.setting('numColumnsPhone')
                },
                {
                    name: 'Tablet',
                    width: _self.setting('numColumnsTablet')
                },
                {
                    name: 'Desktop',
                    width: _self.setting('numColumnsDesktop')
                },
                {
                    name: 'LargeDesktop',
                    width: _self.setting('numColumnsLargeDesktop')
                }
            ];

            if (_self.setting('arrangement') === "stack") {
                navLinks = utils.stackArray(navLinks, _self.setting('numColumnsLargeDesktop'));
            }

            navLinks.forEach(function (navLink, i) {
                var classes = [];
                breakpoints.forEach(function (breakpoint) {
                    var modulus = i % breakpoint.width;
                    navLink['columnWidth' + breakpoint.name] = maxColumnWidth / breakpoint.width;
                    if (modulus === 0) {
                        navLink['firstInRow' + breakpoint.name] = true;
                    }
                    if (modulus === breakpoint.width - 1) {
                        navLink['lastInRow' + breakpoint.name] = true;
                    }
                });
                navLink.class = [
                    'col-xs-' + navLink.columnWidthPhone,
                    'col-sm-' + navLink.columnWidthTablet,
                    'col-md-' + navLink.columnWidthDesktop,
                    'col-lg-' + navLink.columnWidthLargeDesktop
                ].join(' ');
            });

            return navLinks;
        }

        if (_self.setting('doPruneParents')) {
            _anchors = _self.navigation().pruneParents(_anchors, 0);
        }

        _anchors = _self.navigation().checkLimit(_anchors, _self.setting('limit'));
        _anchors = columnize(_anchors);
        _anchors = assignTemplate(_anchors);
        _self.anchors(_anchors);

        return this;
    }

    PatternShowcase.prototype.inherits = Pattern.prototype;
    PatternShowcase.prototype.extends = Pattern.prototype.extends;

    module.exports = PatternShowcase;
}());