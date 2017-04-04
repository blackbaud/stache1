/**
* Stache Helpers
* Bobby Earl, 2015-02-12
*
* NOTES
*   - Overriding default markdown / md helpers for one simple reason.
*   - Nesting HTML generated text with four spaces.  Marked thinks this is code.
*   - In order to fix this, I override the rule that supports four spaces as code.
*   - The GFM (```) for code still works.
**/

/*jslint node: true, nomen: true, plusplus: true */
'use strict';

module.exports.register = function (Handlebars, options, params) {

    var bypassContext,
        stache,
        merge,
        cheerio,
        fs,
        marked,
        minify,
        UglifyJS,
        renderer,
        lexer,
        counts,
        utils;

    bypassContext = params.assemble.options.getBypassContext();
    stache = params.assemble.options.stache;
    merge = require('merge');
    cheerio = require('cheerio');
    fs = require('fs');
    marked = require('blackbaud-marked');
    minify = require('html-minifier').minify;
    UglifyJS = require('uglify-js');
    renderer = new marked.Renderer();
    lexer = new marked.Lexer();
    counts = {};

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

    // Apply SKY UX classnames to headers following the example at https://github.com/chjj/marked#overriding-renderer-methods
    // Disabling to fix immediate bug.  - Bobby, 2016-06-29
    // renderer.heading = function (text, level) {
    //     var classname;
    //     classname = "";
    //     switch (level) {
    //     case 1:
    //         classname = "bb-page-heading";
    //         break;
    //     case 2:
    //         classname = "bb-section-heading";
    //         break;
    //     case 3:
    //         classname = "bb-subsection-heading";
    //         break;
    //     }
    //     return '<h' + level + ' class="' + classname + '">' + text + '</h' + level + '>';
    // };

    /**
    * Utility function to get the basename
    **/
    function basename(path, clean) {
        var dot;

        // Clean is optional, but defaults to true
        if (arguments.length !== 2) {
            clean = true;
        }

        if (clean && path) {
            dot = path.lastIndexOf('.');

            // Replace the extension
            path = dot === -1 ? path : path.substr(0, dot);

            // Replace the default page name
            path = path.replace('index', '');

            // Remove our build folder
            path = path.replace(stache.config.build, '');

            // Remove leading & trailing slash
            path = path.replace(/^\/|\/$/g, '');

        // Always return a path
        } else {
            path = '';
        }

        return path;
    }

    /**
    * Determines if two URI's are the same.
    * Supports thinking parent uri's are active.
    * Wrapping the basenames in '/' prevents false matches, ie docs vs docs2 vs 2docs.
    **/
    function isActiveNav(dest, uri, parentCanBeActive) {
        var base = stache.config.base;
        dest = '/' + basename(dest) + '/';
        uri = '/' + basename(uri) + '/';
        return (parentCanBeActive && uri !== base) ? dest.indexOf(uri) > -1 : uri === dest;
    }

    /**
    * Recursively searches the nav array to find the active link
    **/
    function getActiveNav(dest, nav_links, parentCanBeActive) {
        var j = nav_links.length,
            i = 0,
            r = '';

        for (i; i < j; i++) {
            if (isActiveNav(dest, nav_links[i].uri, parentCanBeActive)) {
                r = nav_links[i];
            } else if (nav_links[i].nav_links) {
                r = getActiveNav(dest, nav_links[i].nav_links, parentCanBeActive);
            }
            if (r !== '') {
                break;
            }
        }

        return r;
    }

    /**
    * Light wrapper for our custom markdown processor.
    * Only process a block of Markdown once.
    * langPrefix set for better integration of prism.js when using ```
    **/
    function getMarked(md) {

        var comment = '\n<!-- STACHE MARKED -->\n',
            input = md || '';

        return input.indexOf(comment) > -1 ? input : [
            comment,
            marked.parser(lexer.lex(input), {
                headerPrefix: '',
                renderer: renderer,
                langPrefix: 'language-'
            })
        ].join('');
    }

    /**
    * http://stackoverflow.com/questions/10015027/javascript-tofixed-not-rounding
    **/
    function toFixed(number, precision) {
        var multiplier = Math.pow(10, precision + 1),
            wholeNumber = Math.round(number * multiplier).toString(),
            length = wholeNumber.length - 1;

        wholeNumber = wholeNumber.substr(0, length);
        return [
            wholeNumber.substr(0, length - precision),
            wholeNumber.substr(-precision)
        ].join('.');
    }

    /**
    * Fixes Windows Newlines
    **/
    function newline(text) {
        return text ? text.replace(/\r\n/g, '\n') : '';
    }

    /**
    * Function for arranging an array for vertical display.
    **/
    function forVertical(arr, cols) {
        var temp,
            r = [],
            row = 0,
            col = 0,
            len = arr.length,
            rows = Math.ceil(len / cols);

        while (row < rows) {
            temp = row + (col * rows);
            if (temp >= len) {
                row++;
                col = 0;
            } else {
                r.push(arr[temp]);
                col++;
            }
        }

        return r;
    }

    /**
     * Utility methods.
     */
    utils = {

        /**
         * Returns a single array, the second appended to the first.
         *
         * @param {array} [arr1] The array to be extended.
         * @param {array} [arr2] The array to be appended to the first.
         */
        concatArray: function (arr1, arr2) {
            var i,
                len,
                arr1IsArray,
                arr2IsArray;

            arr1IsArray = Handlebars.Utils.isArray(arr1);
            arr2IsArray = Handlebars.Utils.isArray(arr2);

            if (!arr1IsArray && !arr2IsArray) {
                return [];
            }

            if (!arr2IsArray && arr1IsArray) {
                return arr1;
            }

            if (!arr1IsArray && arr2IsArray) {
                return arr2;
            }

            len = arr2.length;

            for (i = 0; i < len; ++i) {
                arr1.push(arr2[i]);
            }

            return arr1;
        },

        /**
         * Returns an object representing a page's properties, only if its URI is
         * a fragment of the active page's URI. The method receives an array of objects,
         * to be checked against the active URI.
         *
         * @param {array} [navLinks] Array of objects representing pages.
         * @param {string} [activeURI] The path of the active page.
         */
        findBreadcrumb: function (navLinks, activeURI) {
            var base,
                breadcrumbs,
                i,
                navLink,
                navLinksLength;

            base = stache.config.base;
            breadcrumbs = [];
            navLinksLength = navLinks.length;

            for (i = 0; i < navLinksLength; ++i) {

                navLink = navLinks[i];

                // Don't include the Home page because it cannot have sub-directories.
                // (We add the Home page manually, in getBreadcrumbNavLinks.)
                if (navLink.uri !== base) {

                    // Is this page's URI a fragment of the active page's URI?
                    if (activeURI.indexOf(navLink.uri) > -1) {
                        breadcrumbs.push({
                            name: navLink.name,
                            uri: navLink.uri
                        });

                        // Does this page have sub-directories?
                        if (navLink.hasOwnProperty('nav_links')) {
                            breadcrumbs = utils.concatArray(breadcrumbs, utils.findBreadcrumb(navLink.nav_links, activeURI));
                        }

                        break;
                    }
                }
            }

            // Set the final navigation link as 'active' and return the array.
            if (breadcrumbs.length > 0) {
                breadcrumbs[breadcrumbs.length - 1].active = true;
                return breadcrumbs;
            }

            // The navigation links didn't contain a breadcrumb.
            return false;
        },

        /**
         * Returns an array representing all breadcrumb nav_links for a given page.
         *
         * @param {object} [options] Handlebars' options hash.
         */
        getBreadcrumbNavLinks: function (navLinks, activeURI) {
            var config,
                items;

            config = (typeof stache !== "undefined") ? stache.config : {};
            items = utils.findBreadcrumb(navLinks, activeURI);

            // Add Home page.
            if (items !== false) {
                items.unshift({
                    name: config.nav_title_home || 'Home',
                    uri: config.base || '/'
                });
            }

            return items;
        },

        /**
         * Returns an array representing all pages, sorted.
         * The array also respects page hierarchies: child pages are stored in the respective
         * parent page's property, 'nav_links'.
         *
         * @param {object} [options] Handlebars' options hash.
         */
        getNavLinks: function (options) {
            return (options.hash && options.hash.nav_links) ? options.hash.nav_links : bypassContext.nav_links || [];
        },

        /**
         * Returns the local value, if set. Otherwise, returns the global value.
         * If neither is set, return false.
         *
         * @param {various} [global] A global option's value (stache.yml)
         * @param {various} [local] A local option's value (front-matter)
         */
        mergeOption: function (global, local) {
            var merged = false;
            if (typeof local === "undefined") {
                if (typeof global !== "undefined") {
                    merged = global;
                }
            } else {
                merged = local;
            }
            return merged;
        }

    };

    Handlebars.registerHelper({

        /**
         * Returns the preferred value of a YAML option (either root or page).
         *
         * @param {object} [options] Handlebars' options hash.
         */
        extendRootOptions: function (options) {
            var config,
                i,
                key,
                keys,
                keysLength;

            config = stache.config;
            keys = [
                'showBreadcrumbs',
                'blogReadMoreLabel',
                'swagger',
                'bootstrap_container',
                'sidebarLayoutSecondaryColumn',
                'sidebarLayoutPrimaryColumn'
            ];
            keysLength = keys.length;

            for (i = 0; i < keysLength; ++i) {
                key = keys[i];
                if (typeof this[key] === 'object') {
                    this[key] = merge(true, config[key], this[key]);
                }
                this[key] = utils.mergeOption(config[key], this[key]);
            }
            return options.fn(this);
        },

        /**
         * Adds breadcrumb nav_links to the scope.
         *
         * @param {object} [options] Handlebars' options hash.
         */
        withBreadcrumbs: function (options) {
            var activeURI = this.page.dirname + "/";
            this.nav_links = utils.getBreadcrumbNavLinks(utils.getNavLinks(options), activeURI);
            return (this.nav_links !== false) ? options.fn(this) : options.inverse(this);
        },

        /**
        * Get an operation from data.operations.
        * @param {string} [property] - Returns a specific property of the operation.
        * @param {string} [name] - Search the list of operations on any property.
        * @example
        * {{# withOperation name="Address (Create)" }} {{ id }} {{/ withOperation }}
        * {{ getOperation name="Address (Create)" property="description" }}
        **/
        getOperation: function (context) {
            var operations = params.assemble.options.data.operations,
                hasProperty,
                filtered;

            if (!operations) {
                return '';
            }

            hasProperty = context.hash.property !== 'undefined';

            filtered = operations.filter(function (item) {
                var prop;
                for (prop in context.hash) {
                    if (context.hash.hasOwnProperty(prop) && prop !== 'property') {
                        if (!item.hasOwnProperty(prop) || item[prop].indexOf(context.hash[prop]) === -1) {
                            return false;
                        }
                    }
                }
                return true;
            });

            if (filtered.length === 1) {
                filtered = filtered[0];
            }

            if (hasProperty && typeof filtered[context.hash.property] !== 'undefined') {
                filtered = filtered[context.hash.property];
            }

            return filtered;
        },

        /**
        * Shortcut for this "{{ getOperation name='Address (Create)' property='id' }}"
        * AND, more importantly, it corrects the azure links.
        **/
        getOperationUri: function (context) {
            var operation = Handlebars.helpers.getOperation(context);
            if (operation) {
                return operation.id.replace('/apis/', 'docs/services/');
            }
        },

        /**
        * Presents a context with the results returned from getOperation
        * @param {array} [context.hash] - Optional key/value pairs to pass to @getOperation
        **/
        withOperation: function (context) {
            return context.fn(Handlebars.helpers.getOperation(context));
        },

        /**
        * Compares "uri" in the current context (or the first parameter) to the current URL
        * http://assemble.io/docs/FAQ.html
        **/
        isActiveNav: function (options) {
            var r = isActiveNav(options.hash.dest || this.dest || '', options.hash.uri || this.uri || '', typeof options.hash.parentCanBeActive !== 'undefined' ? options.hash.parentCanBeActive : true);
            return r ? options.fn(this) : options.inverse(this);
        },

        /**
        * Is the current page home
        **/
        isHome: function (options) {
            var b = basename(options.hash.dest || this.page.dest || 'NOT_HOME', true),
                base = basename(stache.config.base);
            return (b === '' || b === base) ? options.fn(this) : options.inverse(this);
        },

        /**
        * Debugging JSON content
        **/
        json: function (context) {
            return JSON.stringify(context);
        },

        /**
        * Fetches JSON data by key and returns it.
        **/

        getDataByName: function (name) {
            if (this.hasOwnProperty(name)) {
                return JSON.stringify(this[name]);
            }
        },

        /**
        * Does the current page have headings?
        **/
        hasHeadings: function (options) {
            return Handlebars.helpers.eachHeading(options) !== '' ? options.fn(this) : options.inverse(this);
        },

        /**
        * This innocuous looking helper took quite a long time to figure out.
        * It takes the current pages entire RAW source, crompiles it, and loads it in cheerio (jQuery).
        * Then it parses for the relevant headers and executes the template for each one.
        **/
        eachHeading: function (options) {
            var html = getMarked(Handlebars.compile(options.hash.page || '')(params.assemble.options)),
                r = '';

            cheerio(options.hash.selector || 'h2', html).each(function () {
                var el = cheerio(this);
                r = r + options.fn({
                    name: el.text(),
                    id: el.attr('id'),
                    draft: el.parent().hasClass('draft')
                });
            });

            return r;
        },

        /**
        * Finds the current page in the nav and iterates its child links
        * Supports optional modulus parameters.
        **/
        eachChildLink: function (options) {
            var dest = '',
                nav_links = '',
                active;

            if (typeof options.hash.dest !== 'undefined') {
                dest = options.hash.dest;
            } else if (typeof this.page !== 'undefined' && typeof this.page.dest !== 'undefined') {
                dest = this.page.dest;
            }

            nav_links = utils.getNavLinks(options);
            active = getActiveNav(dest, nav_links, false);

            if (active && active.nav_links) {
                active = active.nav_links;
            }

            return Handlebars.helpers.eachWithMod(active, options);
        },

        eachWithMod: function (context, options) {
            var r = '',
                slim = [],
                counter = 0,
                h,
                i = 0,
                m = 0,
                mod = options.hash.mod || 0,
                limit = options.hash.limit || -1,
                layout = options.hash.layout || 'horizontal',
                j,
                show;

            if (context && context.length) {

                j = context.length;

                for (i; i < j; i++) {

                    // Don't go past our limit
                    if (limit !== -1 && counter >= limit) {
                        break;
                    }

                    // Make sure the page doesn't say ignore
                    show = true;
                    if (typeof context[i].showInNav !== 'undefined' && context[i].showInNav === false) {
                        show = false;
                    }

                    if (show) {
                        // Add any hash values to the context.
                        if (options.hash) {
                            for (h in options.hash) {
                                if (options.hash.hasOwnProperty(h)) {

                                    // These fields should NOT be propagated into child scopes:
                                    switch (h) {
                                    case "nav_links":
                                        break;
                                    default:
                                        context[i][h] = options.hash[h];
                                        break;
                                    }
                                }
                            }
                        }
                        slim.push(context[i]);
                        counter++;
                    }
                }

                // Organize vertically
                if (layout === 'vertical' && mod > 0) {
                    slim = forVertical(slim, mod);
                }

                // Display the real items
                for (i = 0, j = slim.length; i < j; i++) {
                    m = i % mod;
                    slim[i].first = i === 0;
                    slim[i].last = i === j - 1;
                    slim[i].mod = m;
                    slim[i].cols = mod;
                    slim[i].mod0 = m === 0;
                    slim[i].mod1 = m === mod - 1;
                    slim[i].index = i;
                    slim[i].colWidth = mod === 0 ? 0 : (12 / mod);
                    slim[i].colOffset = slim[i].colWidth * m;
                    slim[i].firstOrMod0 = slim[i].first || slim[i].mod0;
                    slim[i].lastOrMod1 = slim[i].last || slim[i].mod1;
                    r += options.fn(slim[i]);
                }
            }
            return r;
        },

        /**
        * Loop through a certain number of times.
        **/
        loop: function (options) {
            var arr = new Array(options.hash.end);
            return Handlebars.helpers.each(arr, options);
        },

        /**
        * Overriding default markdown helper.
        * See notes above for more information.
        **/
        markdown: function (options) {
            var md = getMarked(options.fn(this)),
                nl = typeof options.hash.newline !== 'undefined' ? options.hash.newline : true;
            return nl ? newline(md) : md;
        },

        /**
        * If settings say to render, wrap content in div
        **/
        draft: function (options) {
            return stache.config.draft ? ('<div class="draft">\r\n\r\n' + getMarked(options.fn(this)) + '\r\n\r\n</div>') : '';
        },

        /**
        * Return the current count for the required property
        **/
        count: function (prop) {
            if (typeof counts[prop] === 'undefined') {
                counts[prop] = 0;
            }
            return counts[prop];
        },

        /**
        * Increment the count for the required property
        **/
        increment: function (prop) {
            counts[prop] = typeof counts[prop] === 'undefined' ? 0 : (counts[prop] + 1);
        },

        /**
        * Render a file.  Search path order: partial, absolute, relative, content folder
        **/
        include: function (file, context, options) {

            var r,
                template,
                fileWithPath,
                c,
                hideYFM,
                indent,
                indentString,
                render,
                fixNewline,
                escape,
                moreIndex,
                more,
                src,
                start,
                end;

            if (typeof options === 'undefined') {
                options = context;
                context = this;
            }

            // Increment sidebarCurrentDepth if it exists
            if (options.hash.sidebarCurrentDepth) {
                options.hash.sidebarCurrentDepth = parseInt(options.hash.sidebarCurrentDepth) + 1;
            }

            r = '';
            template = '';
            fileWithPath = file;
            c = merge(context, options.hash);
            hideYFM = typeof options.hash.hideYFM !== 'undefined' ? options.hash.hideYFM : true;
            render = typeof options.hash.render !== 'undefined' ? options.hash.render : true;
            fixNewline = typeof options.hash.fixNewline !== 'undefined' ? options.hash.fixNewline : true;
            escape = typeof options.hash.escape !== 'undefined' ? options.hash.escape : false;
            indent = options.hash.indent || 0;
            more = typeof options.hash.more !== 'undefined' ? options.hash.more : true;

            if (typeof Handlebars.partials[fileWithPath] !== 'undefined') {
                template = Handlebars.partials[fileWithPath];
            } else {
                if (!fs.existsSync(fileWithPath)) {
                    if (typeof this.page !== 'undefined' && this.page.src) {
                        src = this.page.src;
                    } else if (typeof context.page !== 'undefined' && context.page.src) {
                        src = context.page.src;
                    }

                    if (src) {
                        fileWithPath = src.substr(0, src.lastIndexOf('/')) + '/' + file;
                    }

                    if (!fs.existsSync(fileWithPath)) {
                        fileWithPath = stache.config.content + file;
                        if (!fs.existsSync(fileWithPath)) {
                            fileWithPath = '';
                        }
                    }
                }

                if (fileWithPath !== '') {
                    template = fs.readFileSync(fileWithPath).toString('utf8');
                }
            }

            // Allows for raw includes
            if (typeof template === 'string' && render) {

                // User has specifically asked for the show more functionality
                // This must happen prior to compilation below
                moreIndex = template.indexOf('<!-- more -->');
                if (!more && moreIndex > -1) {
                    template = template.substr(0, moreIndex) + '{{ include stache.config.partial_blog_more }}';
                }

                r = Handlebars.compile(template)(c);
            } else if (!render) {
                r = template;
            }

            // Many text editors add a trailing newline when saving a source file.  Strip it if it's there.
            if (r.charAt(r.length - 1) === '\n') {
                r = r.substr(0, r.length - 1);
            }

            // I spent an entire day tracking down this bug.
            // Files created on different systems with different line endings freaked this out.
            if (fixNewline) {
                r = newline(r);
            }

            // Hide YAML Front Matter
            if (hideYFM && (r.match(/---/g) || []).length > 1) {
                start = r.indexOf('---') + 1;
                end = r.indexOf('---', start);
                r = r.substr(end + 3);
            }

            if (indent > 0) {
                indentString = new Array(indent + 1).join(' ');
                r = indentString + r.replace(/\n/g, '\n' + indentString);
            }

            if (escape) {
                r = r
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }

            return new Handlebars.SafeString(r);
        },

        /**
        * Supports object + arrays
        **/
        length: function (collection) {
            var length,
                prop;

            if (collection && collection.length) {
                return collection.length;
            }

            length = 0;
            for (prop in collection) {
                if (collection.hasOwnProperty(prop)) {
                    length++;
                }
            }
            return length;
        },

        /**
        * Total all coverage from instanbul report
        **/
        withCoverageTotal: function (collection, property, options) {

            var file,
                r = {
                    total: 0,
                    covered: 0,
                    skipped: 0,
                    pct: 0
                };

            for (file in collection) {
                if (collection[file].hasOwnProperty(property)) {
                    r.total += parseInt(collection[file][property].total);
                    r.covered += parseInt(collection[file][property].covered);
                    r.skipped += parseInt(collection[file][property].skipped);
                }
            }

            if (r.total > 0) {
                r.pct = (r.covered / r.total) * 100;
            }

            if (r.pct < 50) {
                r.cssClass = 'danger';
            } else if (r.pct < 80) {
                r.cssClass = 'warning';
            } else {
                r.cssClass = 'success';
            }

            if (options.hash.fixed && r.pct !== 100) {
                r.pct = toFixed(r.pct, options.hash.fixed);
            }

            return options.fn(r, options);
        },

        /**
        * I don't believe this works
        **/
        raw: function (options) {
            return '<raw>' + options.fn(this) + '</raw>';
        },

        /**
        *
        **/
        withFirstProperty: function (collection, options) {
            var property;
            for (property in collection) {
                if (collection.hasOwnProperty(property)) {
                    return options.fn(collection[property]);
                }
            }
        },

        /**
        *
        **/
        percent: function (dividend, divisor, options) {
            var r = 0;
            if (dividend === divisor) {
                r = 100;
            } else if (divisor !== 0) {
                r = Math.round(dividend / divisor);
            }
            return r.toFixed(options.hash.toFixed || 0);
        },

        /**
        * Many functions of the site, including grunt-yeomin fails on windows line endings.
        * This helpers replaces those.
        **/
        newline: function (text) {
            return newline(text);
        },

        /**
        * Same as newline method but wraps context
        **/
        withNewline: function (options) {
            return newline(options.fn(this));
        },

        /**
        * Block helper to emulate the following logic:
        * If Globally true then
        *   Unless locally false (blank is true)
        *     TRUE
        * Else if globally false then
        *   If locally true then
        *     TRUE
        **/
        inherit: function (global, local, options) {
            return (utils.mergeOption(global, local)) ? options.fn(this) : options.inverse(this);
        },

        /**
        * Consistently generate the edit link for a file in GitHub
        **/
        editInGitHubLink: function (options) {
            var src = options.hash.src || (typeof this.page !== 'undefined' ? this.page.src : '');
            return [
                stache.config.github_protocol,
                stache.config.github_base,
                '/',
                stache.config.github_org,
                '/',
                stache.config.github_repo,
                '/blob/',
                stache.config.github_branch,
                '/',
                src
            ].join('');
        },

        /**
        * Consistently generate the edit link for a file in Prose
        **/
        editInProseLink: function (options) {
            var src = options.hash.src || (typeof this.page !== 'undefined' ? this.page.src : '');
            return [
                stache.config.prose_base,
                '/#',
                stache.config.github_org,
                '/',
                stache.config.github_repo,
                '/edit/',
                stache.config.github_branch,
                '/',
                src
            ].join('');
        },

        /**
        * Consistently generate the trigger link for a site rebuild
        **/
        triggerSiteRebuildLink: function () {
            return [
                stache.config.kudu_protocol,
                stache.config.kudu_repo,
                stache.config.kudu_suffix
            ].join('');
        },

        /**
        * Consistently generate the GitHub repo link (for site rebuild)
        **/
        gitSourceLink: function () {
            return [
                stache.config.github_protocol,
                stache.config.github_token,
                '@',
                stache.config.github_base,
                '/',
                stache.config.github_org,
                '/',
                stache.config.github_repo,
                '.git'
            ].join('');
        },

        /**
        * Allows context against specific item in object
        **/
        withItem: function (object, options) {
            return typeof object[options.hash.key] !== 'undefined' ? options.fn(object[options.hash.key]) : '';
        },

        /**
        * Removes the extension from a filename
        **/
        removeExt: function (filename) {
            var dot = filename.lastIndexOf('.');
            return dot > -1 ? filename.substr(0, dot) : filename;
        },

        /**
        * Is the item an array or object?
        **/
        isArray: function (item, options) {
            return Handlebars.Utils.isArray(item) ? options.fn(this) : options.inverse(this);
        },

        /**
        * Helper for converting Sandcastle types to Prism types
        **/
        getPrismType: function (type) {
            var r = type;
            switch (type.toUpperCase()) {
            case 'C#':
            case 'VB':
                r = 'csharp';
                break;
            case 'C++':
                r = 'cpp';
                break;
            }
            return r;
        },

        /**
        * Used instead of us having to pass the nav_links object around in the context.
        **/
        withNavLinks: function (options) {
            return Handlebars.helpers.eachWithMod(utils.getNavLinks(options), options);
        },

        /**
        * If the user specified a maximum parent depth, make sure this is within in.
        * This is still a WIP.
        **/
        withinParentDepth: function (options) {
            var a = options.hash.sidebarCurrentDepth || -1,
                b = options.hash.sidebarParentDepth || -1;

            if (a === -1 || b === -1) {
                return options.fn(this);
            } else {
                return options.fn(this);
            }
        },

        /**
        * Normalizes Sandcastle URL
        **/
        normalizeSandcastleUrl: function (url) {
            var u = url || '';

            return u.indexOf('://') > -1 ? u : ('../' + u
                .replace('.htm', '/')
                .replace('html/', ''));
        },

        /**
        * Creates a url "slug" based on a string
        * This sucks, but needs to be the same implementation in stache.js
        **/
        slugify: function (title) {
            return title
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '');
        },

        /**
        * Last chance for us to modify the page's content at build-time.
        **/
        stachePostProcess: function (options) {
            var html = options.fn(this);
            if (stache.filters.postHandlebars && stache.filters.postHandlebars.length > 0) {
                stache.filters.postHandlebars.forEach(function (hook) {
                    html = hook(html);
                });
            }
            return html;
        },

        /**
        * Uglifys a block of JavaScript
        **/
        uglify: function (options) {
            return UglifyJS.minify(options.fn(this), {
                fromString: true
            }).code;
        },

        /**
        * Minify an HTML block
        **/
        minify: function (options) {
            return minify(options.fn(this), options.hash);
        }

    });

    module.exports.utils = utils;
};
