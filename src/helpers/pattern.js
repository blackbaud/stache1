(function () {
    "use strict";

    var fs,
        patterns,
        slog;

    fs = require('fs');
    slog = require(__dirname + '/log');
    patterns = {};


    // Load all classes that are prefixed with "Pattern".
    fs.readdirSync(__dirname + '/classes/').forEach(function (file) {
        if (file.match(/Pattern/) === null || file === 'Pattern.js') {
            return;
        }

        // Load the class and add it to the patterns array.
        patterns[file.replace('.js', '')] = require(__dirname + '/classes/' + file);
    });


    module.exports = function (name, navigation, options) {
        var k,
            possibleNames;

        name = 'Pattern' + name[0].toUpperCase() + name.substring(1);
        possibleNames = [];

        // The pattern requested does not have a related class.
        // Tell the user which patterns are available.
        if (typeof patterns[name] !== "function") {
            for (k in patterns) {
                possibleNames.push(k.toLowerCase().split('pattern')[1]);
            }
            slog.warning("The pattern `" + name.toLowerCase().split('pattern')[1] + "` was not found! Possible patterns: ", possibleNames.join(', '));
            return false;
        }

        // Return the appropriate pattern object.
        return new patterns[name](navigation, options);
    };
}());