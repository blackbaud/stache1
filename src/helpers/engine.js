/**
 * NOTES
 *   - Overriding default markdown / md helpers for one simple reason.
 *   - Nesting HTML generated text with four spaces.  Marked thinks this is code.
 *   - In order to fix this, I override the rule that supports four spaces as code.
 *   - The GFM (```) for code still works.
 */
(function () {
    "use strict";

    var lexer,
        marked,
        renderer;

    /**
     * Light wrapper for our custom markdown processor.
     * Only process a block of Markdown once.
     */
    function getCached(md) {

        var comment = '\n<!-- STACHE MARKED -->\n',
            input = md || '';

        return input.indexOf(comment) > -1 ? input : [
            comment,
            marked.parser(lexer.lex(input), {
                headerPrefix: '',
                renderer: renderer
            })
        ].join('');
    }

    module.exports = function (options) {

        marked = require('marked');
        renderer = new marked.Renderer();
        lexer = new marked.Lexer();

        lexer.rules.code = /ANYTHING_BUT_FOUR_SPACES/;

        // https://github.com/chjj/marked/blob/master/lib/marked.js#L890
        renderer.image = function (href, title, text) {
            var out;
            if (href.indexOf('/static/') > -1) {
                href = href.replace('/static/', '/');
            }
            out = '<img src="' + href + '" alt="' + text + '"';
            if (title) {
                out += ' title="' + title + '"';
            }
            out += renderer.options.xhtml ? '/>' : '>';
            return out;
        };

        return {
            getCached: getCached
        };
    };

}());
