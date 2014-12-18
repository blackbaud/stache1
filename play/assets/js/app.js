;(function($, window, document, undefined) {
  
  // Initialize the Omnibar
  BBAUTH.Omnibar.load(document.getElementById("omnibar"), {
    enableSearch: false,
    serviceName: 'Developer',
    signInRedirectUrl: document.location.href,
    signOutRedirectUrl: '',
    afterLoad: function() {
      console.log('Omnibar Loaded');
    },
    userLoaded: function(user) {
      console.log(user);
    }
  });
  
})(jQuery, window, document);