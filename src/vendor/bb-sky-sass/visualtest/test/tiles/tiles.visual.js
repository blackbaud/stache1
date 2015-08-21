/*global phantom */

(function () {
    'use strict';
  
    var casper = phantom.casper,
        phantomcss = phantom.phantomcss;
    
    function takeTileScreenshots(tileToTest) {
        var idSelector = '#screenshot-tile-' + tileToTest,
            prettyName = tileToTest.replace(/-/g, ' ');
        
        casper.then(function () {
            phantomcss.screenshot(idSelector, 'tile ' + prettyName + ' expanded');
        }).then(function () {
            casper.click(idSelector + ' .ibox-title');
        }).then(function () {
            phantomcss.screenshot(idSelector, 'tile ' + prettyName + ' collapsed');
        });
    }
    
    casper.thenOpen(phantom.rootUrl + 'tiles/fixtures/test.full.html')
        .then(function () {
            takeTileScreenshots('minimal');
            takeTileScreenshots('with-settings');
            takeTileScreenshots('with-header-content');
            takeTileScreenshots('with-header-check');
        });
}());