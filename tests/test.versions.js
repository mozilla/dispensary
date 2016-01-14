import fs from 'fs';

import { DEFAULT_LIBRARY_FILE } from 'const';
import { getVersions, _getVersionsFromNPM } from 'versions';


describe('Versions', function() {

  beforeEach(() => {
    this.libraries = JSON.parse(fs.readFileSync(DEFAULT_LIBRARY_FILE));
  });

  // TODO: Make this not require a network connection...
  it('should return a promise', () => {
    return getVersions([{
      name: 'localforage',
      useNPM: true,
    }]).then((libraries) => {
      assert.isAbove(libraries[0].versions.length, 0);
      assert.include(libraries[0].versions, '1.0.0');
    });
  });

  it('should handle errors', (done) => {
    var requestWithError = {
      get: (params, callback) => {
        callback(new Error('Fail'), null);
      },
    };
    var name = this.libraries[0].name;

    _getVersionsFromNPM(this.libraries[0], (err) => {
      assert.instanceOf(err, Error);
      assert.equal(err.message,
                   `RequestError: npm "${name}" (statusCode: 0)`);
      done();
    }, requestWithError);
  });

  it('should handle empty response object', (done) => {
    var requestWithError = {
      get: (params, callback) => {
        callback(new Error('Fail'), {});
      },
    };
    var name = this.libraries[0].name;

    _getVersionsFromNPM(this.libraries[0], (err) => {
      assert.instanceOf(err, Error);
      assert.equal(err.message,
                   `RequestError: npm "${name}" (statusCode: 0)`);
      done();
    }, requestWithError);
  });

  it('should set the statusCode if one exists', (done) => {
    var requestWithError = {
      get: (params, callback) => {
        callback(new Error('Fail'), {statusCode: 405});
      },
    };
    var name = this.libraries[0].name;

    _getVersionsFromNPM(this.libraries[0], (err) => {
      assert.instanceOf(err, Error);
      assert.equal(err.message,
                   `RequestError: npm "${name}" (statusCode: 405)`);
      done();
    }, requestWithError);
  });

  it('should only request NPM versions if useNPM is present', () => {
    var libraries = [
      {name: 'angularjs', useNPM: true, versions: []},
      {name: 'tofujs', versions: []},
    ];

    getVersions(libraries, 2)
      .then((newLibraries) => {
        var librariesWithVersion = newLibraries.filter((lib) => {
          return lib.versions.length > 0;
        });

        assert.lengthOf(librariesWithVersion, 1);
      });
  });

});
