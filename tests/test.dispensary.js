import fs from 'fs';

import { DEFAULT_HAHES_FILE, DEFAULT_LIBRARY_FILE } from 'const';
import Dispensary from 'dispensary';
import { getVersions } from 'versions';
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
      versions: ['1.0.2', '1.0.4'],
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
      versions: ['1.0.2'],
    },
  ];

  it('should default to DEFAULT_LIBRARY_FILE constant for library JSON', () => {
    var dispensary = new Dispensary();
    assert.equal(dispensary.libraryFile, DEFAULT_LIBRARY_FILE);
  });

  it('should set files', function() {
    this.timeout(15000);
    var dispensary = new Dispensary({
      _: ['./tests/fixtures/test_libraries.json'],
    });

    return dispensary.getLibraries()
      .then((libraries) => {
        return getVersions(libraries);
      })
      .then((libraries) => {
        return dispensary.getFiles(libraries);
      })
      .then((libraries) => {
        assert.lengthOf(libraries[0].files, 8);
      });
  });

  it('should match a hash', () => {
    var h = '9320ea11f6d427aec4949634dc8676136b2fa8cdad289d22659b44541abb8c51';
    h += ' mylib.1.0.0.js';

    var dispensary = new Dispensary();
    var getSpy = sinon.stub(dispensary, '_getCachedHashes', () => {
      return [h];
    });
    var match = dispensary.match('hasher');

    assert.ok(match);
    assert.equal(match, 'mylib.1.0.0.js');
    assert.isTrue(getSpy.calledOnce);
  });

  it('should not match contents not in the hash array', () => {
    var h = '9320ea11f6d427aec4949634dc8676136b2fa8cdad289d22659b44541abb8c51';
    h += ' mylib.1.0.0.js';

    var dispensary = new Dispensary();
    var match = dispensary.match('not a match', null, [h]);

    assert.notOk(match);
  });

  it('should set hashes', function() {
    this.timeout(15000);
    var dispensary = new Dispensary({
      _: ['./tests/fixtures/test_libraries.json'],
    });

    return dispensary.getLibraries()
      .then((libraries) => {
        return getVersions(libraries);
      })
      .then((libraries) => {
        return dispensary.getFiles(libraries);
      })
      .then((libraries) => {
        return dispensary.getHashes(libraries);
      })
      .then((libraries) => {
        assert.lengthOf(libraries[0].files, 16);
        assert.lengthOf(libraries[0].files.filter((file) => {
          return file.hash.length > 0;
        }), 16);
      });
  });

  it('should try to read and parse the library file supplied', () => {
    var dispensary = new Dispensary({
      _: ['./tests/fixtures/test_libraries.json'],
    });
    assert.equal(dispensary.libraryFile,
                 './tests/fixtures/test_libraries.json');
    return dispensary.getLibraries()
      .then((libraries) => {
        assert.include(libraries[0].versions, '1.1.1');
        assert.equal(Object.keys(libraries).length, 2);
      });
  });

  it('should fail if the library does not exist', () => {
    var dispensary = new Dispensary({
      _: ['whatever-foo-bar'],
    });
    assert.equal(dispensary.libraryFile, 'whatever-foo-bar');

    return dispensary.getLibraries()
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

    return dispensary.outputHashes(fakeLibraries)
      .then(() => {
        assert.equal(cachedSpy.called, false);
      });
  });

  it('should return cached hashes after first call to _getCachedHashes', () => {
    var dispensary = new Dispensary();

    var fsSpy = sinon.spy(fs, 'readFileSync');

    dispensary._getCachedHashes(DEFAULT_HAHES_FILE, fs);
    assert.ok(fsSpy.called);
    dispensary._getCachedHashes(DEFAULT_HAHES_FILE, fs);
    assert.ok(fsSpy.calledOnce);
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

    return dispensary.outputHashes(fakeLibraries)
      .then((hashes) => {
        assert.instanceOf(hashes, Array);
        assert.lengthOf(hashes, 2);
        // jscs:disable
        assert.include(hashes, '1657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6 yui.2.7.0.mylib.js'); // eslint-disable-line
        // jscs:enable
        assert.equal(cachedStub.called, true);
      });
  });

  it('should resolve with an array in outputHashes()', () => {
    var dispensary = new Dispensary({
      _: ['whatever-foo-bar'],
    }, fakeLibraries, null);

    return dispensary.outputHashes(fakeLibraries)
      .then((hashes) => {
        assert.instanceOf(hashes, Array);
        assert.lengthOf(hashes, 3);
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

  it('should pass an error to callback on a bad request', (done) => {
    var testAssert = ((err) => {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'Error: Fail');
      done();
    });
    var fakeRequest = {
      get: (params, callback) => {
        return callback(new Error('Fail'));
      },
    };

    var dispensary = new Dispensary();
    dispensary._getFile({
      library: {url: 'http://nowhere.bad.idontexist/$VERSION-$FILENAME.js'},
      file: 'mylib.js',
      version: '1.1.2',
    }, testAssert, fakeRequest);
  });

  it('should encounter a JSONError when library JSON is bad', () => {
    var fakeFS = {
      readFileSync: () => {
        return '{"bad": "jsonData"';
      },
    };
    var dispensary = new Dispensary({
      _: ['fake.json'],
    });

    return dispensary.getLibraries(fakeFS)
      .then(unexpectedSuccess)
      .catch((err) => {
        assert.instanceOf(err, Error);
        assert.equal(err.message, 'JSONError: fake.json is not valid JSON.');
      });
  });

  it('should use filenameOutput if present', () => {
    var dispensary = new Dispensary();
    var library = {
      filename: 'mylibrary-$VERSION.js',
      filenameOutput: 'mylibrary.js',
      versions: ['1.1.0', '1.1.1'],
    };
    var files = dispensary._getAllFilesFromLibrary(library, 2);

    assert.deepEqual(files, [
      {
        file: 'mylibrary-$VERSION.js',
        fileOut: 'mylibrary.js',
        index: 2,
        library: library,
        version: '1.1.0',
      },
      {
        file: 'mylibrary-$VERSION.js',
        fileOut: 'mylibrary.js',
        index: 2,
        library: library,
        version: '1.1.1',
      },
    ]);
  });

});
