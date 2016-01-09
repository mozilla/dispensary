import fs from 'fs';

import { DEFAULT_LIBRARY_FILE } from 'const';
import { getVersions } from 'versions';

import { unexpectedSuccess } from './helpers';


describe('Versions', function() {

  var libraryInfo = JSON.parse(fs.readFileSync(DEFAULT_LIBRARY_FILE));

  it('should get many versions', () => {
    // HACK: We should use mock data to skip the need for this.
    this.timeout(50000);

    return getVersions('angular', libraryInfo.angular)
      .then((versions) => {
        assert.include(versions, '1.0.1');
        assert.include(versions, '1.0.2');
        assert.include(versions, '1.4.8');
      });
  });

  it('should not check NPM when useNPM is not true', () => {
    var fakeRequest = {
      get: () => {
        throw new Error('Fail!');
      },
    };

    var jQueryLibraryInfo = {
      versions: ['1.0.1'],
      path: '.js',
      pathToMinified: '.min.js',
      url: 'http://code.jquery.com/jquery-$VERSION$FILENAME',
    };

    return getVersions('jquery', jQueryLibraryInfo, fakeRequest)
      .then((versions) => {
        assert.equal(versions.length, 1);
        assert.include(versions, '1.0.1');
        assert.notInclude(versions, '1.5.1');
      });
  });

  it('should combine explicit versions and NPM versions', () => {
    // HACK: We should use mock data to skip the need for this.
    this.timeout(50000);

    var jQueryLibraryInfo = {
      versions: ['1.0.1'],
      minVersion: '1.0.1',
      path: '.js',
      pathToMinified: '.min.js',
      useNPM: true,
      url: 'http://code.jquery.com/jquery-$VERSION$FILENAME',
    };

    return getVersions('jquery', jQueryLibraryInfo)
      .then((versions) => {
        assert.isAbove(versions.length, 1);
        assert.include(versions, '1.0.1');
        assert.include(versions, '1.5.1');
      });
  });

  it('should get versions for any library', () => {
    var lfLibraryInfo = {
      path: 'localforage.js',
      pathToMinified: 'localforage.min.js',
      useNPM: true,
      // jscs:disable
      url: 'https://raw.githubusercontent.com/mozilla/localForage/$VERSION/dist/$FILENAME', // eslint-disable-line
      // jscs:enable
    };

    return getVersions('localforage', lfLibraryInfo)
      .then((versions) => {
        assert.include(versions, '1.3.0');
      });
  });

  it('should handle errors', () => {
    var fakeRequest = {
      get: () => {
        throw new Error('Fail!');
      },
    };
    return getVersions('angular', libraryInfo.angular, fakeRequest)
      .then(unexpectedSuccess)
      .catch((err) => {
        assert.instanceOf(err, Error);
        assert.equal(err.message, 'Fail!');
      });
  });

  it('should handle 404s on NPM', () => {
    return getVersions('does_not_exist', {useNPM: true})
      .then(unexpectedSuccess)
      .catch((err) => {
        assert.instanceOf(err, Error);
        assert.equal(err.message,
          'RequestError: npm "does_not_exist" (statusCode: 404)');
      });
  });

  it('should throw an error if no libraryInfo is present', () => {
    return getVersions('angular')
      .then(unexpectedSuccess)
      .catch((err) => {
        assert.instanceOf(err, Error);
        assert.equal(err.message,
                     'No library info supplied for "angular"');
      });
  });

});
