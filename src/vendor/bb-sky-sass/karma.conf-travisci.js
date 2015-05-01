/**
* Karma configuration options used on TravisCI.
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
  
  var base = 'SauceLabs';
  var customLaunchers = {
    sl_windows_ie_11: {
      base: base,
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
    },
    sl_windows_ie_10: {
      base: base,
      browserName: 'internet explorer',
      platform: 'Windows 8',
      version: '10'
    },
    sl_windows_chrome_latest: {
      base: base,
      browserName: 'chrome',
      platform: 'Windows 8.1'
    },
    sl_windows_firefox_latest: {
      base: base,
      browserName: 'firefox',
      platform: 'Windows 8.1'
    },
    sl_osx_safari_latest: {
      base: base,
      browserName: 'safari',
      platform: 'OS X 10.10'
    },
    sl_osx_chrome_latest: {
      base: base,
      browserName: 'chrome',
      platform: 'OS X 10.10'
    },
    sl_osx_firefox_latest: {
      base: base,
      browserName: 'firefox',
      platform: 'OS X 10.10'
    }
  };
  
  // Load the shared configuration
  var shared = require('./karma.conf-shared.js');
  
  // Adding the saucelabs reporter
  shared.reporters.push('saucelabs');
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
    sauceLabs: {
      username: 'Blackbaud-BobbyEarl',
      accessKey: 'f2f49a90-fe96-41c2-ae2a-cce395575411',
      testName: 'Sky',
      public: 'share',
      connectOptions: {
        logfile: 'saucelabs.txt',
        recordVideo: false,
        recordScreenshots: false
      }
    },
    jsonReporter: {
      stdout: false,
      outputFile: 'coverage/results.json'
    }
  });
};
