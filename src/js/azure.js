;(function($, window, document, undefined) {
  $(function() {

    $('head').append('<link rel="icon" href="//blackbaud-community.github.io/developer.blackbaud.com-renxt/assets/img/favicon.ico" type="image/ico">');
    $('.zone-navigation a[href="/docs/services"]').closest('li').toggleClass('active', location.href.indexOf('/docs/services') > -1);
    $('.zone-aside-first').toggleClass('col-md-2 col-md-3');

  });
})(jQuery, window, document);
