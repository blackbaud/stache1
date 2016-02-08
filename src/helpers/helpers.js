/*jslint node: true, nomen: true, plusplus: true */
module.exports.register = function (Handlebars, options, params) {
    'use strict';

    var bypassContext,
        cheerio,
        counts,
        engine,
        fs,
        helpers,
        merge,
        minify,
        navigation,
        navLinks,
        slog,
        stache,
        UglifyJS,
        utils;

    bypassContext = params.assemble.options.getBypassContext();
    stache = params.assemble.options.stache;
    counts = {};

    merge = require('merge');
    cheerio = require('cheerio');
    fs = require('fs');
    minify = require('html-minifier').minify;
    UglifyJS = require('uglify-js');
    navigation = require(__dirname + '/navigation');
    engine = require(__dirname + '/engine')();
    slog = require(__dirname + '/log')(params.assemble.grunt);

    helpers = {

        /**
         * Return the current count for the required property
         */
        count: function (prop) {
            if (typeof counts[prop] === 'undefined') {
                counts[prop] = 0;
            }
            return counts[prop];
        },

        /**
         * If settings say to render, wrap content in div
         *
         * @param {object} [options] Handlebars' options hash.
         */
        draft: function (options) {
            return stache.config.draft ? ('<div class="draft">\r\n\r\n' + engine.getCached(options.fn(this)) + '\r\n\r\n</div>') : '';
        },

        /**
         * Consistently generate the edit link for a file in GitHub
         *
         * @param {object} [options] Handlebars' options hash.
         */
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
         *
         * @param {object} [options] Handlebars' options hash.
         */
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
         * Returns the preferred value of a YAML option (either root or page).
         *
         * @param {object} [options] Handlebars' options hash.
         */
        extendRootOptions: function (options) {
            var config,
                i,
                frontMatterVariables,
                key,
                keysLength;

            config = stache.config;

            // This list should include page-specific variables only.
            frontMatterVariables = [
                'markdown',
                'patternBreadcrumbs',
                'patternDropdowns',
                'patternShowcase',
                'patternSidebar',
                'patternStack',
                'showBreadcrumbs',
                'showInFooter',
                'showInHeader'
            ];

            keysLength = frontMatterVariables.length;

            for (i = 0; i < keysLength; ++i) {
                key = frontMatterVariables[i];
                this[key] = utils.mergeOption(config[key], this[key]);
            }

            return options.fn(this);
        },

        /**
         * Get an operation from data.operations.
         * @param {string} [property] - Returns a specific property of the operation.
         * @param {string} [name] - Search the list of operations on any property.
         * @example
         * {{# withOperation name="Address (Create)" }} {{ id }} {{/ withOperation }}
         * {{ getOperation name="Address (Create)" property="description" }}
         */
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
         *
         * @param {} []
         */
        getOperationUri: function (context) {
            var operation = Handlebars.helpers.getOperation(context);
            if (operation) {
                return operation.id.replace('/apis/', 'docs/services/');
            }
        },

        /**
         * Helper for converting Sandcastle types to Prism types
         */
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
         * Consistently generate the GitHub repo link (for site rebuild)
         */
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
         * Render a file.  Search path order: partial, absolute, relative, content folder
         *
         * @param {} []
         * @param {} []
         * @param {object} [options] Handlebars' options hash.
         */
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
                r = engine.newline(r);
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
         * Increment the count for the required property
         */
        increment: function (prop) {
            counts[prop] = typeof counts[prop] === 'undefined' ? 0 : (counts[prop] + 1);
        },

        /**
         * Block helper to emulate the following logic:
         * If Globally true then
         *   Unless locally false (blank is true)
         *     TRUE
         * Else if globally false then
         *   If locally true then
         *     TRUE
         */
        inherit: function (global, local, options) {
            return (utils.mergeOption(global, local)) ? options.fn(this) : options.inverse(this);
        },

        /**
         * Is the item an array or object?
         */
        isArray: function (item, options) {
            return Handlebars.Utils.isArray(item) ? options.fn(this) : options.inverse(this);
        },

        /**
         * Is the current page home
         *
         * @param {object} [options] Handlebars' options hash.
         */
        isHome: function (options) {
            var b = utils.basename(options.hash.dest || this.page.dest || 'NOT_HOME', true);
            return b === '' ? options.fn(this) : options.inverse(this);
        },

        /**
         * Debugging JSON content
         */
        json: function (context) {
            return JSON.stringify(context);
        },

        /**
         * Supports object + arrays
         */
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
         * Loop through a certain number of times.
         */
        loop: function (options) {
            var arr = new Array(options.hash.end);
            return Handlebars.helpers.each(arr, options);
        },

        /**
         * Overriding default markdown helper.
         * See notes within the engine module for more information.
         */
        markdown: engine.markdown,

        /**
         * Minify an HTML block
         *
         * @param {object} [options] Handlebars' options hash.
         */
        minify: function (options) {
            return minify(options.fn(this), options.hash);
        },

        /**
         * Many functions of the site, including grunt-yeomin fails on windows line endings.
         * This helpers replaces those.
         */
        newline: function (text) {
            return engine.newline(text);
        },

        /**
         * Normalizes Sandcastle URL
         */
        normalizeSandcastleUrl: function (url) {
            var u = url || '';

            return u.indexOf('://') > -1 ? u : ('../' + u
                .replace('.htm', '/')
                .replace('html/', ''));
        },

        /**
         *
         *
         * @param {} []
         * @param {} []
         * @param {object} [options] Handlebars' options hash.
         */
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
         *
         * @param {object} [options] Handlebars' options hash.
         */
        raw: function (options) {
            return '<raw>' + options.fn(this) + '</raw>';
        },

        /**
         * Removes the extension from a filename
         */
        removeExt: function (filename) {
            var dot = filename.lastIndexOf('.');
            return dot > -1 ? filename.substr(0, dot) : filename;
        },

        /**
         * Creates a url "slug" based on a string
         * This sucks, but needs to be the same implementation in stache.js
         */
        slugify: function (title) {
            return title
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '');
        },

        /**
         * Last chance for us to modify the page's content at build-time.
         *
         * @param {object} [options] Handlebars' options hash.
         */
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
         * Consistently generate the trigger link for a site rebuild
         */
        triggerSiteRebuildLink: function () {
            return [
                stache.config.kudu_protocol,
                stache.config.kudu_repo,
                stache.config.kudu_suffix
            ].join('');
        },

        /**
         * Uglifys a block of JavaScript
         *
         * @param {object} [options] Handlebars' options hash.
         */
        uglify: function (options) {
            return UglifyJS.minify(options.fn(this), {
                fromString: true
            }).code;
        },

        /**
         * Total all coverage from instanbul report
         *
         * @param {} []
         * @param {} []
         * @param {object} [options] Handlebars' options hash.
         */
        withCoverageTotal: function (collection, property, options) {
            var file,
                r;

            r  = {
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
                r.pct = utils.toFixed(r.pct, options.hash.fixed);
            }

            return options.fn(r, options);
        },

        /**
         *
         *
         * @param {} []
         * @param {object} [options] Handlebars' options hash.
         */
        withFirstProperty: function (collection, options) {
            var property;
            for (property in collection) {
                if (collection.hasOwnProperty(property)) {
                    return options.fn(collection[property]);
                }
            }
        },

        /**
         * Allows context against specific item in object
         *
         * @param {} []
         * @param {object} [options] Handlebars' options hash.
         */
        withItem: function (object, options) {
            return typeof object[options.hash.key] !== 'undefined' ? options.fn(object[options.hash.key]) : '';
        },

        /**
         *
         *
         * @param {object} [options] Handlebars' options hash.
         */
        withNav: function (options) {
            var context,
                currentUri,
                customData,
                navLinks,
                pattern,
                patternOptions,
                patternOptionsName;

            // No page information, quit.
            if (this.page === undefined) {
                return options.inverse(this);
            }

            context = {};
            currentUri = this.page.dirname.split(stache.status)[1] + "/";
            pattern = options.hash.pattern || 'custom';
            patternOptionsName = 'pattern' + pattern[0].toUpperCase() + pattern.substring(1);
            navLinks = utils.getNavLinks();

            // Merge pattern options.
            patternOptions = options.hash.patternOptions || {};
            patternOptions = merge(true, this[patternOptionsName] || {}, patternOptions);

            // Special setup for some patterns.
            switch (pattern) {
                case "sidebar":
                patternOptions.pageHtml = engine.getCached(Handlebars.compile(this.pages[this.page.index].page)(params.assemble.options));
                break;
            }

            // Allow custom data to override pattern options.
            customData = options.hash.customData || undefined;
            if (customData) {
                navLinks = (customData.items) ? customData.items : customData;
                if (customData.hasOwnProperty(patternOptionsName)) {
                    patternOptions = merge(true, patternOptions, customData[patternOptionsName]);
                }
                patternOptions.doPruneParents = false;
            }

            // Build the context.
            context = patternOptions;
            context.nav_links = navigation(navLinks).currentUri(currentUri).pattern(pattern, patternOptions).anchors();
            return (context.nav_links === false) ? options.inverse(context) : options.fn(context);
        },

        /**
         * Same as newline method but wraps context
         *
         * @param {object} [options] Handlebars' options hash.
         */
        withNewline: function (options) {
            return engine.newline(options.fn(this));
        },

        /**
         * Presents a context with the results returned from getOperation
         *
         * @param {array} [context.hash] - Optional key/value pairs to pass to @getOperation
         */
        withOperation: function (context) {
            return context.fn(Handlebars.helpers.getOperation(context));
        }

    };

    utils = {

        /**
         * Utility function to get the basename
         *
         * @param {} []
         * @param {} []
         */
        basename: function (path, clean) {
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
        },

        /**
         *
         *
         * @param {} []
         */
        clone: function (obj) {
            var cloned;
            try {
                cloned = JSON.parse(JSON.stringify(obj));
            } catch (e) {
                cloned = obj;
            }
            return cloned;
        },


        /**
         * Returns an array representing all pages, sorted.
         * The array also respects page hierarchies: child pages are stored in the respective
         * parent page's property, 'nav_links'.
         *
         * @param {object} [options] Handlebars' options hash.
         */
        getNavLinks: function (options) {
            if (typeof navLinks === "undefined") {
                navLinks = (options && options.hash && options.hash.nav_links) ? options.hash.nav_links : bypassContext.nav_links || [];
            }
            return utils.clone(navLinks);
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
            if (typeof global === "object") {
                merged = merge(true, global, local);
            } else if (typeof local === "undefined") {
                if (typeof global !== "undefined") {
                    merged = global;
                }
            } else {
                merged = local;
            }
            return merged;
        },

        /**
         * http://stackoverflow.com/questions/10015027/javascript-tofixed-not-rounding
         */
        toFixed: function (number, precision) {
            var multiplier = Math.pow(10, precision + 1),
                wholeNumber = Math.round(number * multiplier).toString(),
                length = wholeNumber.length - 1;
            wholeNumber = wholeNumber.substr(0, length);
            return [
                wholeNumber.substr(0, length - precision),
                wholeNumber.substr(-precision)
            ].join('.');
        }

    };

    Handlebars.registerHelper(helpers);

    // Deprecated stuff:
    utils = require(__dirname + '/deprecated')(Handlebars, utils, params);

    module.exports.utils = utils;
};
