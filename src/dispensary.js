import fs from 'fs';

import async from 'async';
import request from 'request';

import HASHES from 'hashes.txt';
import { COMMANDS } from 'const';
import createHash from 'hasher';
import log from 'logger';
import { urlFormat } from 'utils';
import { getVersions } from 'versions';

import naturalCompare from 'natural-compare-lite';


// HACK: We use this global for now to store files inside the async queue.
var _files = [];

export default class Dispensary {

  constructor(config={}, _libraries=null) {
    this._cachedHashes = null;
    this._libraries = _libraries;
    this._pathToHashes = './src/hashes.txt';
    // Default command is "output"
    this.command = COMMANDS.default;
    this.libraryFile = config.libraries;
    this.maxHTTPRequests = 35;

    // The `config._` array is from yargs; it is all CLI arguments passed
    // to bin/dispensary that aren't option arguments. If you ran:
    //
    //     bin/dispensary --stack=true update
    //
    // config._[0] would equal 'update'
    if (config._ && config._[0]) {
      this.command = config._[0];
    }

    if (config) {
      if (config.max) {
        this.maxHTTPRequests = parseInt(config.max);
      }

      if (config.pathToHashes) {
        this._pathToHashes = config.pathToHashes;
      }
    }
  }

  run(_console=console) {
    return this.getLibraries()
      .then((libraries) => {
        return getVersions(libraries);
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
      .then((hashes) => {
        return this[`${this.command}Command`](hashes, _console);
      })
      .catch((err) => {
        _console.error('ERROR', err);

        throw err;
      });
  }

  // Output command; this is the default and just echoes out all hashes
  outputCommand(hashes, _console) {
    _console.log(hashes.join('\n'));

    return Promise.resolve(hashes);
  }

  // Update command; this gets all hashes and writes them to hashes.txt
  updateCommand(hashes, _console, _fs=fs) {
    return new Promise((resolve) => {
      _fs.writeFile(this._pathToHashes, `${hashes.join('\n')}\n`, 'utf8',
      (err) => {
        if (err) {
          throw new Error(`UpdateError: ${err}`);
        }

        _console.log('hashes.txt updated successfully.');

        resolve(hashes);
      });
    });
  }

  // Matches only against cached hashes; this is the API external apps and
  // libraries would use.
  match(contents) {
    if (this._cachedHashes === null) {
      this._cachedHashes = {};

      for (let hashEntry of this._getCachedHashes()) {
        let hash = hashEntry.split(' ')[0];
        let library = hashEntry.split(' ')[1];

        this._cachedHashes[hash] = library;
      }
    }

    var contentsHash = createHash(contents);

    if (this._cachedHashes.hasOwnProperty(contentsHash)) {
      return this._cachedHashes[contentsHash];
    }

    return false;
  }

  getLibraries(_fs=fs) {
    if (this._libraries !== null) {
      return Promise.resolve(this._libraries);
    }

    try {
      var libraryJSON = _fs.readFileSync(this.libraryFile);
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

  _getAllFilesFromLibrary(library, index) {
    var files = [];

    for (let version of library.versions) {
      var minVersion = library.minVersion;
      // If there is a `minVersion`,
      // make sure `version` is equal or higher than `minVersion`.
      // `naturalCompare` behaves like an ordinary 'compare'.
      if (!minVersion ||
           (minVersion && naturalCompare(minVersion, version) <= 0)) {
        if (library.filename) {
          files.push({
            file: library.filename,
            fileOut: library.filenameOutput || library.filename,
            index: index,
            library: library,
            version: version,
            minified: false,
          });
        }

        if (library.filenameMinified) {
          files.push({
            file: library.filenameMinified,
            fileOut: library.filenameMinifiedOutput || library.filenameMinified,
            index: index,
            library: library,
            version: version,
            minified: true,
          });
        }
      }
    }

    return files;
  }

  getFiles(libraries, referenceFiles=_files) {
    return new Promise((resolve) => {
      var files = [];
      var queue = async.queue(this._getFile.bind(this),
        this.maxHTTPRequests || 35);

      queue.drain = () => {
        log.debug('All downloads completed.');

        for (let file of referenceFiles) {
          if (file.index && libraries[file.index] &&
              libraries[file.index].files) {
            libraries[file.index].files.push(file);
          } else {
            throw new Error(`File or index not found: ${file}`);
          }
        }

        resolve(libraries);
      };

      for (let i in libraries) {
        let library = libraries[i];

        if (!library.files) {
          library.files = [];
        }

        files = files.concat(this._getAllFilesFromLibrary(library, i));
      }

      queue.push(files);
    });
  }

  _buildDownloadURL(fileInfo) {
    var base = fileInfo.library.url;
    if (fileInfo.minified && fileInfo.library.urlMin) {
      base = fileInfo.library.urlMin;
    }
    return urlFormat(base, {
      filename: fileInfo.file,
      version: fileInfo.version,
    });
  }

  _getFile(fileInfo, callback, _request=request) {
    var url = this._buildDownloadURL(fileInfo);
    log.debug(`Requesting ${url}`);

    var processResponse = (err, response, data) => {
      if (err || !response) {
        log.error(`${url} encountered an error: ${err}.`);
        return callback(new Error(err));
      }

      if (response && response.statusCode && response.statusCode !== 200) {
        log.warn(`${url} produced code ${response.statusCode}`);
        return callback(new Error(
          `ResponseError: ${response.statusCode}`));
      } else if (response && !response.statusCode) {
        log.warn(
          `${url} has an invalid response code (${response.statusCode})`);
        return callback(new Error(
          `InvalidResponseError: ${response.statusCode}`));
      }

      log.debug(`Downloaded ${url}`);

      _files.push({
        contents: data,
        file: fileInfo.file,
        fileOut: fileInfo.fileOut,
        index: fileInfo.index,
        version: fileInfo.version,
      });

      callback();
    };

    _request.get({url: url}, processResponse);
  }

  getHashes(libraries) {
    for (let library of libraries) {
      for (let file of library.files) {
        file.hash = createHash(file.contents);
      }
    }

    return Promise.resolve(libraries);
  }

  outputHashes(libraries) {
    return new Promise((resolve) => {
      var hashes = new Set();

      for (let hash of this._getCachedHashes()) {
        hashes.add(hash);
      }

      for (let hash of this._buildHashes(libraries)) {
        hashes.add(hash);
      }

      var hashesArray = Array.from(hashes).sort((a, b) => {
        // a, b look like "<HASH> <FILENAME>",
        // The regex finds the filename and uses it for natural sorting
        var getFileName = /\s+(.*)/;
        return naturalCompare(a.match(getFileName)[1], b.match(getFileName)[1]);
      });

      resolve(hashesArray);
    });
  }

  _buildHashes(libraries) {
    var hashes = new Set();

    for (let library of libraries) {
      for (let file of library.files) {
        // jscs:disable
        let hashString = `${file.hash} ${library.name}.${file.version}.${file.fileOut}`; // eslint-disable-line
        // jscs:enable

        hashes.add(hashString);
      }
    }

    return Array.from(hashes);
  }

  _getCachedHashes() {
    return HASHES.split('\n').filter((value) => {
      return value && value.length > 0 && value.substr(0, 1) !== '#';
    });
  }

}
