;(function($, window, document, undefined) {
  
  // Initialize the Omnibar
  BBAUTH.Omnibar.load(document.getElementById("omnibar"), {
    enableSearch: false, // FYI, toggle the "searching" class on "searchContainer" to get the spinner
    serviceName: 'RENXT Developer',
    signInRedirectUrl: document.location.href,
    signOutRedirectUrl: '',
    afterLoad: function() {
      
    },
    userLoaded: function(user) {
      
    }
  });
  
})(jQuery, window, document);