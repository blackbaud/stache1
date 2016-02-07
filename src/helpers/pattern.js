(function () {
    "use strict";

    var patterns = {};

    // Load all classes that are suffixed with "Pattern.js".
    require('fs').readdirSync(__dirname + '/classes/').forEach(function (file) {
        if (file.match(/Pattern/) !== null && file !== 'Pattern.js') {
            patterns[file.replace('.js', '')] = require(__dirname + '/classes/' + file);
        }
    });

    module.exports = function (name, navigation, options) {
        name = 'Pattern' + name[0].toUpperCase() + name.substring(1);

        if (typeof patterns[name] !== "function") {

            var possibleNames = [];

            for (var k in patterns) {
                possibleNames.push(k.toLowerCase().split('pattern')[1]);
            }

            console.log("The pattern `" + name.toLowerCase().split('pattern')[1] + "` was not found! Possible patterns: ", possibleNames.join(', '));

            return false;
        }

        return new patterns[name](navigation, options);
    };
}());