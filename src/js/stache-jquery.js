/*jslint browser: true, es5: true*/
/*global jQuery */


(function ($, window) {
    'use strict';

    var $body;

    /**
     * Adds a back-to-top Link
     * http://www.developerdrive.com/2013/07/using-jquery-to-add-a-dynamic-back-to-top-floating-button-with-smooth-scroll/
     */
    function backToTop() {
        var $backToTop,
            duration,
            offset;

        $backToTop = $body.find('.back-to-top');
        duration = 500;

        if ($backToTop.length > 0) {

            offset = $backToTop.data('offset');

            $(window).scroll(function () {
                if ($(this).scrollTop() > offset) {
                    $backToTop.fadeIn(duration);
                } else {
                    $backToTop.fadeOut(duration);
                }
            });

            $backToTop.on('click', function (event) {
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: 0
                }, duration);
                return false;
            });
        }
    }

    function equalHeights() {
        var height;

        height = 0;

        $body.find('.equal-height')
            .each(function () {
                var h;

                h = $(this).outerHeight();

                height = (h > height) ? h : height;

            })
            .css('min-height', height + 'px');
    }

    function getBreadcrumbsHeight() {
        var $breadcrumbs;

        $breadcrumbs = $('#wrap-breadcrumbs');

        if ($breadcrumbs.length > 0) {
            return $breadcrumbs.outerHeight() + window.parseInt($breadcrumbs.css('margin-top').replace('px', ''));
        }

        return 0;
    }

    function getOmnibarHeight() {
        return $body.find('.bb-omnibar-bar').outerHeight();
    }

    function getHeaderHeight() {
        var total;

        total = 0;

        // Height of the omnibar.
        total += getOmnibarHeight();

        // Height of the global navigation.
        total += $body.find('.bb-navbar').outerHeight();

        return total;

    }

    function parallax() {
        $.stellar({
            horizontalScrolling: false
        });
    }

    function scrollspy() {
        var $sidebar,
            $sidebarHeadings,
            $sidebarNav,
            $window,
            top;

        $sidebar = $body.find('.sidebar');
        $sidebarNav = $sidebar.find('.nav-sidebar');
        $sidebarHeadings = $sidebarNav.find('li.heading');

        // There must be li.heading's on the page.
        if ($sidebarHeadings.length > 0) {

            $window = $(window);

            // The sidebar must be taller than the page.
            if ($window.height() > $sidebar.height()) {

                top = getHeaderHeight();

                // Affix
                $sidebarNav.affix({
                    offset: {
                        top: top + window.parseInt($sidebar.css('margin-top').replace('px', '')) + getBreadcrumbsHeight(),
                        bottom: $body.find('.affix-stop').outerHeight()
                    }
                });

                // Catch our window resizing
                $window.resize(function () {
                    $sidebarNav.css('width', $sidebar.width() + 'px');
                }).trigger('resize');

                // Scrollspy
                $body.scrollspy({
                    target: '.headings',
                    offset: top + 20
                });
            }
        }
    }

    function searchQuery() {
        var q;

        q = getParameterByName('q');

        if (q !== '') {
            $('#q').val(q);
        }

        function getParameterByName(name) {
            var regex,
                results;

            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);

            return (results === null) ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    }

    function showHide() {

        $body.find('.show-hide').each(function () {
            var $container,
                $contentHidden,
                $contentPreview,
                $showLess,
                $showMore;

            $container = $(this);

            $contentPreview = $container.find('.show-first');
            $contentHidden = $container.find('.show-second');

            $showMore = $('<span class="show-hide-button"><a href>Show more...</a></span>').appendTo($contentPreview);
            $showLess = $('<span class="show-hide-button"><a href>Show less...</a></span>').appendTo($contentHidden);

            $showLess.on('click', function (event) {
                event.preventDefault();
                $contentHidden.removeClass('on');
                $showMore.removeClass('off');
                return false;
            });

            $showMore.on('click', function (event) {
                event.preventDefault();
                $contentHidden.addClass('on');
                $showMore.addClass('off');
                return false;
            });
        });
    }

    function showOnHover() {
        $body.find('.has-hover').each(function () {
            var $elem;

            $elem = $(this);

            $elem.hover(function () {
                $elem.toggleClass('is-hover');
            });
        });
    }

    function smoothScroll() {
        $body.find('.smooth-scroll')
            .on('click', function (event) {
                var $link,
                    $target,
                    href,
                    offset,
                    top;

                if (event.target.nodeName === "A") {
                    $link = $(event.target);
                } else {
                    $link = $(this).find('>a');
                }

                top = 0;
                offset = 20;
                href = $link.attr('href');
                $target = $(href);

                event.preventDefault();

                // Forcing #top = 0, Verifying element exists
                if (href !== "#top" && $target.length > 0) {
                    top = $target.offset().top - getOmnibarHeight() - offset;
                }

                $('html, body').animate({
                    scrollTop: top
                }, 800);
            });
    }

    function tooltips() {
        $body.find('[data-toggle="tooltip"]').tooltip();
    }

    /**
     * Initialize.
     */
    $(function () {
        $body = $('body');

        backToTop();
        equalHeights();
        parallax();
        scrollspy();
        searchQuery();
        showHide();
        showOnHover();
        smoothScroll();
        tooltips();
    });

}(window.jQuery, window));
