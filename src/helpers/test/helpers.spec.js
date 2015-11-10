/*jshint jasmine: true, node: true */

(function () {
    'use strict';

    var assemble = require('assemble'),
        grunt = require('grunt'),
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

    });

    /*
      ======== A Handy Little Nodeunit Reference ========
      https://github.com/caolan/nodeunit
      Test methods:
        test.expect(numAssertions)
        test.done()
      Test assertions:
        test.ok(value, [message])
        test.equal(actual, expected, [message])
        test.notEqual(actual, expected, [message])
        test.deepEqual(actual, expected, [message])
        test.notDeepEqual(actual, expected, [message])
        test.strictEqual(actual, expected, [message])
        test.notStrictEqual(actual, expected, [message])
        test.throws(block, [error], [message])
        test.doesNotThrow(block, [error], [message])
        test.ifError(value)
    */

    exports.skylint = {
        setUp: function (done) {
            // setup here if necessary
            done();
        },

        includeEscapesHtml: function (test) {
        }//,

        // writesHostFile: function (test) {
        //     test.expect(3);
        //
        //     grunt.util.spawn({
        //         grunt: true,
        //         args: ['skylint:test']
        //     }, function (err, result) {
        //         var contents;
        //
        //         test.ok(grunt.file.exists('tmp/host.html'), true, 'The host HTML file should have been written to tmp folder.');
        //
        //         contents = grunt.file.read('tmp/host.html') || '';
        //
        //         test.notEqual(contents, '', 'The host HTML file should have valid contents.');
        //
        //         test.equal(contents.indexOf('<!--#SKYLINT_HTML-->'), -1, 'The host HTML file\'s HTML placeholder should be replaced with the downloaded script.');
        //
        //         test.done();
        //     });
        // },
        //
        // findsErrors: function (test) {
        //     test.expect(1);
        //
        //     grunt.util.spawn({
        //         grunt: true,
        //         args: ['skylint:test']
        //     }, function (err, result) {
        //         result = result.toString();
        //
        //         test.notEqual(result.indexOf('7 error(s) were found in "test/fixtures/test.html"'), -1, 'Errors should be found.');
        //
        //         test.done();
        //     });
        // }
    };
}());
