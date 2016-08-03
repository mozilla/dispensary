import fs from 'fs';

import { DEFAULT_LIBRARY_FILE } from 'const';
import Dispensary from 'dispensary';
import { getVersions } from 'versions';
import { unexpectedSuccess } from './helpers';


describe('Dispensary', function() {

  var fsSpy = sinon.spy(fs, 'readFileSync');

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

  it('should output an error if something explodes', () => {
    var dispensary = new Dispensary();

    var fakeConsole = {error: () => {}, log: () => {}};
    var consoleErrorSpy = sinon.spy(fakeConsole, 'error');
    sinon.stub(dispensary, 'getLibraries', () => {
      return Promise.reject(new Error('Error!'));
    });

    return dispensary.run(fakeConsole)
      .then(unexpectedSuccess)
      .catch((err) => {
        assert.equal(err.message, 'Error!');
        assert.ok(consoleErrorSpy.calledOnce);
      });
  });

  it('should send the update command and output', function() {
    this.timeout(15000);

    var dispensary = new Dispensary({
      _: ['update'],
      libraries: './tests/fixtures/test_libraries.json',
      pathToHashes: 'dist/hashes.txt',
    });

    var fakeConsole = {error: () => {}, log: () => {}};
    var consoleLogSpy = sinon.spy(fakeConsole, 'log');
    var updateSpy = sinon.spy(dispensary, 'updateCommand');

    sinon.stub(dispensary, '_getCachedHashes', () => {
      return [];
    });

    return dispensary.run(fakeConsole)
      .then(() => {
        assert.lengthOf(fs.readFileSync('dist/hashes.txt', 'utf8').split('\n'),
                        21);
        assert.ok(updateSpy.calledOnce);
        assert.ok(consoleLogSpy.calledOnce);
        assert.ok(consoleLogSpy.calledWith('hashes.txt updated successfully.'));
      });
  });

  it('should error if there was a problem updating hashes', function() {
    this.timeout(15000);

    var dispensary = new Dispensary({
      _: ['update'],
      libraries: './tests/fixtures/test_libraries.json',
      pathToHashes: 'dist/hashes.txt',
    });

    var fakeConsole = {error: () => {}, log: () => {}};
    var fakeFS = {
      writeFile: (filename, contents, options, callback) => {
        callback(new Error('Fail!'));
      },
    };

    sinon.stub(dispensary, '_getCachedHashes', () => {
      return [];
    });

    return dispensary.updateCommand([], fakeConsole, fakeFS)
      .then(unexpectedSuccess)
      .catch((err) => {
        assert.equal(err.message, 'UpdateError: Error: Fail!');
        assert.instanceOf(err, Error);
      });
  });

  it('should return an array of hashes', function() {
    this.timeout(15000);

    var dispensary = new Dispensary({
      libraries: './tests/fixtures/test_libraries.json',
    });
    var fakeConsole = {error: () => {}, log: () => {}};

    sinon.stub(dispensary, '_getCachedHashes', () => {
      return [];
    });

    return dispensary.run(fakeConsole)
      .then((hashes) => {
        assert.lengthOf(hashes, 20);
        assert.instanceOf(hashes, Array);
      });
  });

  it('should set files', function() {
    this.timeout(15000);

    var dispensary = new Dispensary({
      libraries: './tests/fixtures/test_libraries.json',
    });

    return dispensary.getLibraries()
      .then((libraries) => {
        return getVersions(libraries);
      })
      .then((libraries) => {
        return dispensary.getFiles(libraries);
      })
      .then((libraries) => {
        assert.equal(libraries[0].name, 'backbone');
        assert.lengthOf(libraries[0].files, 24);
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
    var getSpy = sinon.stub(dispensary, '_getCachedHashes', () => {
      return [h];
    });
    var match = dispensary.match('not a match');

    assert.notOk(match);
    assert.isTrue(getSpy.calledOnce);
  });

  it('should set hashes', function() {
    this.timeout(15000);
    var dispensary = new Dispensary({
      libraries: './tests/fixtures/test_libraries.json',
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
        assert.lengthOf(libraries[0].files, 32);
        assert.lengthOf(libraries[0].files.filter((file) => {
          return file.hash.length > 0;
        }), 32);
      });
  });

  it('should try to read and parse the library file supplied', () => {
    var dispensary = new Dispensary({
      libraries: './tests/fixtures/test_libraries.json',
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
      libraries: 'whatever-foo-bar',
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

  it('should return cached libraries after first call to getLibraries', () => {
    var dispensary = new Dispensary({
      libraries: './tests/fixtures/test_libraries.json',
    });

    fsSpy.reset();

    return dispensary.getLibraries()
      .then(() => {
        assert.ok(fsSpy.called);

        return dispensary.getLibraries();
      })
      .then(() => {
        assert.ok(fsSpy.calledOnce);
      });
  });

  it('should add cached hashes in outputHashes()', () => {
    var dispensary = new Dispensary({}, fakeLibraries);

    sinon.stub(dispensary, '_buildHashes', () => {
      return [];
    });

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
    var dispensary = new Dispensary({}, fakeLibraries);

    sinon.stub(dispensary, '_getCachedHashes', () => {
      return [];
    });

    return dispensary.outputHashes(fakeLibraries)
      .then((hashes) => {
        assert.instanceOf(hashes, Array);
        assert.lengthOf(hashes, 3);
      });
  });

  it('should output hashes in the correct format', () => {
    var dispensary = new Dispensary({
      libraries: 'tests/fixtures/test_libraries.json',
    });

    var hashes = dispensary._buildHashes(fakeLibraries);
    assert.instanceOf(hashes, Array);
    assert.lengthOf(hashes, 3);
    // jscs:disable
    assert.equal(hashes[0], '6657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6 myjslib.1.0.2.mylib.js'); // eslint-disable-line
    assert.equal(hashes[1], '4657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6 myjslib.1.0.4.mylib.min.js'); // eslint-disable-line
    // jscs:enable
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

  it('should pass an error to callback on non-200 responseCode', (done) => {
    var testAssert = ((err) => {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'ResponseError: 404');
      done();
    });
    var fakeRequest = {
      get: (params, callback) => {
        return callback(null, {statusCode: 404});
      },
    };

    var dispensary = new Dispensary();
    dispensary._getFile({
      library: {url: 'http://nowhere.bad.idontexist/$VERSION-$FILENAME.js'},
      file: 'mylib.js',
      version: '1.1.2',
    }, testAssert, fakeRequest);
  });

  it('should pass an error to callback on empty responseCode', (done) => {
    var testAssert = ((err) => {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'InvalidResponseError: undefined');
      done();
    });
    var fakeRequest = {
      get: (params, callback) => {
        return callback(null, {});
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
      libraries: 'fake.json',
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
        minified: false,
      },
      {
        file: 'mylibrary-$VERSION.js',
        fileOut: 'mylibrary.js',
        index: 2,
        library: library,
        version: '1.1.1',
        minified: false,
      },
    ]);
  });

  it('should respect minVersion', () => {
    var dispensary = new Dispensary();
    var library = {
      minVersion: '1.1.1',
      filename: 'mylibrary.js',
      versions: ['1.1.0', '1.1.1'],
    };
    var files = dispensary._getAllFilesFromLibrary(library, 2);

    assert.deepEqual(files, [
      {
        file: 'mylibrary.js',
        fileOut: 'mylibrary.js',
        index: 2,
        library: library,
        version: '1.1.1',
        minified: false,
      },
    ]);
  });

  it('should sort hashes output', () => {
    var dispensary = new Dispensary();
    sinon.stub(dispensary, '_getCachedHashes', () => {
      return [];
    });

    var fakeUnsortedLibraries = [
      {
        name: 'myzlib',
        files: [
          {
            // jscs:disable
            hash: '6657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6', // eslint-disable-line
            // jscs:enable
            fileOut: 'myzlib.js',
            version: '1.0.11',
          },
          {
            // jscs:disable
            hash: '8657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6', // eslint-disable-line
            // jscs:enable
            fileOut: 'myzlib.min.js',
            version: '1.0.9',
          },
        ],
        versions: ['1.0.11', '1.0.9'],
      },
      {
        name: 'myalib',
        files: [
          {
            // jscs:disable
            hash: '7657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6', // eslint-disable-line
            // jscs:enable
            fileOut: 'myalib.js',
            version: '1.1.99',
          },
        ],
        versions: ['1.1.99'],
      },
    ];

    return dispensary.outputHashes(fakeUnsortedLibraries).then((libraries) => {
      // jscs:disable
      assert.equal(libraries[0], '7657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6 myalib.1.1.99.myalib.js'); // eslint-disable-line
      assert.equal(libraries[1], '8657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6 myzlib.1.0.9.myzlib.min.js'); // eslint-disable-line
      assert.equal(libraries[2], '6657a7293da6afcd29e9243886725c8f90c8399e826dba9978e51a0a19e9bed6 myzlib.1.0.11.myzlib.js'); // eslint-disable-line
      // jscs:enable
    });
  });

  it('should construct the correct file download path', () => {
    var dispensary = new Dispensary();
    var library = {
      url: 'https://myserver.com/moment/moment/$VERSION/$FILENAME',
      urlMin: 'https://myserver.com/moment/moment/$VERSION/min/$FILENAME',
    };

    var file = {
      file: 'moment.js',
      fileOut: 'moment.js',
      library: library,
      version: '1.0.0',
      minified: false,
    };
    assert.equal(dispensary._buildDownloadURL(file),
      'https://myserver.com/moment/moment/1.0.0/moment.js');

    var fileMin = {
      file: 'moment.min.js',
      fileOut: 'moment.min.js',
      library: library,
      version: '1.0.0',
      minified: true,
    };
    assert.equal(dispensary._buildDownloadURL(fileMin),
      'https://myserver.com/moment/moment/1.0.0/min/moment.min.js');
  });

});
