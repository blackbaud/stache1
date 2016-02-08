/*global: __dirname, module, require */
(function () {
    "use strict";

    var Core;

    Core = require(__dirname + '/Core');

    /**
     * Pattern
     *
     * @param {} []
     */
    function Pattern(navigation, options) {
        var _anchors,
            _navigation,
            _settings;

        // Public variables.
        this.defaults = this.defaults || {};

        // Extend any classes.
        if (this.extends) {
            this.extends.constructor.call(this, options);
        }

        // Private variables.
        _anchors = [];
        _navigation = {};
        _settings = {};

        // Public methods.
        this.anchors = function (val) {
            if (val === undefined) {
                return _anchors || [];
            }
            _anchors = val;
            return this;
        };
        this.navigation = function (val) {
            if (val === undefined) {
                return _navigation;
            }
            _navigation = val;
            return this;
        };

        // Initialize.
        this.settings(options);
        this.navigation(navigation);
        this.anchors(this.navigation().anchors());

        return this;
    }

    Pattern.prototype.extends = Core.prototype;

    module.exports = Pattern;

}());