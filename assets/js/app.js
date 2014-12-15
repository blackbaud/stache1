!function($) {
  BBAUTH.Omnibar.load(document.getElementById("omnibar"), {
    enableSearch: true,
    serviceName: 'Developer',
    userLoaded: function(user) {
      console.log(user);
    }
  });
}(jQuery);