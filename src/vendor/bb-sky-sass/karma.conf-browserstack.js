/**
* Karma configuration options used on Browserstack.
*
* PRIVATE CREDENTIALS LISTED
*
* Please be aware, we are puposefully including our BrowserStack credentials in plaintext in this file.
* By design, Travis CI does not expose secure environment variables to forks.  Since we want to enforce the Fork & Pull
* model for ALL contributors and most importantly, since this repo is private, this was the best solution.
*
* Clarification: http://docs.travis-ci.com/user/environment-variables/#Secure-Variables
* Alternative: https://github.com/twbs/savage
*
* WARNING: If we ever decide to make this repo public, please remove the creds and rewrite the history!
**/
module.exports = function(config) {

  var base = 'BrowserStack';
  var customLaunchers = {
    bs_windows_ie_11: {
      base: base,
      browser: 'ie',
      browser_version: '11.0',
      os: 'Windows',
      os_version: '8.1'
    },
    bs_windows_ie_10: {
      base: base,
      browser: 'ie',
      browser_version: '10.0',
      os: 'Windows',
      os_version: '8'
    },
    bs_windows_chrome_latest: {
      base: base,
      browser: 'chrome',
      os: 'Windows',
      os_version: '8.1'
    },
    bs_windows_firefox_latest: {
      base: base,
      browser: 'firefox',
      os: 'Windows',
      os_version: '8.1'
    },
    bs_osx_safari_latest: {
      base: base,
      browser: 'safari',
      os: 'OS X',
      os_version: 'Yosemite'
    },
    bs_osx_chrome_latest: {
      base: base,
      browser: 'chrome',
      os: 'OS X',
      os_version: 'Yosemite'
    },
    bs_osx_firefox_latest: {
      base: base,
      browser: 'firefox',
      os: 'OS X',
      os_version: 'Yosemite'
    }
  };

  var shared = require('./karma.conf-shared.js');

  // Adding json reporter
  shared.reporters.push('json');
  shared.coverageReporter.reporters.push({
    type: 'json',
    file: '../coverage.json'
  });

  config.set(shared);
  config.set({
    singleRun: true,
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 1,
    browserNoActivityTimeout: 240000,
    captureTimeout: 240000,
    browserStack: {
      port: 9876,
      username: 'bobbyearl1',
      accessKey: 'rwJ4L5qYaFEg6PEHQCBz'
    },
    jsonReporter: {
      stdout: false,
      outputFile: 'coverage/results.json'
    }
  });
};
