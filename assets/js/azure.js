;(function($, window, document, undefined) {
  
  $(function() {
    $('body').addClass('bb-omnibar-height-padding'); 
    $('#navigation .navbar-nav > li:eq(4)').addClass('active');
    $('.zone-aside-first .navbar-nav').insertBefore($('.zone-aside-first .nav-pills'));
    $('head').append('<link rel="icon" href="//blackbaud-community.github.io/developer.blackbaud.com-renxt/assets/img/favicon.ico" type="image/ico">');
  });
  
  BBAUTH.Omnibar.load(document.getElementById("omnibar"), {
    serviceName: 'RENXT Developer',
    signInRedirectUrl: document.location.href,
    signOutRedirectUrl: ''
  });
  
})(jQuery, window, document);