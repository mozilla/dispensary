import Downloader from 'downloader';
import { FAKE_LIBRARIES, unexpectedSuccess } from './helpers';


describe('Downloader', function() {

  it('should reject when a non-200 status code is returned', () => {
    var badjQueryLibraryInfo = {
      versions: ['0.7.4'],
      path: '.js',
      url: 'http://code.jquery.com/jquery-$VERSION$FILENAME',
    };

    var downloader = new Downloader('jquery', badjQueryLibraryInfo.versions,
                                    {jquery: badjQueryLibraryInfo});
    downloader.getAll()
    //  .then(unexpectedSuccess)
    // downloader.getFile(FAKE_LIBRARIES.angular.url, {
    //   filename: badjQueryLibraryInfo.path,
    //   version: badjQueryLibraryInfo.versions[0],
    // }).then(unexpectedSuccess)
      .catch((err) => {
        console.log(err);
        assert.instanceOf(err, Error);
        // jscs:disable
        assert.equal(err.message, 'RequestError: (https://ajax.googleapis.com/ajax/libs/asngularjs/0.1.19/angular.js: 404) null'); // eslint-disable-line
        // jscs:enable
      });
  });

  it('should return all files downloaded', () => {
    var downloader = new Downloader('angular', ['1.0.1'], FAKE_LIBRARIES);
    downloader.getAll()
      .then((files) => {
        assert.isNotNull(files);
      });
  });

  it('should error if filename is not provided', () => {
    var downloader = new Downloader('angular', ['1.0.1'], FAKE_LIBRARIES);
    downloader.getFile(FAKE_LIBRARIES.angular.url, {
      minified: false,
      version: '1.0.1',
    }).then(unexpectedSuccess)
      .catch((err) => {
        assert.instanceOf(err, Error);
        assert.equal(err.message, 'ArgumentError: filename param missing');
      });
  });

  it('should error if version is not provided', () => {
    var downloader = new Downloader('angular', ['1.0.1'], FAKE_LIBRARIES);
    downloader.getFile(FAKE_LIBRARIES.angular.url, {
      filename: 'angular.js',
      minified: false,
    }).then(unexpectedSuccess)
      .catch((err) => {
        assert.instanceOf(err, Error);
        assert.equal(err.message, 'ArgumentError: version param missing');
      });
  });

  it('should error if filename and version are not provided', () => {
    var downloader = new Downloader('angular', ['1.0.1'], FAKE_LIBRARIES);
    downloader.getFile(FAKE_LIBRARIES.angular.url, {
      minified: false,
    }).then(unexpectedSuccess)
      .catch((err) => {
        assert.instanceOf(err, Error);
        assert.equal(err.message, 'ArgumentError: filename param missing');
      });
  });

  it('should not be flagged as minified by default', () => {
    var downloader = new Downloader('angular', ['1.0.1'], FAKE_LIBRARIES);
    downloader.getFile(FAKE_LIBRARIES.angular.url, {
      filename: 'angular.js',
      version: '1.0.1',
    }).then((file) => {
      assert.equal(file.minified, false);
      assert.equal(file.versionKey, '1.0.1');
    });
  });

  it('should not be flagged as minified', () => {
    var downloader = new Downloader('angular', ['1.0.1'], FAKE_LIBRARIES);
    downloader.getFile(FAKE_LIBRARIES.angular.url, {
      filename: 'angular.js',
      minified: false,
      version: '1.0.1',
    }).then((file) => {
      assert.equal(file.minified, true);
      assert.equal(file.versionKey, '1.0.1');
    });
  });

  it('should flag a file as minified and modify its versionKey', () => {
    var downloader = new Downloader('angular', ['1.0.1'], FAKE_LIBRARIES);
    downloader.getFile(FAKE_LIBRARIES.angular.url, {
      filename: 'angular.min.js',
      minified: true,
      version: '1.0.1',
    }).then((file) => {
      assert.equal(file.minified, true);
      assert.equal(file.versionKey, '1.0.1.min');
    });
  });

});
