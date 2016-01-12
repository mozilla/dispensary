import fs from 'fs';

import async from 'async';
import request from 'request';

import { DEFAULT_HAHES_FILE, DEFAULT_LIBRARY_FILE } from 'const';
import hasher from 'hasher';
import log from 'logger';


function fileFormat(url, {file=null, version=null}={}) {
  if (!file || !version) {
    throw new Error('ArgumentError: File and version are required.');
  }

  return url.replace('$VERSION', version)
            .replace('$FILENAME', file)
            .replace('$VERSION', version)
            .replace('$FILENAME', file);
}

export default class Dispensary {

  constructor(config={}, _libraries=null) {
    this._libraries = _libraries;
    this.libraryFile = DEFAULT_LIBRARY_FILE;
    this.hashesFile = DEFAULT_HAHES_FILE;

    if (config._ && config._[0]) {
      this.libraryFile = config._[0];
    }

    this.maxHTTPRequests = parseInt(config.max);
  }

  run() {
    return this.getLibraries()
      .then((libraries) => {
        return this.getVersions(libraries);
      })
      .then((libraries) => {
        return this.getFiles(libraries);
      })
      .then((libraries) => {
        return this.getHashes(libraries);
      })
      .then((libraries) => {
        return this.outputHashes(libraries);
      })
      .catch((err) => {
        console.error('ERROR', err);
      });
  }

  getLibraries() {
    if (this._libraries !== null) {
      return Promise.resolve(this._libraries);
    }

    try {
      var libraryJSON = fs.readFileSync(this.libraryFile);
      this._libraries = JSON.parse(libraryJSON);
      return Promise.resolve(this._libraries);
    } catch (err) {
      if (err.toString().match(/^SyntaxError/)) {
        return Promise.reject(new Error(
          `JSONError: ${this.libraryFile} is not valid JSON.`));
      }

      return Promise.reject(new Error(
        `${this.libraryFile} does not exist or is not a file.`));
    }
  }

  _getAllFilesFromLibrary(library) {
    var files = [];

    for (let version of library.versions) {
      if (library.filename) {
        files.push({
          file: library.filename,
          fileOut: library.filenameOutput || library.filename,
          library: library,
          version: version,
        });
      }

      if (library.filenameMinified) {
        files.push({
          file: library.filenameMinified,
          fileOut: library.filenameMinifiedOutput || library.filenameMinified,
          library: library,
          version: version,
        });
      }
    }

    return files;
  }

  getFiles(libraries) {
    return new Promise((resolve) => {

      var files = [];

      var queue = async.queue(this._getFile, this.maxHTTPRequests);
      queue.drain = function() {
        console.log('all items have been processed');
        resolve(libraries);
      };

      for (let i in libraries) {
        let library = libraries[i];

        if (!library.files) {
          library.files = [];
        }

        files = files.concat(this._getAllFilesFromLibrary(library));
      }

      queue.push(files);
      // return Promise.all(promises)
      //   .catch((err) => {
      //     console.log('getFiles err', err);
      //     return Promise.reject(err);
      //   });
    });
  }

  _getFile(fileInfo, callback) {
    var url = fileFormat(fileInfo.library.urlMin || fileInfo.library.url, {
      file: fileInfo.file,
      version: fileInfo.version,
    });

    log.debug(`Requesting ${url}`);
    console.log(`Requesting ${url}`);

    request.get({url: url}, (err, response, data) => {
      if (err || !response) {
        log.error(`${url} encountered an error: ${err}.`);
        console.log(`${url} encountered an error: ${err}.`);
        return callback(new Error(err));
      }

      if (response && response.statusCode !== 200) {
        log.warn(`${url} produced code ${response.statusCode}`);
        console.log(`${url} ${response.statusCode}`);
        return callback();
      }

      log.debug(`Downloaded ${url}`);

      fileInfo.library.files.push({
        contents: data,
        file: fileInfo.file,
        fileOut: fileInfo.fileOut,
        version: fileInfo.version,
      });

      callback();
    });
  }

  getHashes(libraries) {
    for (let library of libraries) {
      for (let i in library.files) {
        library.files[i].hash = hasher(library.files[i].contents);
      }
    }

    return Promise.resolve(libraries);
  }

  getVersions(libraries) {
    var promises = [];

    for (let library of libraries) {
      if (library.useNPM) {
        // TODO: Get info from npm
        promises.push(Promise.resolve(library));
      } else {
        promises.push(Promise.resolve(library));
      }
    }

    return Promise.all(promises)
      .catch(Promise.reject);
  }

  outputHashes(libraries) {
    return new Promise((resolve) => {
      var hashes = new Set();

      if (this.hashesFile) {
        var cachedHashes = this._getCachedHashes(this.hashesFile);
        for (let i in cachedHashes) {
          hashes.add(cachedHashes[i]);
        }
      }

      var builtHashes = this._buildHashes(libraries);
      for (let i in builtHashes) {
        hashes.add(builtHashes[i]);
      }

      resolve(Array.from(hashes));
    });
  }

  _buildHashes(libraries) {
    var hashes = new Set();

    for (let library of libraries) {
      for (let i in library.files) {
        // jscs:disable
        let hashString = `${library.files[i].hash} ${library.name}.${library.files[i].version}.${library.files[i].fileOut}`; // eslint-disable-line
        // jscs:enable

        hashes.add(hashString);
      }
    }

    return Array.from(hashes);
  }

  _getCachedHashes(hashesPath) {
    return fs.readFileSync(hashesPath, 'utf8').split('\n');
  }

}
