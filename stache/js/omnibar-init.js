/*jslint browser: true, es5: true*/
/*global jQuery, BBAUTH */
(function ($, window, document, undefined) {
  'use strict';

  // Initialize the Omnibar
  BBAUTH.Omnibar.load(document.getElementById("omnibar"), {
    enableSearch: false,
    enableHelp: false,
    serviceName: 'Blackbaud Developer',
    signInRedirectUrl: '{{ stache.config.devportalsigninurl }}',
    signOutRedirectUrl: '',
    afterLoad: function () {

      // Send them to the dev portal.  Hoping the Omnibar eventually supports this
      // Still a WIP
      /*
      $('a.signin').each(function() {
        var $el = $(this),
            parts = $el.attr('href').split('?'),
            qs = parts.length == 2 ? parts[1] : '',
            href = '{{ stache.config.devportalsigninurl }}' + '?' + qs;
        $el.attr('href', href);
      });
      */

      // There's definitly an official way to do this, but I don't have time to find out.
      $('.productmenucontainer').append($('.nav-items').clone().toggleClass('nav-items bb-omnibar-productmenu'));

    }
  });

}(jQuery, window, document));

