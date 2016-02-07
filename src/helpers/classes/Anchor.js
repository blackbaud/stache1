/*global: __dirname, module, require */
(function () {
    "use strict";

    var merge;

    merge = require('merge');

    /**
     *
     *
     * @param {} []
     */
    function Anchor(options) {
        var anchor,
            defaults;

        defaults = {
            childNavClass: 'nav',
            hasDropdown: false,
            isActive: false,
            isClickable: true,
            isCurrent: false,
            isDraft: false,
            isHeading: false,
            isParent: false,
            isSmoothScroll: false,
            isVisibleOnAffix: false,
            showChildNav: true,
            showInFooter: true,
            showInHeader: true,
            showInNav: true
        };

        anchor = merge(true, defaults, options);
        return this.setClassesForNavLink(anchor);
    }

    Anchor.prototype = {

        /**
         *
         *
         * @param {} []
         */
        setClassesForNavLink: function (navLink) {
            var classes;

            function addUnique(thing) {
                if (classes.indexOf(thing) === -1) {
                    classes.push(thing);
                }
            }

            if (navLink.class) {
                if (navLink.class.pop && navLink.class.push) {
                    classes = navLink.class;
                } else {
                    classes = navLink.class.split(" ");
                }
            } else {
                classes = [];
            }

            if (navLink.isActive) {
                addUnique("active");
            }

            if (navLink.isCurrent) {
                addUnique("current");
            }

            if (navLink.isDraft) {
                addUnique("draft");
            }

            if (navLink.isHeading) {
                addUnique("heading");
            }

            if (navLink.isVisibleOnAffix) {
                addUnique('visible-on-affix');
            }

            if (navLink.isSmoothScroll) {
                addUnique("smooth-scroll");
            }

            if (navLink.hasDropdown) {
                addUnique("dropdown");
                addUnique("dropdown-toggle");
                navLink.childNavClass = 'dropdown-menu';
            }

            navLink.class = classes.join(" ");

            return navLink;
        }
    };

    module.exports = Anchor;

}());