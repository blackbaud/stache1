/*jshint node: true */

/**
* Karma configuration used locally (or by default).
**/
module.exports = function(config) {
  'use strict';

  var shared = require('./karma.conf-shared.js');
  shared.coverageReporter.reporters.push({
    type: 'html',
    file: '../coverage.json'
  });

  config.set(shared);
  config.set({
    port: 9876,
    browsers: [
      'Chrome'
    ]
  });


};
