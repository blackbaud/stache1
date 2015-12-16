/*jshint jasmine: true, node: true */
(function () {
    'use strict';

    var grunt,
        log,
        Log,
        stache,
        using;

    using = require('../tests/utils/using')(jasmine);
    grunt = require('grunt');
    stache = require('../tasks/stache.js')(grunt);
    Log = require('log');
    log = new Log('info');

    //log.info(using);

    // Overriding the location of the content directory, since it's relative.
    grunt.config.set('stache.config.content', '../../content/');

    /**
     * Stache Grunt tasks
     */
    describe('Stache Tasks', function () {
        describe('expandFileMappings()', function () {
            var mappings;

            mappings = [];
            mappings.push(stache.tasks.expandFileMappings());
            grunt.config.set('assemble.defaults.files.cwd', 'fixtures/content');
            mappings.push(stache.tasks.expandFileMappings());

            using("valid values", mappings, function (value) {
                it('should return an array of objects', function () {
                    expect(value).toEqual(jasmine.any(Array));
                    if (value.length) {
                        for (var i in value) {
                            expect(value[i]).toEqual(jasmine.any(Object));
                        }
                    }
                });
                it('should create objects with a string set to both the "src" and "dest" properties', function () {
                    if (value.length) {
                        for (var i in value) {
                            expect(value[i].hasOwnProperty("src")).toEqual(true);
                            expect(value[i].hasOwnProperty("dest")).toEqual(true);
                        }
                    }
                });
            });
        });
        describe('hook()', function () {
            it('should execute a collection of Grunt tasks', function () {
                expect(function () {
                    try {
                        grunt.task.registerTask('sampleTask1', function () {});
                        grunt.task.registerTask('sampleTask2', function () {});
                        grunt.config.set('stache.hooks.preStache', ['sampleTask1', 'sampleTask2']);
                        grunt.task.run('hook:preStache');
                        grunt.config.set('stache.hooks.preStache', []);
                        grunt.task.run('hook:preStache');
                        grunt.config.set('stache.hooks.preStache', null);
                        grunt.task.run('hook:preStache');
                        grunt.config.set('stache.hooks.preStache', undefined);
                        grunt.task.run('hook:preStache');
                        grunt.config.set('stache.hooks.myHook', 15);
                        grunt.task.run('hook:myHook');
                    } catch (e) {
                        throw new TypeError("hook() failed: " + e.message);
                    }
                }).not.toThrow();
            });
        });
    });

    /**
     * Stache Utilities
     */
    describe('Stache Utilities', function () {
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
