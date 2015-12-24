import { getVersions } from 'versions';

import { unexpectedSuccess } from './helpers';


describe('Versions', function() {

  it('should get many versions', () => {
    // HACK: We should use mock data to skip the need for this.
    this.timeout(50000);

    return getVersions('angular')
      .then((versions) => {
        assert.include(versions, '0.0.1');
        assert.include(versions, '0.0.1-2');
        assert.include(versions, '0.0.4');
        assert.include(versions, '1.0.0');
        assert.include(versions, '1.4.8');
      });
  });

  it('should get versions for localForage', () => {
    return getVersions('localforage')
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
    return getVersions('localforage', fakeRequest)
      .then(unexpectedSuccess)
      .catch((err) => {
        assert.instanceOf(err, Error);
        assert.equal(err.message, 'Fail!');

      });
  });

  it('should handle 404s', () => {
    return getVersions('does_not_exist')
      .then(unexpectedSuccess)
      .catch((err) => {
        assert.instanceOf(err, Error);
        assert.equal(err.message,
                     'Repo does_not_exist not found or an error occured.');
      });
  });

});
