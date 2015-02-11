---
layout: blank
---
  
;(function($, window, document, undefined) {
  
  {% include_relative _shared-omnibar.js isAzure=false %}
  
  var body = $('body'),
      sidebar = $('.sidebar'),
      sidebarNav = $('.nav-sidebar');
  
  // No need to start these if there's no sidebar
  if (sidebar.length) {
    
    // Affix
    sidebarNav.affix({
      offset: {
        top: body.css('padding-top').replace('px', ''),
        bottom: $('.footer-site').outerHeight()
      }
    });

    // Catch our window resizing
    $(window).resize(function() {
      sidebarNav.css('width', sidebar.width() + 'px');
    }).trigger('resize');

    // Scrollspy
    body.scrollspy({
      target: '.sidebar'
    });
    
  }
  
  // Parallax background
  $.stellar({
    horizontalScrolling: false
  });
  
  // Equal Height
  var height = 0;
  $('.equal-height').each(function() {
    var h = $(this).outerHeight();
    height = h > height ? h : height;
  }).css('min-height', height + 'px');
  
  // Show on Hover
  $('.has-hover').each(function() {
    $(this).hover(function() {
      $(this).toggleClass('is-hover');
    });
  });
  
  // Smooth scroll
  $('a.smooth-scroll').click(function(e) {
    e.preventDefault();

    // Manually making #top = 0
    var href = $(this).attr('href'),
        top = href == '#top' ? 0 : $($(this).attr('href')).offset().top;
    
    $('html, body').animate({
      scrollTop: top
    }, 1000);
  });
  
  // Tooltips
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  });  
  
})(jQuery, window, document);
