/*global: __dirname, module, require */
(function () {
    "use strict";

    var $,
        Anchor,
        Pattern,
        utils;

    $ = require('cheerio');
    Anchor = require(__dirname + '/Anchor');
    Pattern = require(__dirname + '/Pattern');
    utils = require('../../../src/helpers/utils');

    function PatternSidebar(navigation, options) {
        var _anchors,
            _self;

        // Public variables.
        this.defaults = {
            headingSelector: 'h2',
            isSmoothScroll: true,
            limit: -1,
            numParents: 0,
            pageHtml: '',
            sortBy: '',
            sortOrder: 'asc'
        };

        // Class inheritance.
        if (this.inherits) {
            this.inherits.constructor.call(this, navigation, options);
        }

        // Private variables.
        _self = this;
        _anchors = _self.anchors();

        // Private methods.

        /**
         *
         * @param {} []
         */
        function addBackToTop(navLinks) {
            navLinks.push(new Anchor({
                name: '<i class="fa fa-caret-square-o-up"></i>',
                uri: '#top',
                isSmoothScroll: _self.setting('isSmoothScroll'),
                isVisibleOnAffix: true
            }));
        }

        /**
         * 1) Get the active page's HTML.
         * 2) For each heading found, add it as a separate navLink.
         *
         * @param {} []
         */
        function addHeadings(navLinks) {
            utils.forAll(navLinks, function (navLink, i) {
                var temp = [];

                // Only find headings for current page.
                if (navLink.isCurrent) {

                    // The current page contains sub-directories; it can't use headings.
                    if (navLink.isParent === false) {

                        // Find all of the headings.
                        $(_self.setting('headingSelector'), _self.setting('pageHtml')).each(function () {
                            var el = $(this);
                            temp.push(new Anchor({
                                name: el.text(),
                                uri: '#' + el.attr('id'),
                                showInNav: true,
                                isDraft: el.parent().hasClass('draft'),
                                isSmoothScroll: _self.setting('isSmoothScroll'),
                                isHeading: true
                            }));
                        });

                        navLink.nav_links = temp;
                    }
                }
            });
        }

        /**
         *
         * @param {} []
         */
        function sortNavLinks(navLinks) {
            var sortA = 1,
                sortB = -1,
                sortBy,
                sortOrder;

            sortBy = _self.setting('sortBy');
            sortOrder = _self.setting('sortOrder').toLowerCase();

            if (sortBy !== '') {
                if (sortOrder === 'desc') {
                    sortA = -1;
                    sortB = 1;
                }
                navLinks = navLinks.sort(function (a, b) {
                    return a[sortBy] > b[sortBy] ? sortA : (a[sortBy] < b[sortBy] ? sortB : 0);
                });
            }
        }

        // Initialize.
        addHeadings(_anchors);
        _anchors = _self.navigation().pruneParents(_anchors, _self.setting('numParents'));
        sortNavLinks(_anchors);
        addBackToTop(_anchors);
        _self.anchors(_anchors);

        return this;
    }

    PatternSidebar.prototype.inherits = Pattern.prototype;
    PatternSidebar.prototype.extends = Pattern.prototype.extends;

    module.exports = PatternSidebar;
}());