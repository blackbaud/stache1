(function () {
    "use strict";

    var Navigation;

    Navigation = require(__dirname + '/classes/Navigation');

    module.exports = function (anchors, options) {
        return new Navigation(anchors, options);
    };
}());