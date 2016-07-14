import async from 'async';
import request from 'request';

import log from 'logger';


export function getVersions(libraries, maxRequests=35) {
  return new Promise((resolve) => {
    var queue = async.queue(_getVersionsFromNPM, maxRequests);

    queue.drain = function() {
      log.debug('All versions obtained.');
      resolve(libraries);
    };

    for (let library of libraries) {
      if (!library.versions) {
        library.versions = [];
      }
    }

    queue.push(libraries.filter((library) => {
      return library.useNPM === true;
    }));
  });
}

export function _getVersionsFromNPM(library, callback, _request=request) {
  var repo = library.name;

  _request.get({
    json: true,
    url: `https://registry.npmjs.org/${repo}`,
  }, (err, response, data) => {
    if (err || !response || response.statusCode !== 200) {
      var statusCode = 0;

      if (response && response.statusCode) {
        statusCode = response.statusCode;
      }

      log.info(
        `node module "${repo}" not found or an error occured`);
      return callback(new Error(
        `RequestError: npm "${repo}" (statusCode: ${statusCode})`));
    }

    _handleNPMResponseData(library, data);

    callback();
  });
}

export function _handleNPMResponseData(library, data) {
  var versions = Object.keys(data.versions).filter((version) => {
    return version.search(/(alpha|beta|rc)[.-]?\d+/g) === -1;
  });
  library.versions = library.versions.concat(versions);
}
