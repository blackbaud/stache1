(function () {
    "use strict";

    var Pattern,
        utils;

    Pattern = require(__dirname + '/Pattern');
    utils = require('../../../src/helpers/utils');

    function PatternStack(navigation, options) {
        var _anchors,
            _self;

        // Public variables.
        this.defaults = {};

        // Class inheritance.
        this.inherits && this.inherits.constructor.call(this, navigation, options);

        _self = this;

        _anchors = _self.anchors();
        _anchors = utils.forAll(_anchors, function (navLink, i) {
            if (navLink.showInFooter === false) {
                this.omit();
                return;
            }
            if (navLink.nav_links) {
                this.omitChildren();
                return;
            }
        });
        _self.anchors(_anchors);

        return this;
    }

    PatternStack.prototype.inherits = Pattern.prototype;
    PatternStack.prototype.extends = Pattern.prototype.extends;

    module.exports = PatternStack;
}());