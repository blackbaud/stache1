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
  
  $('p.note').each(function(i) {
    
    var element = $(this),
        message = element.html(),
        priority = element.data('priority').toUpperCase(),
        label = 'default';
    
    switch (priority) {
      case 'HIGH':
        label = 'danger';
      break;
      case 'MEDIUM':
        label = 'warning';
      break;
      case 'LOW':
        label = 'success';
      break;
    }
    
    var html = [
      '<button type="button" class="btn btn-default btn-xs pull-right" data-toggle="modal" data-target="#modal-notes-' + i + '">',
      '  <i class="fa fa-info-circle"></i>',
      '</button>',
      '<div class="modal fade" id="modal-notes-' + i + '">',
      '  <div class="modal-dialog">',
      '    <div class="modal-content">',
      '      <div class="modal-header">',
      '        <button type="button" class="close" data-dismiss="modal">&times;</button>',
      '        <h4 class="modal-title">Content Note <span class="label label-' + label + '">Priority: ' + priority + '</span></h4>',
      '      </div>  <!-- .modal-header -->',
      '      <div class="modal-body">',      
      '        <p>' + message + '</p>',
      '      </div>  <!-- .modal-body -->',
      '    </div>  <!-- .modal-content -->',
      '  </div>  <!-- .modal-dialog -->',
      '</div>  <!-- .modal -->',  
    ];
    
    element.after(html.join(''));
  });
  
})(jQuery, window, document);