import fs from 'fs';

import { DEFAULT_LIBRARY_FILE } from 'const';
import Downloader from 'downloader';
import Hasher from 'hasher';
import { getVersions } from 'versions';


export default class Dispensary {

  constructor(config={}, _libraries=null) {
    this._libraries = _libraries;
    this.libraryFile = DEFAULT_LIBRARY_FILE;

    if (config._ && config._[0]) {
      this.libraryFile = config._[0];
    }
  }

  run() {
    var promises = [];
    return this.getLibraries()
      .then((libraries) => {
        for (let libraryName of Object.keys(libraries)) {
          promises.push(this.processLibrary(libraryName));
        }

        return Promise.all(promises);
      })
      .then((results) => {
        var hashes = [];
        for (let r of results) {
          if (r && r.length) {
            hashes = hashes.concat(r);
          }
        }

        hashes = hashes.sort(function(a, b) {
          a = a.match(/[A-Za-z0-9]{64} (.*)(\.min)?\.js/)[2];
          b = b.match(/[A-Za-z0-9]{64} (.*)(\.min)?\.js/)[2];

          return a > b;
        });

        return hashes;
      })
      .catch((err) => {
        console.error('ERROR', err);
      });
  }

  processLibrary(libraryName) {
    var libraryInfo;
    var libraryVersions;

    return this.getLibraries()
      .then((libraries) => {
        libraryInfo = libraries;
        return;
      })
      .then(() => {
        return getVersions(libraryName, libraryInfo[libraryName]);
      })
      .then((versions) => {
        libraryVersions = versions;
        var downloader = new Downloader(libraryName, libraryVersions,
                                        libraryInfo);
        return downloader.getAll();
      })
      .then((files) => {
        var hasher = new Hasher(libraryName, files);
        return hasher.generate();
      })
      .then((results) => {
        var outputHashes = [];

        for (let i in results) {
          outputHashes.push(
            // jscs:disable
            `${results[i].hash} ${results[i].libraryName}.${results[i].versionWithMinified}.js` // eslint-disable-line
            // jscs:enable
          );
        }

        return outputHashes;
      })
      .catch((err) => {
        console.error(err);
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

}
