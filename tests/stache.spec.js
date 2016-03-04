/*jshint jasmine: true, node: true */
(function () {
    'use strict';

    var grunt,
        stache,
        using;

    using = require('../tests/utils/using')(jasmine);
    grunt = require('grunt');
    stache = require('../tasks/stache.js')(grunt);

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
            grunt.config.set('stache.globPatterns.cwd', 'fixtures/content');
            mappings.push(stache.tasks.expandFileMappings());

            using("valid values", mappings, function (value) {
                it('should return an array of objects', function () {
                    expect(value).toEqual(jasmine.any(Array));
                    if (value) {
                        for (var i in value) {
                            expect(value[i]).toEqual(jasmine.any(Object));
                        }
                    }
                });
                it('should create objects with a string set to both the "src" and "dest" properties', function () {
                    if (value) {
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

                        // Reset hooks.
                        grunt.config.set('stache.hooks', {});
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
        describe('getMergedStacheYaml()', function () {
            it('should return an object', function () {
                var config = stache.utils.getMergedStacheYaml();
                expect(config).toEqual(jasmine.any(Object));
            });
            it('should merge global stache.yml with local stache.yml', function () {
                var config;
                grunt.config.set('stache.pathConfig', 'tests/fixtures/stache.yml');
                grunt.config.set('stache.dir', '../');
                config = stache.utils.getMergedStacheYaml();
                expect(config.base).toBe('different/base');
            });
            it('should merge global stache.yml with any custom .yml files, if provided', function () {
                var config;
                grunt.config.set('stache.dir', '../');
                grunt.option('config', 'tests/fixtures/custom1.yml,tests/fixtures/custom2.yml');
                config = stache.utils.getMergedStacheYaml();
                expect(config.base).toBe('yet/another/base');
                expect(config.foo).toBe('bar');
            });
        });
    });

}());
