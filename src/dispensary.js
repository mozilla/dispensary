import fs from 'fs';

import request from 'request';

import { DEFAULT_LIBRARY_FILE } from 'const';
import hasher from 'hasher';
import log from 'logger';


export default class Dispensary {

  constructor(config={}, _libraries=null) {
    this._libraries = _libraries;
    this.libraryFile = './src/libraries.test.json' || DEFAULT_LIBRARY_FILE;

    if (config._ && config._[0]) {
      this.libraryFile = config._[0];
    }
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

  downloadFiles(library) {
    var promises = [];

    for (let version of library.versions) {
      if (library.filename) {
        promises.push(this.downloadForLibrary(library, {
          file: library.filename,
          version: version,
        }));
      }

      if (library.filenameMinified) {
        promises.push(this.downloadForLibrary(library, {
          file: library.filenameMinified,
          version: version,
        }));
      }
    }

    return Promise.all(promises)
      .then((results) => {
        library.files = results;

        return library;
      })
      .catch((err) => {
        console.log('download error', err);
        return Promise.reject(err);
      });
  }

  downloadForLibrary(library, {file=null, version=null}={}, _request=request) {
    return new Promise((resolve, reject) => {
      var url = library.url.replace('$VERSION', version)
                           .replace('$FILENAME', file)
                           .replace('$VERSION', version)
                           .replace('$FILENAME', file);
      log.debug(`Requesting ${url}`);

      _request.get({
        url: url,
      }, (err, response, data) => {
        if (err || !response || response.statusCode !== 200) {
          // log.debug(
          //   `response is not good (statusCode is ${response.statusCode})`);
          return reject(new Error(
            `RequestError: ${url}`));
        }

        // var versionKey = (minified === true) ? `${version}.min` : version;
        // log.debug(`Downloaded ${this.libraryName}-${versionKey}.js`);
        // console.log(`SUCCESS: ${url}`);

        resolve({
          contents: data,
          file: file,
          version: version,
        });
      });
    });
  }

  getFiles(libraries) {
    var promises = [];

    for (let library of libraries) {
      if (!library.files) {
        library.files = [];
      }

      if (library.filename) {
        promises.push(this.downloadFiles(library));
      }

      if (library.filenameMinified) {
        promises.push(this.downloadFiles(library));
      }
    }

    return Promise.all(promises)
      .catch((err) => {
        console.log('getFiles err', err);
        return Promise.reject(err);
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
    var hashes = new Set();

    for (let library of libraries) {
      for (let i in library.files) {
        // jscs:disable
        let hashString = `${library.files[i].hash} ${library.name}.${library.files[i].version}.${library.files[i].file}`; // eslint-disable-line
        // jscs:enable

        hashes.add(hashString);
      }
    }

    return Array.from(hashes);
  }

}
