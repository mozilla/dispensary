import { DEFAULT_LIBRARY_FILE } from 'const';
import Dispensary from 'dispensary';
import { unexpectedSuccess } from './helpers';


describe('Dispensary', function() {

  var fakeLibraries = [
    {
      name: 'myjslib',
      files: [
        {
          // jscs:disable
          hash: '6657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6', // eslint-disable-line
          // jscs:enable
          fileOut: 'mylib.js',
          version: '1.0.2',
        },
        {
          // jscs:disable
          hash: '4657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6', // eslint-disable-line
          // jscs:enable
          fileOut: 'mylib.min.js',
          version: '1.0.4',
        },
      ],
    },
    {
      name: 'myotherlib',
      files: [
        {
          // jscs:disable
          hash: '1657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6', // eslint-disable-line
          // jscs:enable
          fileOut: 'otherjs.js',
          version: '1.0.2',
        },
      ],
    },
  ];

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

  it('should not get cachedHashes without a hashesFile', () => {
    var dispensary = new Dispensary({
      _: ['whatever-foo-bar'],
    }, fakeLibraries, null);

    var cachedSpy = sinon.spy(dispensary, '_getCachedHashes');

    dispensary.outputHashes(fakeLibraries)
      .then(() => {
        assert.equal(cachedSpy.called, false);
      });
  });

  it('should add cached hashes in outputHashes()', () => {
    var dispensary = new Dispensary({
      _: ['whatever-foo-bar'],
    }, fakeLibraries, 'fakeHashes.txt');

    sinon.stub(dispensary, '_buildHashes', (() => {
      return [];
    }));

    var cachedStub = sinon.stub(dispensary, '_getCachedHashes', () => {
      return [
        // jscs:disable
        '1657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6 yui.2.7.0.mylib.js', // eslint-disable-line
        '2657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6 yui.2.7.1.mylib.js', // eslint-disable-line
        // jscs:enable
      ];
    });

    dispensary.outputHashes(fakeLibraries)
      .then((hashes) => {
        assert.instanceOf(hashes, Array);
        assert.lengthOf(hashes, 2);
        // jscs:disable
        assert.includes(hashes, '1657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6 yui.2.7.0.mylib.js'); // eslint-disable-line
        // jscs:enable
        assert.equal(cachedStub.called, true);
      });
  });

  it('should resolve with an array in outputHashes()', () => {
    var dispensary = new Dispensary({
      _: ['whatever-foo-bar'],
    }, fakeLibraries, null);

    sinon.stub(dispensary, '_buildHashes', (() => {
      return fakeLibraries;
    }));

    dispensary.outputHashes()
      .then((hashes) => {
        assert.instanceOf(hashes, Array);
        assert.lengthOf(hashes, 0);
      });
  });

  it('should output hashes in the correct format', () => {
    var dispensary = new Dispensary({
      _: ['tests/fixtures/test_libraries.json'],
    });

    var hashes = dispensary._buildHashes(fakeLibraries);
    assert.instanceOf(hashes, Array);
    assert.lengthOf(hashes, 3);
    // jscs:disable
    assert.equal(hashes[0], '6657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6 myjslib.1.0.2.mylib.js'); // eslint-disable-line
    assert.equal(hashes[1], '4657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6 myjslib.1.0.4.mylib.min.js'); // eslint-disable-line
    // jscs:enable
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
