[![Build Status](https://travis-ci.org/mozilla/dispensary.svg?branch=master)](https://travis-ci.org/mozilla/dispensary) [![codecov](https://codecov.io/gh/mozilla/dispensary/branch/master/graph/badge.svg)](https://codecov.io/gh/mozilla/dispensary) [![Dependency Status](https://david-dm.org/mozilla/dispensary.svg)](https://david-dm.org/mozilla/dispensary) [![devDependency Status](https://david-dm.org/mozilla/dispensary/dev-status.svg)](https://david-dm.org/mozilla/dispensary#info=devDependencies) [![npm version](https://badge.fury.io/js/dispensary.svg)](https://badge.fury.io/js/dispensary)

# Dispensary 🌿

The dispensary collects and offers hashes of popular JavaScript libraries, mainly for the [Mozilla's addons-linter](https://github.com/mozilla/addons-linter).

## Libraries updates

This is the (manual) process to update libraries in dispensary:

1. Open `src/libraries.json`
2. Open the release pages of each library. Here is a list:

<!--RELEASE_PAGES_START-->

- https://github.com/angular/angular.js/releases
- https://github.com/jashkenas/backbone/releases
- https://github.com/twbs/bootstrap/releases
- https://download.dojotoolkit.org/
- https://github.com/cure53/DOMPurify/releases
- https://github.com/jquery/jquery/releases
- https://github.com/jquery/jquery-ui/releases
- https://github.com/moment/moment/releases
- https://github.com/mootools/mootools-core/releases
- http://prototypejs.org/
- https://github.com/facebook/react/releases
- https://github.com/jashkenas/underscore/releases
- https://github.com/mozilla/webextension-polyfill/releases
<!--RELEASE_PAGES_END-->

3. On each page, check whether there are newer release versions than what is in `src/libraries.json`. Note that some libraries, like react, support several versions, so we need to check each "branch".
4. For major upgrades, take a quick look at the code changes
5. Add new versions to `src/libraries.json`
6. Run `npm run update`
7. Commit and push (Make sure to include `src/libraries.json`and `src/hashes.txt`)
8. Tag and release
