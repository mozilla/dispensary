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
      _: ['./tests/fixtures/test_libraries.json'],
    });
    assert.equal(dispensary.libraryFile,
                 './tests/fixtures/test_libraries.json');
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
                     'whatever-foo-bar does not exist or is not a file.');
      });
  });

  it('should load cached hashes', () => {
    var dispensary = new Dispensary({
      _: ['tests/fixtures/test_libraries.json'],
    });

    var hashes = dispensary._getCachedHashes('tests/fixtures/hashes.txt');
    // jscs:disable
    assert.equal('6657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6 yui.2.7.0.yuiloader-min.js', hashes[1]); // eslint-disable-line
    // jscs:enable
    assert.lengthOf(hashes, 23);
  });

  it('should return an empty array when no hash file exists', () => {
    var dispensary = new Dispensary({
      _: ['tests/fixtures/test_libraries.json'],
    });

    var hashes = dispensary._getCachedHashes('whatever-foo-bar');
    assert.instanceOf(hashes, Array);
    assert.lengthOf(hashes, 0);
  });

});
