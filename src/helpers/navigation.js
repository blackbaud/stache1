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
            var loc = new Pattern(location, options);
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
     *
     * @param {} []
     * @param {} []
     */
    function Pattern(location, options) {
        var location,
            settings,
            templates;

        /**
         *
         * @param {} []
         */
        function pruneParents(navLinks, depth) {
            var counter,
                numTotalBreadcrumbs,
                temp,
                instance;

            counter = 0;
            temp = [];
            instance = getInstance();
            numTotalBreadcrumbs = instance.numTotalBreadcrumbs;

            if (depth === undefined) {
                depth = _params.assemble.options.stache.config.sidebar.numParents;
            }

            navLinks.forEach(function (navLink, i) {

                if (navLink.showInNav === false) {
                    delete navLinks[i];
                    return;
                }

                if (navLink.isActive) {

                    // It's a parent link.
                    if (navLink.nav_links) {

                        // The desired starting position has been found.
                        if (numTotalBreadcrumbs - depth <= navLink.breadcrumbPosition) {

                            navLink.nav_links.forEach(function (n, i) {

                                // Delete any items that shouldn't be included.
                                if (n.showInNav === false) {
                                    delete navLink.nav_links[i];
                                    return;
                                }

                                // Delete any child nav_links from siblings (let's not show those)
                                if (n.isActive === false && n.nav_links) {
                                    delete navLink.nav_links[i].nav_links;
                                }
                            });

                            temp = navLink.nav_links;

                            return;

                        } else {

                            temp = pruneParents(navLink.nav_links);

                            return;
                        }
                    }

                    // It has no children.
                    else {
                        temp = navLinks;
                    }
                }

                // Remove any children from un-active parents.
                else {
                    if (navLink.nav_links) {
                        delete navLinks[i].nav_links;
                    }
                }
            });

            if (temp === []) {
                temp = navLinks;
            }

            return temp;
        }

        this.anchors = [];

        location = location || "header";
        templates = {
            boxes: function () {
                var defaults,
                    navLinks;

                /**
                 *
                 * @param {} []
                 */
                function columnize(navLinks) {
                    var breakpoints,
                        maxColumnWidth;

                    maxColumnWidth = 12;
                    breakpoints = [
                        {
                            name: 'Phone',
                            width: settings.numColumnsPhone
                        },
                        {
                            name: 'Tablet',
                            width: settings.numColumnsTablet
                        },
                        {
                            name: 'Desktop',
                            width: settings.numColumnsDesktop
                        },
                        {
                            name: 'LargeDesktop',
                            width: settings.numColumnsLargeDesktop
                        }
                    ];

                    navLinks.forEach(function (navLink, i) {
                        breakpoints.forEach(function (breakpoint) {
                            var modulus = i % breakpoint.width;
                            navLink['columnWidth' + breakpoint.name] = maxColumnWidth / breakpoint.width;
                            if (modulus === 0) {
                                navLink['firstInRow' + breakpoint.name] = true;
                            }
                            if (modulus === breakpoint.width - 1) {
                                navLink['lastInRow' + breakpoint.name] = true;
                            }
                        });
                    });

                    return navLinks;
                }

                defaults = {
                    containerClass: 'showcase',
                    sameHeight: false,
                    numColumnsPhone: 1,
                    numColumnsTablet: 2,
                    numColumnsDesktop: 3,
                    numColumnsLargeDesktop: 4,
                };
                settings = merge(true, defaults, options);
                navLinks = getInstance().navLinks;
                navLinks = pruneParents(navLinks, 0);
                navLinks = columnize(navLinks);
                this.setAnchors(navLinks);
            },
            breadcrumbs: function () {
                var currentURI,
                    defaults,
                    instance,
                    items,
                    navLinks;

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

                defaults = {
                    homeLinkName: '',
                    homeLinkURI: ''
                }
                settings = merge(true, defaults, options);
                instance = getInstance();
                navLinks = instance.getNavLinks();
                currentURI = instance.currentURI;
                items = findBreadcrumb(navLinks, currentURI);

                // Add Home page.
                if (items !== false) {
                    items.unshift(new Anchor({
                        name: settings.homeLinkName,
                        uri: settings.homeLinkURI
                    }));
                }

                this.setAnchors(items);
            },
            footer: function () {
                var defaults,
                    navLinks;

                defaults = {};
                settings = merge(true, defaults, options);
                navLinks = getInstance().getNavLinks();
                navLinks = forAll(navLinks, function (navLink, i) {
                    if (navLink.showInFooter ===  false) {
                        this.omit();
                        return;
                    }
                    if (navLink.nav_links) {
                        this.omitChildren();
                        return;
                    }
                });
                this.setAnchors(navLinks);
            },
            header: function () {
                var defaults,
                    navDropdownDepth,
                    navLinks,
                    showNavDropdown;

                defaults = {
                    navDropdownDepth: 1,
                    showNavDropdown: true
                };
                settings = merge(true, defaults, options);
                navLinks = getInstance().getNavLinks();
                showNavDropdown = settings.showNavDropdown;
                navDropdownDepth = settings.navDropdownDepth;

                navLinks = forAll(navLinks, function (navLink, i) {

                    // Does this page want to be displayed in the header?
                    if (navLink.showInHeader === false) {
                        this.omit();
                        return;
                    }

                    // Add the special sky active class to links.
                    if (navLink.isActive || navLink.isCurrent) {
                        if (navLink.class && typeof navLink.class.pop === "function") {
                            navLink.class.push('bb-navbar-active');
                        } else {
                            navLink.class += ' bb-navbar-active';
                        }
                    }

                    // Only display a certain number of dropdown levels.
                    if (navLink.nav_links) {
                        if (this.getLevel() < navDropdownDepth) {

                            navLink.showChildNav = showNavDropdown;

                            if (showNavDropdown === true) {
                                navLink.name += '<i class="caret"></i>';
                                navLink.hasDropdown = true;
                            }

                        } else {
                            this.omitChildren();
                        }
                    }

                    navLink = new Anchor(navLink);
                });

                this.setAnchors(navLinks);
            },
            sidebar: function () {
                var defaults,
                    navLinks;

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
                function addHeadings(navLinks) {

                    // 1) Get the active page's HTML
                    // 2) For each heading found, add it as a separate navLink

                    forAll(navLinks, function (navLink, i) {
                        var temp = [];

                        if (navLink.isCurrent) {

                            // The current page contains sub-directories; it can't use headings.
                            if (navLink.isParent === false) {

                                // Build the current page's HTML from Markdown.
                                var template = Handlebars.compile(settings.pageMarkdown);
                                var buffer = template(_params.assemble.options);
                                var html = engine.getCached(buffer);

                                // Find all of the headings.
                                $(settings.headingSelector, html).each(function () {
                                    var el = $(this);
                                    temp.push(new Anchor({
                                        name: el.text(),
                                        uri: '#' + el.attr('id'),
                                        showInNav: true,
                                        isDraft: el.parent().hasClass('draft'),
                                        isSmoothScroll: settings.isSmoothScroll,
                                        isHeading: true
                                    }));
                                });

                                navLink.nav_links = temp;
                            }
                        }
                    });
                }

                /**
                 *
                 * @param {} []
                 */
                function sortNavLinks(navLinks) {
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
                        navLinks = navLinks.sort(function (a, b) {
                            return a[sortBy] > b[sortBy] ? sortA : (a[sortBy] < b[sortBy] ? sortB : 0);
                        });
                    }
                }

                defaults = {
                    headingSelector: 'h2',
                    isSmoothScroll: true,
                    limit: -1,
                    numParents: 0,
                    pageMarkdown: '',
                    sortBy: '',
                    sortOrder: 'asc'
                };
                settings = merge(true, defaults, options);
                navLinks = getInstance().navLinks;
                addHeadings(navLinks);
                navLinks = pruneParents(navLinks, settings.numParents);
                sortNavLinks(navLinks);
                addBackToTop(navLinks);
                this.setAnchors(navLinks);
            }
        };

        // Instantiate a Location.
        templates[location].call(this);

        return this;
    }
    Pattern.prototype = {

        /**
         *
         */
        getAnchors: function () {
            return (this.anchors.length) ? this.anchors : false;
        },

        /**
         *
         * @param {} []
         */
        setAnchors: function (val) {
            this.anchors = val;
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
    function forAll(arr, callback) {
        var level,
            temp,
            tempIndex;

        level = 0;
        temp = [];
        tempIndex = 0;

        arr.forEach(function (item, i) {
            var allowChildren = true;
            var omitted = false;
            var key;
            var tempItem = {};

            // Let the callback do stuff with this item.
            callback.apply({
                getLevel: function () {
                    return level;
                },
                navLink: arr[i],
                omit: function () {
                    omitted = true;
                },
                omitChildren: function () {
                    allowChildren = false;
                }
            }, [item, i]);


            // The callback doesn't want this one included.
            if (omitted) {
                return;
            }

            // Should we continue into a child array?
            if (allowChildren) {

                // Include this item.
                temp.push(item);

                for (key in item) {
                    if (item[key] && item[key].pop && item[key].push) {
                        level++;
                        temp[tempIndex][key] = forAll(item[key], callback);
                    }
                }
            } else {
                for (key in item) {
                    if (item[key] && item[key].pop === undefined || item[key].push === undefined) {
                        tempItem[key] = item[key];
                    }
                }
                temp.push(tempItem);
            }

            // Increase the temp array's index so we can use it recursively.
            tempIndex++;

        });

        return temp;
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