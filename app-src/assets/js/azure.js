---
layout: blank
---

;(function($, window, document, undefined) {
  
  {% include_relative _shared-omnibar.js isAzure=true %}
  
  $(function() {
    $('body').addClass('bb-omnibar-height-padding'); 
    $('#navigation .navbar-nav > li:eq(4)').addClass('active');
    $('.zone-aside-first .navbar-nav').insertBefore($('.zone-aside-first .nav-pills'));
    $('head').append('<link rel="icon" href="//blackbaud-community.github.io/developer.blackbaud.com-renxt/assets/img/favicon.ico" type="image/ico">');
  });
  
})(jQuery, window, document);
