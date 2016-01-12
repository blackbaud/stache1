(function () {
    "use strict";

    var $,
        getInstance,
        Handlebars,
        merge,
        _params,
        stacheMarked;

    $ = require('cheerio');
    merge = require('merge');
    stacheMarked = require('../../src/helpers/stache-marked')();


    /**
     *
     * @param {} []
     * @param {} []
     */
    function __construct(navLinks, options) {
        var instance,
            temp;

        instance = this;
        temp = [];

        // Expose the instantiated object.
        getInstance = function () {
            return instance;
        };

        // Merge settings.
        instance.settings = merge.recursive(true, this.defaults, options);

        // Clone the navLinks array so it's not passed as a reference.
        navLinks.forEach(function (navLink) {
            temp.push(merge(true, navLink));
        });

        // Update navLinks with the cloned version.
        instance.setNavLinks(temp);

        // Update the active/current states, if active URI is set.
        if (instance.settings.currentURI !== "") {
            instance.updateNavLinks();
        }
    }


    /**
     *
     * @param {} []
     * @param {} []
     */
    function Navigation(navLinks, options) {
        this.defaults = {
            hbContext: {},
            currentURI: ''
        };
        this.breadcrumbPosition = 0;
        this.numTotalBreadcrumbs = 0;
        this.currentNavLink = {};

        __construct.call(this, navLinks, options || {});
    }


    /**
     *
     * @param {} []
     */
    function addPageSectionsToNavLinks() {

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
        html = stacheMarked.getCached(buffer);

        // Find all of the headings.
        $(instance.settings.headingSelector, html).each(function () {
            var el,
                navLink;

            el = $(this);
            navLink = {
                name: el.text(),
                uri: '#' + el.attr('id'),
                showInNav: true,
                isDraft: el.parent().hasClass('draft'),
                isSmoothScroll: instance.settings.isSmoothScroll,
                isHeading: true
            };
            instance.setClassesForNavLink(navLink);
            navLinks.push(navLink);
        });

    }

    /*
    function forAll(things, callback) {
        things = callback.call(things, callback);
        return things;
    }

    forAll(things).when(condition).execute(function (thing) {
        // Do something
        if (thing.things) {
            this.next(things);
        }
    });
    */

    /*
    function forAll(things, callback) {
        for (var i = 0, len = things.length; i < len; ++i) {
            callback.call(things, things[i], i);
        }
        return things;
    }
    */


    /**
     *
     * @param {} []
     */
    function prepareNavLinks(navLinks) {
        var currentURI,
            isActive,
            instance;

        instance = getInstance();
        currentURI = instance.settings.currentURI;

        navLinks.forEach(function (navLink, i) {

            isActive = false;

            // Remove the Home page.
            //if (navLink.uri === "/" || navLink.showInNav === false) {
            if (navLink.uri === "/") {
                delete navLinks[i];
                return;
            }

            if (navLink.showInNav === false) {
                console.log("DO NOT SHOW THIS PAGE:", navLink.name);
                //delete navLinks[i];
                //return;
            }

            // This page's URI is a fragment of the active page's URI.
            if (currentURI.indexOf(navLink.uri) > -1) {
                isActive = true;
                navLink.isActive = true;
            }

            if (isActive) {
                instance.breadcrumbPosition++;
                navLink.breadcrumbPosition = instance.breadcrumbPosition;
                console.log("Preparing page: ", navLink.name, " (at position " + instance.breadcrumbPosition + ")");

                // Current page.
                if (currentURI === navLink.uri) {
                    console.log("Current page found: ", navLink.name);
                    navLink.isCurrent = true;
                    instance.numTotalBreadcrumbs = instance.breadcrumbPosition;
                    instance.currentNavLink = navLink;
                }
            }

            // Add any children links.
            if (navLink.nav_links) {
                console.log("Child nav_links found...");
                prepareNavLinks(navLink.nav_links);
            }

            instance.setClassesForNavLink(navLink);
        });

        /*
        forAll(navLinks, function (navLink, i) {
            console.log(typeof navLink, i);
            if (typeof navLink === "undefined" || navLink.showInNav === false) {
                this.splice(i, 1);
            }
        });
        */

        //instance.navLinks = navLinks;
    }


    /**
     *
     * @param {} []
     */
    function pruneNavParents(navLinks, rules) {
        var counter,
            depth,
            numTotalBreadcrumbs,
            temp,
            instance;

        counter = 0;
        depth = rules.numParents;
        temp = [];
        instance = getInstance();
        numTotalBreadcrumbs = instance.numTotalBreadcrumbs;

        navLinks.forEach(function (navLink) {
            if (navLink.isActive) {

                console.log("Checking " + navLink.name + "...", "Active state: " + navLink.isActive + ".",  "Only show " + depth + " parent(s) above active.", "This link's position is " + navLink.breadcrumbPosition + ".", "Total number of breadcrumb positions: " + numTotalBreadcrumbs + ".", "We're looking for position: " + (numTotalBreadcrumbs - depth));

                // It's a parent link.
                if (navLink.nav_links) {
                    if (numTotalBreadcrumbs - depth === navLink.breadcrumbPosition) {

                        console.log("The " + navLink.name + " page is what we want...");

                        temp = navLink.nav_links;
                        /*
                        if (rules.showParentSiblings) {
                            console.log("Including the parent's siblings...");
                            temp = navLinks;
                        } else {
                            console.log("Omitting the parent's siblings...");
                            temp = [navLink]; // only include the active parent.
                        }
                        */
                        return;
                    } else {
                        temp = pruneNavParents(navLink.nav_links, rules);
                        return;
                    }
                }

                // It has no children.
                else {
                    console.log("The page " + navLink.name + " doesn't have any children.");
                    temp = navLinks;
                }
            }

            // Remove any children from un-active parents.
            else {
                if (navLink.nav_links) {
                    delete navLink.nav_links;
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
    function sortNavLinks() {
        var instance,
            sortA = 1,
            sortB = -1,
            sortBy,
            sortOrder;

        instance = getInstance();
        sortBy = instance.settings.sortBy;
        sortOrder = instance.settings.sortOrder.toLowerCase();

        if (sortBy !== '') {
            if (sortOrder === 'desc') {
                sortA = -1;
                sortB = 1;
            }
            instance.navLinks = instance.navLinks.sort(function (a, b) {
                return a[sortBy] > b[sortBy] ? sortA : (a[sortBy] < b[sortBy] ? sortB : 0);
            });
        }
    }


    // Public methods for the instantiated object.
    Navigation.prototype = {

        /**
         *
         * @param {} []
         */
        getNavLinks: function () {
            return this.navLinks;
        },

        /**
         *
         * @param {} []
         */
        getSidebarNavLinks: function (rules) {
            this.navLinks = pruneNavParents(this.navLinks, rules);
            addPageSectionsToNavLinks();
            sortNavLinks();
            return this.navLinks;
        },

        /**
         *
         * @param {} []
         */

        setClassesForNavLink: function (navLink) {
            var classes;

            classes = [];

            if (navLink.isActive) {
                classes.push("active");
            }

            if (navLink.isCurrent) {
                classes.push("current");
            }

            if (navLink.isDraft) {
                classes.push("draft");
            }

            if (navLink.isHeading) {
                classes.push("heading");
            }

            if (navLink.isSmoothScroll) {
                classes.push("smooth-scroll");
            }

            navLink.class = classes.join(" ");
        },

        /**
         *
         * @param {} []
         */
        setCurrentURI: function (uri) {
            this.currentURI = uri;
            this.updateNavLinks();
        },

        /**
         *
         * @param {} []
         */
        setNavLinks: function (arr) {
            this.navLinks = arr;
            this.updateNavLinks();
        },

        /**
         *
         * @param {} []
         */
        updateNavLinks: function () {
            prepareNavLinks(this.navLinks);
        }
    };


    // Return the class with the exports.
    module.exports = function (handlebars, params) {
        Handlebars = handlebars;
        _params = params;
        return Navigation;
    };
}());

