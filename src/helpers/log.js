module.exports = function (grunt) {
    "use strict";

    /**
     * Using grunt.log, this method prefixes a message with a "branded" phrase
     * to allow users to easily spot Stache-specific console messages.
     *
     * @param [string] message
     */
    var log = function (message) {
        console.log('STACHE '['magenta'] + message);
    };

    // Allow the log method to recognize grunt's "verbose" mode.
    log.verbose = function (message) {
        try {
            if (grunt.option('verbose') === true) {
                log(message);
            }
        } catch (error) {}
    };

    log.error = function (message) {
        log(message['red']);
    };

    log.warning = function (message) {
        log(message['yellow']);
    };

    log.success = function (message) {
        log(message['green']);
    };

    log.muted = function (message) {
        log(message['grey']);
    };

    return log;
};