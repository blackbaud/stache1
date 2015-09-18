/*global phantom */

(function () {
    'use strict';
  
    var casper = phantom.casper,
        phantomcss = phantom.phantomcss;
    
    casper.thenOpen(phantom.rootUrl + 'check/fixtures/test.full.html')
        .then(function () {
            phantomcss.screenshot('#screenshot-check', 'check states');
        });
}());
