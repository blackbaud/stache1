/*jshint jasmine: true, node: true */

(function () {
    'use strict';

    var fs = require('fs'),
        Handlebars = require('handlebars'),
        helpers = require('../helpers');

    helpers.register(
        Handlebars,
        {
        },
        {
            assemble: {
                options: {
                    getBypassContext: function () {
                        return {};
                    }
                }
            }
        }
    );

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

    });
}());
