;(function($, window, document, undefined) {
  
  // Initialize the Omnibar
  BBAUTH.Omnibar.load(document.getElementById("omnibar"), {
    enableSearch: false, // FYI, toggle the "searching" class on "searchContainer" to get the spinner
    serviceName: 'RENXT Developer',
    signInRedirectUrl: document.location.href,
    signOutRedirectUrl: ''
  });
  
  var sidebar = $('.sidebar'),
      sidebarNav = $('.nav-sidebar');
  
  if (sidebar.length) {
    
    // Affix - We calculate the bottom offset as disqus could change it
    sidebarNav.affix({
      offset: {
        top: 50,
        bottom: function() {
          return $('.footer-meta').outerHeight() + $('.footer-site').outerHeight();
        }
      }
    });

    // Catch our window resizing
    $(window).resize(function() {
      sidebarNav.css('width', sidebar.width() + 'px');
    }).trigger('resize');

    // Scrollspy
    $('body').scrollspy({
      target: '.sidebar'
    });
    
  }
  
  // Smooth scroll
  $('a.smooth-scroll').click(function(e) {
    e.preventDefault();

    var href = $(this).attr('href'),
        top = href == '#top' ? 0 : $($(this).attr('href')).offset().top;
    
    $('html, body').animate({
      scrollTop: top
    }, 1000);
  });
  
})(jQuery, window, document);