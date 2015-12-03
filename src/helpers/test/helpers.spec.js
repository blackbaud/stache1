/*jshint jasmine: true, node: true */

(function () {
    'use strict';

    var fs = require('fs'),
        Handlebars = require('handlebars'),
        helpers = require('../helpers'),
        handlebarsOptions,
        Log = require('log'),
        log = new Log('info');

    // Run the register method to retrieve our custom helpers.
    helpers.register(Handlebars, {}, {
        assemble: {
            options: {
                getBypassContext: function () {
                    return {};
                }
            }
        }
    });

    handlebarsOptions = {
        fn: function (obj) {
            return Handlebars.compile(obj.tmp)(obj);
        },
        inverse: function (obj) {
            return Handlebars.compile(obj.tmp)(obj);
        },
        hash: {
            nav_links: [
                {
                    uri: '/',
                    name: 'Home'
                },
                {
                    uri: '/root/sample-parent/',
                    name: 'Sample Parent',
                    nav_links: [
                        {
                            uri: '/root/sample-parent/sample-child/',
                            name: 'Sample Child',
                            nav_links: [
                                {
                                    uri: '/root/sample-parent/sample-child/sample-grandchild/',
                                    name: 'Sample Grandchild'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };

    function readFile(file) {
        return fs.readFileSync(file, 'utf8');
    }

    describe('helpers', function () {

        describe('include() function', function () {
            function getResult(file, hash) {
                hash = hash || {};
                return Handlebars.helpers.include(
                    'src/helpers/test/fixtures/' + file,
                    {},
                    {
                        hash: hash
                    }
                );
            }

            it('should remove trailing newline', function () {
                var result = getResult('simple.html');
                expect(result.string).toBe('<div>Hello</div>');
            });

            it('should escape HTML', function () {
                var result = getResult(
                    'simple.html',
                    {
                        escape: true
                    }
                );

                expect(result.string).toBe('&lt;div&gt;Hello&lt;/div&gt;');
            });

            it('should indent the specified number of spaces', function () {
                var result = getResult(
                    'multiline.html',
                    {
                        indent: 4
                    }
                );

                expect(result.string).toBe(
                    '    <div>\n' +
                    '      <div>\n' +
                    '        <span>Hello</span>\n' +
                    '      </div>\n' +
                    '    </div>'
                );
            });

        });

        describe('minify() function', function () {
            it('should minify an HTML block', function () {
                var src = [
                        '{{# minify collapseWhitespace=true }}',
                        readFile('src/helpers/test/fixtures/multiline.html'),
                        '{{/ minify }}'].join('\n'),
                    content = Handlebars.compile(src)();

                expect(content).toBe('<div><div><span>Hello</span></div></div>');
            });
        });

        // helpers.withBreadcrumbs
        describe('withBreadcrumbs()', function () {
            it('should return HTML based on an array of objects', function () {
                var result;

                result = Handlebars.helpers.withBreadcrumbs.call({
                    page: {
                        dirname: '/root/sample-parent/sample-child/sample-grandchild'
                    },
                    tmp: readFile('src/helpers/test/fixtures/breadcrumbs.html')
                }, handlebarsOptions);

                result = [
                    '{{# minify collapseWhitespace=true }}',
                    result,
                    '{{/ minify }}'
                ].join('\n');

                result = Handlebars.compile(result)();

                expect(result).toBe('<div id="breadcrumbs"><div class="container"><ul class="breadcrumb"><li><a href="/">Home</a></li><li><a href="/root/sample-parent/">Sample Parent</a></li><li><a href="/root/sample-parent/sample-child/">Sample Child</a></li><li class="active">Sample Grandchild</li></ul></div></div>');
            });
        });

        // helpers.extendRootOptions
        describe('extendRootOptions', function () {
            it('should', function () {
                expect(1).toBe(1);
            });
        });
    });

    describe('stache.utils', function () {

        // stache.utils.concatArray()
        describe('concatArray() function', function () {
            it('should append the second array to the first', function () {
                var arr1,
                    arr2,
                    result;

                // Both valid arrays.
                arr1 = ['a', 'b'];
                arr2 = ['c', 'd'];

                result = Handlebars.stache.utils.concatArray(arr1, arr2);

                expect(result).toEqual(['a', 'b', 'c', 'd']);

                // arr1 is not an array.
                arr1 = null;
                arr2 = ['c', 5, undefined];

                result = Handlebars.stache.utils.concatArray(arr1, arr2);

                expect(result).toEqual(['c', 5, undefined]);

                // arr1 and arr2 are not arrays.
                arr1 = "my string";
                arr2 = null;

                result = Handlebars.stache.utils.concatArray(arr1, arr2);

                expect(result).toEqual([]);
            });
        });

        // stache.utils.findBreadcrumb
        describe('findBreadcrumb', function () {
            it('should', function () {
                expect(1).toBe(1);
            });
        });

        // stache.utils.getBreadcrumbNavLinks
        describe('getBreadcrumbNavLinks', function () {
            it('should', function () {
                expect(1).toBe(1);
            });
        });

        // stache.utils.getNavLinks
        describe('getNavLinks', function () {
            it('should', function () {
                expect(1).toBe(1);
            });
        });

        // stache.utils.mergeOption
        describe('mergeOption', function () {
            it('should', function () {
                expect(1).toBe(1);
            });
        });

    });

}());
