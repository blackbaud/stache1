/*jslint browser: true, es5: true*/
/*global jQuery, ZeroClipboard */
(function ($, window, document, undefined) {
    'use strict';

    var bridge,
        btnCopy,
        client;

    $('pre > code:not(.no-copy)').each(function () {
        var html = [
            '<div class="copy-code" title="Copy to Clipboard" data-trigger="manual" data-placement="left" data-container="body">',
            '<i class="fa fa-files-o"></i>',
            '</div>'
        ].join('');

        $(this)
          .closest('pre')
          .wrap('<div class="has-copy-code"></div>')
          .before(html);
    });

    // Initialize Clipboard Copy
    btnCopy = $('.copy-code');
    if (btnCopy.length) {

        // Initialize the clipboard
        ZeroClipboard.config({ swfPath: $('body').data('base') + "img/ZeroClipboard.swf" });
        client = new ZeroClipboard(btnCopy);

        // Show the tooltip
        btnCopy.on('mouseover', function () {
            $(this).tooltip('show');
        });

        // Hide the tooltip and our manually created one in case it was open
        btnCopy.on('mouseout', function () {
            $(this).tooltip('hide');
            bridge.tooltip('hide');
        });

        // When the SWF is ready, add our manually triggered tooltip
        client.on('ready', function () {
            bridge = $('#global-zeroclipboard-html-bridge');
            bridge.data('placement', 'left').data('trigger', 'manual').attr('title', 'Copied!').tooltip();
        });

        // This usually happens on mobile devices when the SWF doesn't or can't load.
        // We'll just hide the button in that case.
        client.on('error', function () {
            btnCopy.hide();
        });

        // Copy the related content to the clipboard
        client.on('copy', function (e) {
            e.clipboardData.setData('text/plain', $(e.target).siblings('code').text());
        });

        // Show the copied tooltip
        client.on('aftercopy', function (e) {
            btnCopy.tooltip('hide');
            bridge.tooltip('show');
        });
    }

}(jQuery, window, document));
