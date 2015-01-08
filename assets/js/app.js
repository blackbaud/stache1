;(function($, window, document, undefined) {
  
  // Initialize the Omnibar
  BBAUTH.Omnibar.load(document.getElementById("omnibar"), {
    enableSearch: false,
    serviceName: 'Developer',
    signInRedirectUrl: document.location.href,
    signOutRedirectUrl: '',
    afterLoad: function() {
      
    },
    userLoaded: function(user) {
      
    }
  });
  
})(jQuery, window, document);