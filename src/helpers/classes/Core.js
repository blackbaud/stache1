(function () {
    "use strict";

    var merge;

    merge = require('merge');

    function Core(options) {
        var _settings = {};
        this.defaults = this.defaults || {};
        this.setting = function (key, val) {
            if (val === undefined) {
                return _settings[key];
            }
            _settings[key] = val;
            return this;
        };
        this.settings = function (options) {
            if (options === undefined) {
                return _settings;
            }
            _settings = merge.recursive(true, this.defaults, options || {});
            return this;
        };
        return this;
    }

    module.exports = Core;
}());