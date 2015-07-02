/*jslint browser: true, es5: true*/
/*global jQuery */
(function ($, window, document, undefined) {
  'use strict';

  var body = $('body'),
    sidebar = $('.sidebar'),
    sidebarNav = $('.nav-sidebar'),
    sidebarHeading = sidebar.find('li.heading'),
    height = 0;

  // Scrollspy + affix only run if there are li.heading's on the page
  // And the sidebar isn't taller than the page
  if (sidebarHeading.length && $(window).height() > sidebar.height()) {

    // Affix
    sidebarNav.affix({
      offset: {
        top: body.css('padding-top').replace('px', ''),
        bottom: $('.footer-site').outerHeight()
      }
    });

    // Catch our window resizing
    $(window).resize(function () {
      sidebarNav.css('width', sidebar.width() + 'px');
    }).trigger('resize');

    // Scrollspy
    body.scrollspy({
      target: '.headings'
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
    e.preventDefault();

    // Manually making #top = 0
    var href = $(this).attr('href'),
      top = href === '#top' ? 0 : $($(this).attr('href')).offset().top;

    $('html, body').animate({
      scrollTop: top
    }, 1000);
  });

  // Tooltips
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });

  // Searching
  var q = getParameterByName('q');
  if (q !== '') {
    $('#q').val(q);
  }

  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

}(jQuery, window, document));
