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

    /**
     *
     */
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
    /**
     *
     */
    function equalHeightPanels() {
        var items,
            len;

        items = document.querySelectorAll('.equal-height-item');
        len = items.length;

        function setHeight(){
            var h,
                height,
                i;

            height = 0;

            // First, make sure no explicit heights are set.
            for (i = 0; i < len; ++i) {
                items[i].style.height = 'auto';
            }

            // Second, determine the max height of the children.
            for (i = 0; i < len; ++i) {
                h = items[i].offsetHeight;
                height = (h > height) ? h : height;
            }

            // Finally, set all children's height to the max height.
            for (i = 0; i < len; ++i) {
                items[i].style.height = height + 'px';
            }
        }

        setHeight();

        //Event listener to adjust sizes on window resize
        $(window).resize(function(){
            setHeight();
        });

    }

    /**
     *
     */
    function getBreadcrumbsHeight() {
        var $breadcrumbs;

        $breadcrumbs = $('#wrap-breadcrumbs');

        if ($breadcrumbs.length > 0) {
            return $breadcrumbs.outerHeight(true);
        }

        return 0;
    }

    /**
     *
     */
    function getHeaderHeight() {
      var $header;

      $header = $body.find('.bb-navbar');

      return ($header.length > 0) ? $header.outerHeight(true) : 0;
    }

    /**
     *
     */
    function getOmnibarHeight() {
        var $omnibar;

        $omnibar = $body.find('.bb-omnibar-bar');

        return ($omnibar.length > 0) ? $omnibar.outerHeight(true) : 0;
    }

    /**
     *
     */
    function parallax() {
        $.stellar({
            horizontalScrolling: false
        });
    }

    /**
     *
     */
    function scrollspy() {
        var $contentPrimary,
            $contentSecondary,
            $sidebarNav,
            affixTop,
            sidebarDocumentTop;

        $contentSecondary = $body.find('.content-secondary');
        $sidebarNav = $contentSecondary.find('.nav-sidebar');

        // There must be li.heading's on the page.
        if ($sidebarNav.find('li.heading').length > 0) {

            $contentPrimary = $body.find('.content-primary');

            // The window must be taller than the sidebar for affix to register.
            if ($contentPrimary.outerHeight(true) > $contentSecondary.outerHeight(true)) {

                affixTop = 50;
                sidebarDocumentTop = $sidebarNav.offset().top;

                if (sidebarDocumentTop < affixTop) {
                    affixTop = sidebarDocumentTop;
                }

                function updateSidebarNavCSS() {
                    // Set the sidebar's CSS 'top' property.
                    $sidebarNav.css({ 'top': affixTop + 'px' });
                }

                // Affix the sidebar.
                $sidebarNav.affix({
                    offset: {
                        top: function () {
                            updateSidebarNavCSS();
                            return sidebarDocumentTop - affixTop;
                        },
                        bottom: function () {
                            updateSidebarNavCSS();
                            return $body.find('.affix-stop').outerHeight();
                        }
                    }
                });

                // Catch our window resizing
                $(window).resize(function () {
                    $sidebarNav.css('width', $contentSecondary.width() + 'px');
                }).trigger('resize');

                // Scrollspy
                $body.scrollspy({
                    target: '.headings',
                    offset: $contentPrimary.offset().top + getOmnibarHeight() + 20
                });
            }
        }
    }

    /**
     *
     */
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
            regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
            results = regex.exec(window.location.search);

            return (results === null) ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    }

    /**
     *
     */
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

    /**
     *
     */
    function showOnHover() {
        $body.find('.has-hover').each(function () {
            var $elem;

            $elem = $(this);

            $elem.hover(function () {
                $elem.toggleClass('is-hover');
            });
        });
    }

    /**
     *
     */
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

    /**
     *
     */
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
        equalHeightPanels();
    });

}(window.jQuery, window));
