(function () {
    "use strict";

    var $,
        getInstance,
        Handlebars,
        merge,
        _params,
        engine;

    $ = require('cheerio');
    merge = require('merge');
    engine = require('../../src/helpers/engine')();

    /**
     *
     * @param {} []
     */
    function Anchor(options) {
        var anchor,
            defaults;

        defaults = {
            childNavClass: 'nav',
            isActive: false,
            isClickable: true,
            isCurrent: false,
            isDraft: false,
            isHeading: false,
            isParent: false,
            isSmoothScroll: false,
            isVisibleOnAffix: false,
            showChildNav: true,
            showInFooter: true,
            showInHeader: true,
            showInNav: true
        };

        anchor = merge(true, defaults, options);
        return this.setClassesForNavLink(anchor);
    }

    Anchor.prototype = {
        setClassesForNavLink: function (navLink) {
            var classes;
            var addUnique = function (thing) {
                if (classes.indexOf(thing) === -1) {
                    classes.push(thing);
                }
            };

            if (navLink.class) {
                if (navLink.class.pop && navLink.class.push) {
                    classes = navLink.class;
                } else {
                    classes = navLink.class.split(" ");
                }
            } else {
                classes = [];
            }

            if (navLink.isActive) {
                addUnique("active");
            }

            if (navLink.isCurrent) {
                addUnique("current");
            }

            if (navLink.isDraft) {
                addUnique("draft");
            }

            if (navLink.isHeading) {
                addUnique("heading");
            }

            if (navLink.isVisibleOnAffix) {
                addUnique('visible-on-affix');
            }

            if (navLink.isSmoothScroll) {
                addUnique("smooth-scroll");
            }

            if (navLink.hasDropdown) {
                addUnique("dropdown");
                addUnique("dropdown-toggle");
                navLink.childNavClass = 'dropdown-menu';
            }

            navLink.class = classes.join(" ");

            return navLink;
        }
    };

    /**
     *
     * @param {} []
     * @param {} []
     */
    function Location(location, options) {
        var anchors,
            defaults,
            location,
            settings,
            templates;

        anchors = [];
        location = location || "header";
        templates = {
            breadcrumbs: function () {
                var defaults = {
                    homeLinkName: '',
                    homeLinkURI: ''
                }
                settings = merge(true, defaults, options);

                var instance,
                    items;

                instance = getInstance();
                var navLinks = instance.getNavLinks();
                var currentURI = instance.currentURI;

                /**
                 * Returns an object representing a page's properties, only if its URI is
                 * a fragment of the active page's URI. The method receives an array of objects,
                 * to be checked against the active URI.
                 *
                 * @param {array} [navLinks] Array of objects representing pages.
                 * @param {string} [currentURI] The path of the active page.
                 */
                function findBreadcrumb(navLinks, currentURI) {
                    var breadcrumbs;

                    breadcrumbs = [];

                    navLinks.forEach(function (navLink, i) {
                        // Don't include the Home page because it cannot have sub-directories.
                        // (We add the Home page manually, in getBreadcrumbNavLinks.)
                        if (navLink.uri !== "/") {

                            // Is this page's URI a fragment of the active page's URI?
                            if (currentURI.indexOf(navLink.uri) > -1) {

                                breadcrumbs.push(new Anchor({
                                    name: navLink.name,
                                    uri: navLink.uri
                                }));

                                // Does this page have sub-directories?
                                if (navLink.hasOwnProperty('nav_links')) {
                                    breadcrumbs = concatArray(breadcrumbs, findBreadcrumb(navLink.nav_links, currentURI));
                                }

                                return;
                            }
                        }
                    });

                    // Set the final navigation link as 'current' and return the array.
                    if (breadcrumbs.length > 0) {
                        breadcrumbs[breadcrumbs.length - 1].isCurrent = true;
                        breadcrumbs[breadcrumbs.length - 1].isClickable = false;
                        return breadcrumbs;
                    }

                    // The navigation links didn't contain a breadcrumb.
                    return false;
                }

                items = findBreadcrumb(navLinks, currentURI);

                // Add Home page.
                if (items !== false) {
                    items.unshift(new Anchor({
                        name: settings.homeLinkName,
                        uri: settings.homeLinkURI
                    }));
                }

                anchors = items;


            },
            footer: function () {
                var defaults = {};
                settings = merge(true, defaults, options);
                var navLinks = getInstance().getNavLinks();
                forAll(navLinks, function (navLink, level, i) {
                    navLink.showInNav = navLink.showInFooter;
                    if (navLink.nav_links) {
                        delete this[i].nav_links;
                    }
                });
                anchors = navLinks;
            },
            header: function () {
                var defaults = {
                    navDropdownDepth: 1,
                    showNavDropdown: true
                };
                settings = merge(true, defaults, options);

                var navLinks = getInstance().getNavLinks();
                var showNavDropdown = settings.showNavDropdown;
                var navDropdownDepth = settings.navDropdownDepth;

                forAll(navLinks, function (navLink, level, i) {

                    // Does this page want to be displayed in the header?
                    navLink.showInNav = navLink.showInHeader;

                    if (navLink.isActive || navLink.isCurrent) {
                        if (navLink.class && navLink.class.pop) {
                            navLink.class.push('bb-navbar-active');
                        } else {
                            this[i].class += ' bb-navbar-active';
                        }
                    }

                    // Only display a certain number of dropdown levels.
                    if (navLink.nav_links) {
                        if (level < navDropdownDepth) {

                            navLink.showChildNav = showNavDropdown;

                            if (showNavDropdown === true) {
                                navLink.name += '<i class="caret"></i>';
                                navLink.hasDropdown = true;
                            }

                        } else {
                            delete this[i].nav_links;
                        }
                    }

                    this[i] = new Anchor(navLink);

                });

                anchors = navLinks;
            },
            sidebar: function () {
                var defaults = {
                    headingSelector: 'h2',
                    isSmoothScroll: true,
                    limit: -1,
                    numParents: 0,
                    pageMarkdown: '',
                    sortBy: '',
                    sortOrder: 'asc'
                };
                settings = merge(true, defaults, options);

                var links = pruneParents(getInstance().navLinks);

                /**
                 *
                 * @param {} []
                 */
                function addBackToTop(navLinks) {
                    navLinks.push(new Anchor({
                        name: '<i class="fa fa-caret-square-o-up"></i>',
                        uri: '#top',
                        isSmoothScroll: settings.isSmoothScroll,
                        isVisibleOnAffix: true
                    }));
                }

                /**
                 *
                 */
                function addHeadings() {

                    // 1) Get the active page's HTML
                    // 2) For each heading found, add it as a separate navLink

                    var buffer,
                        html,
                        instance,
                        navLinks,
                        template;

                    instance = getInstance();

                    // The current page contains sub-directories; it can't use headings.
                    if (instance.currentNavLink.nav_links) {
                        return;
                    }

                    // Create an empty nav_links array to store the headings.
                    navLinks = instance.currentNavLink.nav_links = [];

                    // Build the current page's HTML from Markdown.
                    template = Handlebars.compile(instance.settings.pageMarkdown);
                    buffer = template(_params.assemble.options);
                    html = engine.getCached(buffer);

                    // Find all of the headings.
                    $(instance.settings.headingSelector, html).each(function () {
                        var el = $(this);
                        console.log("heading:", el.text());
                        navLinks.push(new Anchor({
                            name: el.text(),
                            uri: '#' + el.attr('id'),
                            showInNav: true,
                            isDraft: el.parent().hasClass('draft'),
                            isSmoothScroll: settings.isSmoothScroll,
                            isHeading: true
                        }));
                    });
                }

                /**
                 *
                 * @param {} []
                 */
                function pruneParents(navLinks) {
                    var counter,
                        depth,
                        numTotalBreadcrumbs,
                        temp,
                        instance;

                    counter = 0;
                    temp = [];
                    instance = getInstance();
                    depth = settings.numParents;
                    numTotalBreadcrumbs = instance.numTotalBreadcrumbs;

                    navLinks.forEach(function (navLink, i) {
                        if (navLink.isActive) {

                            //console.log("Checking " + navLink.name + "...", "Active state: " + navLink.isActive + ".",  "Only show " + depth + " parent(s) above active.", "This link's position is " + navLink.breadcrumbPosition + ".", "Total number of breadcrumb positions: " + numTotalBreadcrumbs + ".", "We're looking for position: " + (numTotalBreadcrumbs - depth));

                            // It's a parent link.
                            if (navLink.nav_links) {

                                // The desired starting position has been found.
                                if (numTotalBreadcrumbs - depth <= navLink.breadcrumbPosition) {

                                    //console.log("The " + navLink.name + " page is what we want...");

                                    // Delete any child nav_links from siblings (let's not show those)
                                    navLink.nav_links.forEach(function (n, i) {
                                        if (n.isActive === false && n.nav_links) {
                                            delete navLink.nav_links[i].nav_links;
                                        }
                                    });

                                    temp = navLink.nav_links;
                                    return
                                } else {
                                    temp = pruneParents(navLink.nav_links);
                                    return;
                                }
                            }

                            // It has no children.
                            else {
                                //console.log("The page " + navLink.name + " doesn't have any children.");
                                temp = navLinks;
                            }
                        }

                        // Remove any children from un-active parents.
                        else {
                            if (navLink.nav_links) {
                                //console.log("DELETING NAVLINKS for ", navLink.name);
                                delete navLinks[i].nav_links;
                            }
                        }
                    });

                    if (temp === []) {
                        temp = navLinks;
                    }

                    return temp;
                }

                /**
                 *
                 * @param {} []
                 */
                function sortNavLinks(links) {
                    var instance,
                        sortA = 1,
                        sortB = -1,
                        sortBy,
                        sortOrder;

                    instance = getInstance();
                    sortBy = settings.sortBy;
                    sortOrder = settings.sortOrder.toLowerCase();

                    if (sortBy !== '') {
                        if (sortOrder === 'desc') {
                            sortA = -1;
                            sortB = 1;
                        }
                        links = links.sort(function (a, b) {
                            return a[sortBy] > b[sortBy] ? sortA : (a[sortBy] < b[sortBy] ? sortB : 0);
                        });
                    }
                }

                addHeadings();
                sortNavLinks(links);
                addBackToTop(links);
                anchors = links;
            }
        };

        templates[location].call(this);

        return {
            getAnchors: function () {
                return (anchors.length) ? anchors : false;
            }
        };
    }

    /**
     *
     * @param {} []
     * @param {} []
     */
    function Navigation(currentURI, options) {
        this.currentURI = currentURI || '';
        this.defaults = {
            headingSelector: 'h2',
            homeLinkName: '',
            homeLinkURI: '',
            isSmoothScroll: true,
            limit: -1,
            location: "header",
            navDropdownDepth: 1,
            numParents: 0,
            pageMarkdown: '',
            showNavDropdown: true,
            sortOrder: null,
            sortBy: null
        };
        this.breadcrumbPosition = 0;
        this.numTotalBreadcrumbs = 0;
        this.currentNavLink = {};

        var instance = this;

        // Expose the instantiated object.
        getInstance = function () {
            return instance;
        };

        // Merge settings.
        instance.settings = merge.recursive(true, this.defaults, options || {});
    }

    Navigation.prototype = {

        /**
         *
         */
        getNavLinks: function () {
            return this.navLinks;
        },

        /**
         *
         * @param {} []
         * @param {} []
         */
        getAnchorsFor: function (location, options) {
            var loc = new Location(location, options);
            return loc.getAnchors();
        },

        /**
         *
         * @param {} []
         */
        setCurrentURI: function (uri) {
            this.currentURI = uri;
            prepareNavLinksForCurrentPage(this.navLinks);
        },

        /**
         *
         * @param {} []
         */
        setNavLinks: function (arr) {
            this.navLinks = arr;
            prepareNavLinksForCurrentPage(this.navLinks);
        }
    };

    /**
     * Returns a single array, the second appended to the first.
     *
     * @param {array} [arr1] The array to be extended.
     * @param {array} [arr2] The array to be appended to the first.
     */
    function concatArray(arr1, arr2) {
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
    }

    /**
     *
     * @param {} []
     * @param {} []
     */
    function forAll(things, callback) {

        var level = 0;

        var cycle = function (things, callback) {
            things.forEach(function (thing, x) {
                callback.call(things, thing, level, x);
                for (var a in thing) {
                    if (Object.prototype.toString.call(thing[a]) === '[object Array]') {
                        level++;
                        cycle.call(things, things[x][a], callback);
                    }
                }
            });
            level = 0;
            return things;
        }

        return cycle.call(things, things, callback);
    }

    /**
     *
     * @param {} []
     */
    function prepareNavLinksForCurrentPage(navLinks) {
        var currentURI,
            instance;

        instance = getInstance();
        currentURI = instance.currentURI;

        navLinks.forEach(function (navLink, i) {
            var isActive = false;

            // Active page.
            // (This page's URI is a fragment of the active page's URI.)
            if (currentURI.indexOf(navLink.uri) > -1) {

                // Ignore the home page, for now.
                if (navLink.uri !== "/") {
                    isActive = true;
                    navLink.isActive = true;
                    instance.breadcrumbPosition++;
                    navLink.breadcrumbPosition = instance.breadcrumbPosition;
                }

                // Current page.
                if (currentURI === navLink.uri) {
                    navLink.isCurrent = true;
                    instance.numTotalBreadcrumbs = instance.breadcrumbPosition;
                    instance.currentNavLink = navLink;

                    // Make sure the number of children doesn't exceed our limit.
                    if (navLink.nav_links && instance.settings.limit > -1) {
                        navLink.nav_links.forEach(function (n, k) {
                            if (k >= instance.settings.limit) {
                                delete navLink.nav_links[k];
                            }
                        });
                    }
                }
            }

            // Progress to the next level down.
            if (navLink.nav_links) {
                navLink.isParent = true;
                prepareNavLinksForCurrentPage(navLink.nav_links);
            }

            // Update the class property.
            navLinks[i] = new Anchor(navLink);
        });
    }

    // Return the class with the exports.
    module.exports = function (handlebars, params) {
        Handlebars = handlebars;
        _params = params;
        return Navigation;
    };

}());