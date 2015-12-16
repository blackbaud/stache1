/*jshint jasmine: true, node: true */
(function () {
    'use strict';

    var grunt,
        log,
        Log,
        stache;

    grunt = require('grunt');
    stache = require('../tasks/stache.js')(grunt);
    Log = require('log');
    log = new Log('info');

    /**
     * Stache Grunt tasks
     */
    describe('Stache Tasks', function () {
        describe('expandMappings()', function () {
            it('should', function () {
                expect(1).toEqual(1);
            });
        });
        describe('hook()', function () {
            it('should', function () {
                expect(1).toEqual(1);
            });
        });
    });

    /**
     * Stache Utilities
     */
    describe('Stache Utilities', function () {
        describe('capitalizeFirstLetter()', function () {
            it('should return a string', function () {
                expect(1).toEqual(1);
            });
            it('should capitalize the first letter of a string', function () {
                expect(1).toEqual(1);
            });
        });
        describe('extendStacheConfig()', function () {
            it('should return an object', function () {
                expect(1).toEqual(1);
            });
            it('should merge the global YAML data with the local YAML data', function () {
                expect(1).toEqual(1);
            });
        });
    });

}());
