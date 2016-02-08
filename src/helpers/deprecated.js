module.exports = function (Handlebars, utilities, params) {
    "use strict";

    var cheerio,
        engine,
        helpers,
        merge,
        slog,
        stache,
        utils;

    cheerio = require('cheerio');
    engine = require(__dirname + '/engine')();
    slog = require(__dirname + '/log')();
    merge = require('merge');
    stache = params.assemble.options.stache;

    helpers = {

        /**
         * ------------------
         * (!) DEPRECATED (!)
         * ------------------
         *
         * Finds the current page in the nav and iterates its child links
         * Supports optional modulus parameters.
         *
         * @param {object} [options] Handlebars' options hash.
         */
        eachChildLink: function (options) {
            slog.warning("[" + this.page.name + "] Using deprecated helper: eachChildLink");
            var dest = '',
                nav_links = '',
                active;

            if (typeof options.hash.dest !== 'undefined') {
                dest = options.hash.dest;
            } else if (typeof this.page !== 'undefined' && typeof this.page.dest !== 'undefined') {
                dest = this.page.dest;
            }

            nav_links = utils.getNavLinks(options);
            active = utils.getActiveNav(dest, nav_links, false);

            if (active && active.nav_links) {
                active = active.nav_links;
            }

            return Handlebars.helpers.eachWithMod(active, options);
        },

        /**
         * ------------------
         * (!) DEPRECATED (!)
         * ------------------
         *
         * This innocuous looking helper took quite a long time to figure out.
         * It takes the current pages entire RAW source, crompiles it, and loads it in cheerio (jQuery).
         * Then it parses for the relevant headers and executes the template for each one.
         *
         * @param {object} [options] Handlebars' options hash.
         */
        eachHeading: function (options) {
            slog.warning("Using deprecated helper: eachHeading");
            var html = engine.getCached(Handlebars.compile(options.hash.page || '')(params.assemble.options)),
                r = '';

            cheerio(options.hash.selector || 'h2', html).each(function () {
                var el = cheerio(this);
                r = r + options.fn({
                    name: el.text(),
                    id: el.attr('id'),
                    isDraft: el.parent().hasClass('draft')
                });
            });

            return r;
        },

        /**
         * ------------------
         * (!) DEPRECATED (!)
         * ------------------
         *
         *
         * @param {} []
         * @param {object} [options] Handlebars' options hash.
         */
        eachWithMod: function (context, options) {
            if (this.page) {
                slog.warning("[" + this.page.name + "] Using deprecated helper: eachWithMod");
                slog.muted("Consider using: withNav");
            }

            var r = '',
                slim = [],
                counter = 0,
                h,
                i = 0,
                m = 0,
                mod = options.hash.mod || 0,
                limit = options.hash.limit || -1,
                layout = options.hash.layout || 'horizontal',
                sortKey = options.hash.sortKey || '',
                sortDesc = typeof options.hash.sortDesc !== 'undefined' ? options.hash.sortDesc : false,
                sortA = 1,
                sortB = -1,
                j,
                show;

            if (context && context.length) {

                // Sort differently if Needed
                if (sortKey !== '') {
                    if (sortDesc) {
                        sortA = -1;
                        sortB = 1;
                    }
                    context = context.sort(function (a, b) {
                        return a[sortKey] > b[sortKey] ? sortA : (a[sortKey] < b[sortKey] ? sortB : 0);
                    });
                }



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
                                if (h !== "nav_links") {
                                    context[i][h] = options.hash[h];
                                }
                            }
                        }
                        slim.push(context[i]);
                        counter++;
                    }
                }

                // Organize vertically
                if (layout === 'vertical' && mod > 0) {
                    slim = utils.forVertical(slim, mod);
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
         * ------------------
         * (!) DEPRECATED (!)
         * ------------------
         *
         * Does the current page have headings?
         *
         * @param {object} [options] Handlebars' options hash.
         */
        hasHeadings: function (options) {
            slog.warning("Using deprecated helper: hasHeadings");
            return Handlebars.helpers.eachHeading(options) !== '' ? options.fn(this) : options.inverse(this);
        },

        /**
         * ------------------
         * (!) DEPRECATED (!)
         * ------------------
         *
         * Compares "uri" in the current context (or the first parameter) to the current URL
         * http://assemble.io/docs/FAQ.html
         *
         * @param {object} [options] Handlebars' options hash.
         */
        isActiveNav: function (options) {
            slog.warning("Using deprecated helper: isActiveNav");
            var r = utils.isActiveNav(options.hash.dest || this.dest || '', options.hash.uri || this.uri || '', typeof options.hash.parentCanBeActive !== 'undefined' ? options.hash.parentCanBeActive : true);
            return r ? options.fn(this) : options.inverse(this);
        },

        /**
         * ------------------
         * (!) DEPRECATED (!)
         * ------------------
         *
         * Adds breadcrumb nav_links to the scope.
         *
         * @param {object} [options] Handlebars' options hash.
         */
        withBreadcrumbs: function (options) {
            slog.warning("Using deprecated helper: withBreadcrumbs", "Consider using: \n{{# withNav pattern=\"breadcrumbs\" }}\n  {{ include 'partial-nav' class=\"breadcrumb\" }}\n{{/ withNav }}");
            options.hash.pattern = "breadcrumbs";
            return helpers.withNav.call(this, options);
        },

        /**
         * ------------------
         * (!) DEPRECATED (!)
         * ------------------
         *
         * Used instead of us having to pass the nav_links object around in the context.
         *
         * @param {object} [options] Handlebars' options hash.
         */
        withNavLinks: function (options) {
            slog.warning("Using deprecated helper: withNavLinks");
            return Handlebars.helpers.eachWithMod(utils.getNavLinks(options), options);
        },

        /**
         * ------------------
         * (!) DEPRECATED (!)
         * ------------------
         *
         * If the user specified a maximum parent depth, make sure this is within in.
         * This is still a WIP.
         *
         * @param {object} [options] Handlebars' options hash.
         */
        withinParentDepth: function (options) {
            slog.warning("Using deprecated helper: withinParentDepth");
            var a = options.hash.sidebarCurrentDepth || -1,
                b = options.hash.sidebarParentDepth || -1;

            if (a === -1 || b === -1) {
                return options.fn(this);
            } else {
                return options.fn(this);
            }
        }
    };

    utils = {

        /**
         * ------------------
         * (!) DEPRECATED (!)
         * ------------------
         *
         * Returns a single array, the second appended to the first.
         *
         * @param {array} [arr1] The array to be extended.
         * @param {array} [arr2] The array to be appended to the first.
         */
        concatArray: function (arr1, arr2) {
            slog.warning("Using deprecated utility: concatArray");
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
         * ------------------
         * (!) DEPRECATED (!)
         * ------------------
         *
         * Returns an object representing a page's properties, only if its URI is
         * a fragment of the active page's URI. The method receives an array of objects,
         * to be checked against the active URI.
         *
         * @param {array} [navLinks] Array of objects representing pages.
         * @param {string} [activeURI] The path of the active page.
         */
        findBreadcrumb: function (navLinks, activeURI) {
            slog.warning("Using deprecated utility: findBreadcrumb");
            var breadcrumbs,
                i,
                navLink,
                navLinksLength;

            breadcrumbs = [];
            navLinksLength = navLinks.length;

            for (i = 0; i < navLinksLength; ++i) {

                navLink = navLinks[i];

                // Don't include the Home page because it cannot have sub-directories.
                // (We add the Home page manually, in getBreadcrumbNavLinks.)
                if (navLink.uri !== "/") {

                    // Is this page's URI a fragment of the active page's URI?
                    if (activeURI.indexOf(navLink.uri) > -1) {
                        breadcrumbs.push({
                            name: navLink.name,
                            uri: navLink.uri,
                            showInNav: true
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
         * Function for arranging an array for vertical display.
         *
         * @param {} []
         * @param {} []
         */
        forVertical: function (arr, cols) {
            slog.warning("Using deprecated utility: forVertical");
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
        },

        /**
         * ------------------
         * (!) DEPRECATED (!)
         * ------------------
         *
         * Recursively searches the nav array to find the active link
         */
        getActiveNav: function (dest, nav_links, parentCanBeActive) {
            slog.warning("Using deprecated utility: getActiveNav");
            var j = nav_links.length,
                i = 0,
                r = '';

            for (i; i < j; i++) {
                if (utils.isActiveNav(dest, nav_links[i].uri, parentCanBeActive)) {
                    r = nav_links[i];
                } else if (nav_links[i].nav_links) {
                    r = utils.getActiveNav(dest, nav_links[i].nav_links, parentCanBeActive);
                }
                if (r !== '') {
                    break;
                }
            }

            return r;
        },

        /**
         * ------------------
         * (!) DEPRECATED (!)
         * ------------------
         *
         * Returns an array representing all breadcrumb nav_links for a given page.
         *
         * @param {object} [options] Handlebars' options hash.
         */
        getBreadcrumbNavLinks: function (navLinks, activeURI) {
            slog.warning("Using deprecated utility: getBreadcrumbNavLinks");
            var config,
                items;

            config = (typeof stache !== "undefined") ? stache.config : {};
            items = utils.findBreadcrumb(navLinks, activeURI);

            // Add Home page.
            if (items !== false) {
                items.unshift({
                    name: config.nav_title_home || 'Home',
                    uri: config.base || '/',
                    showInNav: true
                });
            }

            return items;
        },

        /**
         * ------------------
         * (!) DEPRECATED (!)
         * ------------------
         *
         * Determines if two URI's are the same.
         * Supports thinking parent uri's are active.
         * Wrapping the basenames in '/' prevents false matches, ie docs vs docs2 vs 2docs.
         */
        isActiveNav: function (dest, uri, parentCanBeActive) {
            slog.warning("Using deprecated utility: isActiveNav");
            dest = '/' + utils.basename(dest) + '/';
            uri = '/' + utils.basename(uri) + '/';
            return (parentCanBeActive && uri !== '') ? dest.indexOf(uri) > -1 : uri === dest;
        }
    };

    Handlebars.registerHelper(helpers);
    utils = merge(true, utils, utilities);
    return utils;
};