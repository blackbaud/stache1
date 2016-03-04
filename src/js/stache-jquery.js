/*jslint browser: true, es5: true*/
/*global jQuery */
(function ($, window, document, undefined) {
    'use strict';

    var body = $('body'),
        sidebar = $('.sidebar'),
        sidebarNav = $('.nav-sidebar'),
        sidebarHeading = sidebar.find('li.heading'),
        height = 0,
        q,
        $backToTop = $('.back-to-top'),
        bttoffset = $backToTop.data('offset'),
        bttduration = 500;

    // Scrollspy + affix only run if there are li.heading's on the page
    // And the sidebar isn't taller than the page
    if (sidebarHeading.length && $(window).height() > sidebar.height()) {

        // Affix
        sidebarNav.affix({
            offset: {
                top: $('.layout-sidebar-row').offset().top - 30,
                bottom: $('.affix-stop').outerHeight()
            }
        });

        // Catch our window resizing
        $(window).resize(function () {
            sidebarNav.css('width', sidebar.width() + 'px');
        }).trigger('resize');

        // Scrollspy - Offset accommodates extra CSS, which accommodates Omnibar
        body.scrollspy({
            target: '.headings',
            offset: 10
        });

    }

    // Parallax background
    $.stellar({
        horizontalScrolling: false
    });

    // Equal Height
    $('.equal-height').each(function () {
        var h = $(this).outerHeight();
        height = h > height ? h : height;
    }).css('min-height', height + 'px');

    // Show on Hover
    $('.has-hover').each(function () {
        $(this).hover(function () {
            $(this).toggleClass('is-hover');
        });
    });

    // Smooth scroll
    $('a.smooth-scroll').click(function (e) {
        var href = $(this).attr('href'),
            el = $(href),
            top = 0;

        e.preventDefault();

        // Forcing #top = 0, Verifying element exists
        if (href !== "#top" && el.length) {
            top = el.offset().top;
        }

        $('html, body').animate({
            scrollTop: top
        }, 1000);
    });

    // Tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

    // Searching
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

        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    //Show-Hide
    $('.show-first').after('<a class="show-more"> Show more...</a>');
    $('.show-hide').on('click', 'a', function (event) {
        if (!$(this).siblings('.show-second').is(":visible")) {
            event.preventDefault();
            $(this).siblings('.show-second').show();
            $(this).hide();
            $(this).siblings('.show-second').after('<a class="show-less"> Show less...</a>');
        } else {
            event.preventDefault();
            if ($(this).siblings('.show-second').is(":visible")) {
                $(this).siblings('.show-second').hide();
                $(this).hide();
                $(this).siblings('.show-first').after('<a class="show-more"> Show more...</a>');
            }
        }
    });

    // Back-to-top
    // Code from here: http://www.developerdrive.com/2013/07/using-jquery-to-add-a-dynamic-back-to-top-floating-button-with-smooth-scroll/

    if ($backToTop) {
        $(window).scroll(function () {
            if ($(this).scrollTop() > bttoffset) {
                $backToTop.fadeIn(bttduration);
            } else {
                $backToTop.fadeOut(bttduration);
            }
        });

        $backToTop.click(function (event) {
            event.preventDefault();
            $('html, body').animate({scrollTop: 0}, bttduration);
            return false;
        });
    }
}(jQuery, window, document));
