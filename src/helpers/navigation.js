(function () {
    "use strict";

    var $,
        getNavigation,
        merge,
        engine;


    $ = require('cheerio');
    merge = require('merge');
    engine = require('../../src/helpers/engine')();




    /**
     *
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

        /**
         *
         *
         * @param {} []
         */
        setClassesForNavLink: function (navLink) {
            var classes;

            function addUnique(thing) {
                if (classes.indexOf(thing) === -1) {
                    classes.push(thing);
                }
            }

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
     *
     * @param {} []
     * @param {} []
     */
    function Navigation(currentUri, options) {
        var instance;

        instance = this;
        instance.currentUri = currentUri || '';
        instance.defaults = {};
        instance.breadcrumbPosition = 0;
        instance.numTotalBreadcrumbs = 0;

        // Expose the instantiated object.
        getNavigation = function () {
            return instance;
        };

        // Merge settings.
        instance.settings = merge.recursive(true, instance.defaults, options || {});
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
        pattern: function (pattern, options) {
            var obj;

            // Share the limit option with the nav object.
            this.settings.limit = options.limit || -1;

            // Update the nav links array to represent the current URI.
            this.prepareNavLinksForCurrentUri(this.getNavLinks());

            // Generate the new nav links array for a specific pattern.
            obj = new Pattern(pattern, options);
            this.setNavLinks(obj.getAnchors());

            return this;
        },

        /**
         *
         * @param {} []
         */
        prepareNavLinksForCurrentUri: function (navLinks) {
            var currentUri,
                navigation;

            navigation = this;
            currentUri = navigation.currentUri;

            if (navLinks) {
                navLinks.forEach(function (navLink, i) {
                    var isActive = false;

                    // Active page.
                    // (This page's URI is a fragment of the active page's URI.)
                    if (currentUri.indexOf(navLink.uri) > -1) {

                        // Ignore the home page, for now.
                        if (navLink.uri !== "/") {
                            isActive = true;
                            navLink.isActive = true;
                            navigation.breadcrumbPosition++;
                            navLink.breadcrumbPosition = navigation.breadcrumbPosition;
                        }

                        // Current page.
                        if (currentUri === navLink.uri) {
                            navLink.isCurrent = true;
                            navigation.numTotalBreadcrumbs = navigation.breadcrumbPosition;

                            // Make sure the number of children doesn't exceed our limit.
                            if (navLink.nav_links && navigation.settings.limit > -1) {
                                navLink.nav_links.forEach(function (n, index) {
                                    if (index >= navigation.settings.limit) {
                                        delete navLink.nav_links[index];
                                    }
                                });
                            }
                        }
                    }

                    // Progress to the next level down.
                    if (navLink.nav_links) {
                        navLink.isParent = true;
                        navigation.prepareNavLinksForCurrentUri(navLink.nav_links);
                    }

                    // Update the class property.
                    navLinks[i] = new Anchor(navLink);
                });
            }
        },

        /**
         *
         * @param {} []
         */
        setCurrentUri: function (uri) {
            this.currentUri = uri;
            return this;
        },

        /**
         *
         * @param {} []
         */
        setNavLinks: function (arr) {
            this.navLinks = arr;
            return this;
        },

        /**
         *
         */
        update: function () {
            this.prepareNavLinksForCurrentUri(this.navLinks);
            return this;
        }
    };




    /**
     *
     * @param {} []
     * @param {} []
     */
    function Pattern(pattern, options) {
        var settings,
            templates;

        pattern = pattern || "header";

        /**
         *
         * @param {} []
         */
        function cleanArray(arr) {
            for (var i = 0; i < arr.length; ++i) {
                if (arr[i] === undefined) {
                    arr.splice(i, 1);
                    i--;
                }
            }
            return arr;
        }

        /**
         *
         * @param {} []
         */
        function pruneParents(navLinks, depth) {
            var counter,
                numTotalBreadcrumbs,
                temp,
                navigation;

            counter = 0;
            temp = [];
            navigation = getNavigation();
            numTotalBreadcrumbs = navigation.numTotalBreadcrumbs;

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
                        temp = [];
                    }
                }

                // Remove any children from un-active parents.
                else {
                    if (navLink.nav_links) {
                        delete navLinks[i].nav_links;
                    }
                }
            });

            return cleanArray(temp);
        }


        templates = {
            showcase: function () {
                var defaults,
                    navLinks;

                /**
                 * Function for arranging an array for vertical display.
                 *
                 * @param {} []
                 * @param {} []
                 */
                function stack(arr, numColumns) {
                    var index,
                        temp = [],
                        row = 0,
                        col = 0,
                        len = arr.length,
                        rows = Math.ceil(len / numColumns);

                    while (row < rows) {
                        index = row + (col * rows);
                        if (index >= len) {
                            row++;
                            col = 0;
                        } else {
                            temp.push(arr[index]);
                            col++;
                        }
                    }

                    return temp;
                }

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

                    if (settings.arrangement === "stack") {
                        navLinks = stack(navLinks, settings.numColumnsLargeDesktop);
                    }

                    navLinks.forEach(function (navLink, i) {
                        var classes = [];
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
                        navLink.class = [
                            'col-xs-' + navLink.columnWidthPhone,
                            'col-sm-' + navLink.columnWidthTablet,
                            'col-md-' + navLink.columnWidthDesktop,
                            'col-lg-' + navLink.columnWidthLargeDesktop
                        ].join(' ');
                    });

                    return navLinks;
                }

                defaults = {
                    arrangement: 'float',
                    containerClass: 'showcase',
                    doPruneParents: true,
                    numColumnsPhone: 1,
                    numColumnsTablet: 2,
                    numColumnsDesktop: 3,
                    numColumnsLargeDesktop: 4,
                    sameHeight: false,
                    type: 'media'
                };

                settings = merge(true, defaults, options);

                navLinks = getNavigation().navLinks;
                if (settings.doPruneParents) {
                    navLinks = pruneParents(navLinks, 0);
                }
                navLinks = columnize(navLinks);

                this.setAnchors(navLinks);
            },
            breadcrumbs: function () {
                var currentUri,
                    defaults,
                    navigation,
                    items,
                    navLinks;

                /**
                 * Returns an object representing a page's properties, only if its URI is
                 * a fragment of the active page's URI. The method receives an array of objects,
                 * to be checked against the active URI.
                 *
                 * @param {array} [navLinks] Array of objects representing pages.
                 * @param {string} [currentUri] The path of the active page.
                 */
                function findBreadcrumb(navLinks, currentUri) {
                    var breadcrumbs;

                    breadcrumbs = [];

                    navLinks.forEach(function (navLink, i) {

                        // Don't include the Home page because it cannot have sub-directories.
                        // (We add the Home page manually, in getBreadcrumbNavLinks.)
                        if (navLink.uri !== "/") {

                            // Is this page's URI a fragment of the active page's URI?
                            if (currentUri.indexOf(navLink.uri) > -1) {

                                breadcrumbs.push(new Anchor({
                                    name: navLink.name,
                                    uri: navLink.uri
                                }));

                                // Does this page have sub-directories?
                                if (navLink.hasOwnProperty('nav_links')) {
                                    breadcrumbs = concatArray(breadcrumbs, findBreadcrumb(navLink.nav_links, currentUri));
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
                };

                settings = merge(true, defaults, options);
                navigation = getNavigation();
                navLinks = navigation.getNavLinks();
                currentUri = navigation.currentUri;
                items = findBreadcrumb(navLinks, currentUri);

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
                navLinks = getNavigation().getNavLinks();
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
                navLinks = getNavigation().getNavLinks();
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

                defaults = {
                    headingSelector: 'h2',
                    isSmoothScroll: true,
                    limit: -1,
                    numParents: 0,
                    pageHtml: '',
                    sortBy: '',
                    sortOrder: 'asc'
                };

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
                 * 1) Get the active page's HTML.
                 * 2) For each heading found, add it as a separate navLink.
                 *
                 * @param {} []
                 */
                function addHeadings(navLinks) {
                    forAll(navLinks, function (navLink, i) {
                        var temp = [];

                        // Only find headings for current page.
                        if (navLink.isCurrent) {

                            // The current page contains sub-directories; it can't use headings.
                            if (navLink.isParent === false) {

                                // Find all of the headings.
                                $(settings.headingSelector, settings.pageHtml).each(function () {
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
                    var sortA = 1,
                        sortB = -1,
                        sortBy,
                        sortOrder;

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

                settings = merge(true, defaults, options);
                navLinks = getNavigation().navLinks;
                addHeadings(navLinks);
                navLinks = pruneParents(navLinks, settings.numParents);
                sortNavLinks(navLinks);
                addBackToTop(navLinks);
                this.setAnchors(navLinks);
            }
        };

        // Instantiate a Location.
        if (templates[pattern]) {
            templates[pattern].call(this);
        } else {
            this.setAnchors(getNavigation().navLinks);
        }

        return this;
    }

    Pattern.prototype = {

        anchors: [],

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

        arr1IsArray = (arr1.pop && arr1.push);
        arr2IsArray = (arr2.pop && arr2.push);

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



    // Return the class with the exports.
    module.exports = function () {
        return function (currentUri, options) {
            return new Navigation(currentUri, options);
        };
    };

}());