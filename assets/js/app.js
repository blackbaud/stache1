;(function($, window, document, undefined) {
  
  BBAUTH.Omnibar.load(document.getElementById("omnibar"), {
    enableSearch: true,
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
  
}(jQuery, window, document);