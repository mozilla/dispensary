import { DEFAULT_LIBRARY_FILE } from 'const';
import Dispensary from 'dispensary';
import { unexpectedSuccess } from './helpers';


describe('Dispensary', function() {

  it('should default to DEFAULT_LIBRARY_FILE constant for library JSON', () => {
    var dispensary = new Dispensary();
    assert.equal(dispensary.libraryFile, DEFAULT_LIBRARY_FILE);
  });

  it('should try to read and parse the library file supplied', () => {
    var dispensary = new Dispensary({
      _: ['./tests/test_libraries.json'],
    });
    assert.equal(dispensary.libraryFile, './tests/test_libraries.json');
    dispensary.getLibraries()
      .then((libraries) => {
        assert.equal(libraries.angular.minVersion, '2.0.0');
        assert.equal(Object.keys(libraries).length, 1);
      });
  });

  it('should try to read and parse the library file supplied', () => {
    var dispensary = new Dispensary({
      _: ['whatever-foo-bar'],
    });
    assert.equal(dispensary.libraryFile, 'whatever-foo-bar');
    dispensary.getLibraries()
      .then(unexpectedSuccess)
      .catch((err) => {
        assert.instanceOf(err, Error);
        assert.equal(err.message,
                     'whatever-foo-bar does not exist or is not a file.')
      });
  });

  it('should store versions', () => {
    assert.ok(true);
  });

});
