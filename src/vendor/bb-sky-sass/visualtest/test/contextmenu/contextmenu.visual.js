/*global phantom */

(function () {
    'use strict';
    
    var casper = phantom.casper,
        phantomcss = phantom.phantomcss;
    
    casper.thenOpen(phantom.rootUrl + 'contextmenu/fixtures/test.full.html')
    .then(function () {
        casper.then(function () {
            phantomcss.screenshot('#screenshot-contextmenu', 'context menu closed');
        })
        .then(function () {
            casper.click('button.bb-context-menu-btn');
            phantomcss.screenshot('#screenshot-contextmenu', 'context menu open');
        });
    });
}());