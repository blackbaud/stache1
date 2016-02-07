/*global: __dirname, module, require */
(function () {
    "use strict";

    var Anchor,
        Pattern,
        utils;

    Anchor = require(__dirname + '/Anchor');
    Pattern = require(__dirname + '/Pattern');
    utils = require('../../../src/helpers/utils');

    function PatternDropdown(navigation, options) {
        var _anchors,
            _self,
            navDropdownDepth,
            showNavDropdown;

        // Public variables.
        this.defaults = {
            navDropdownDepth: 1,
            showNavDropdown: true
        };

        // Class inheritance.
        if (this.inherits) {
            this.inherits.constructor.call(this, navigation, options);
        }

        _self = this;
        _anchors = _self.anchors();
        showNavDropdown = _self.setting('showNavDropdown');
        navDropdownDepth = _self.setting('navDropdownDepth');

        _anchors = utils.forAll(_anchors, function (navLink, i) {

            // Does this page want to be displayed in the header?
            if (navLink.showInHeader === false) {
                this.omit();
                return;
            }

            // Add the special sky active class to links.
            if (navLink.isActive || navLink.isCurrent) {
                if (navLink.class && typeof navLink.class.pop === "function") {
                    navLink.class.push('bb-navbar-active');
                } else {
                    navLink.class += ' bb-navbar-active';
                }
            }

            // Only display a certain number of dropdown levels.
            if (navLink.nav_links) {

                if (this.getLevel() < navDropdownDepth) {

                    navLink.showChildNav = showNavDropdown;

                    if (showNavDropdown === true) {
                        navLink.name += '<i class="caret"></i>';
                        navLink.hasDropdown = true;
                    }

                } else {
                    this.omitChildren();
                }
            }

            this.updateItem(new Anchor(navLink));
        });

        _self.anchors(_anchors);

        return this;
    }

    PatternDropdown.prototype.inherits = Pattern.prototype;
    PatternDropdown.prototype.extends = Pattern.prototype.extends;

    module.exports = PatternDropdown;
}());