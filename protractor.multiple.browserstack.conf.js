const { SpecReporter } = require('jasmine-spec-reporter');
const browserstack = require('browserstack-local');

exports.config = {
  allScriptsTimeout: 60000,
  specs: [
    '**/e2e/*.e2e-spec.js'
  ],
  seleniumAddress: 'http://hub-cloud.browserstack.com/wd/hub',
  SELENIUM_PROMISE_MANAGER: false,
  commonCapabilities: {
    'browserstack.user': process.env.BROWSER_STACK_USERNAME,
    'browserstack.key': process.env.BROWSER_STACK_ACCESS_KEY,
    'browserstack.debug': true,
    'browserstack.local': true,
    build: 'protractor-browserstack',
    name: 'Functional tests'
  },
  multiCapabilities: [
    {
      browserName: 'Chrome',
      browser_version: '63'
    },
    {
      browserName: 'Firefox',
      browser_version: '58'
    },
    {
      os: 'OS X',
      os_version: 'El Capitan',
      browserName: 'Safari',
      browser_version: '9.1'
    },
    {
      browserName: 'Edge'
    },
    {
      browserName: 'IE',
      browser_version: '11'
    }
  ],
  beforeLaunch: () => {
    return new Promise((resolve, reject) => {
      exports.bs_local = new browserstack.Local();
      exports.bs_local.start({ key: exports.config.commonCapabilities['browserstack.key'] }, (error) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  },

  onPrepare: () => {
    browser.ignoreSynchronization = true;
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: { displayStacktrace: true }
    }));
  },

  afterLaunch: () => {
    return new Promise((resolve) => {
      exports.bs_local.stop(resolve);
    });
  }
};

exports.config.multiCapabilities.forEach((caps) => {
  for (const i in exports.config.commonCapabilities) {
    caps[i] = caps[i] || exports.config.commonCapabilities[i];
  }
});