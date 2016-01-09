import request from 'request';

import log from 'logger';
import { uniqueArray } from 'utils';


export function getVersions(repo, libraryInfo, _request=request) {
  return new Promise((resolve, reject) => {
    if (!libraryInfo) {
      return reject(new Error(`No library info supplied for "${repo}"`));
    }

    var versions = _getVersionsFromLibraries(repo, libraryInfo) || [];

    if (libraryInfo.useNPM) {
      return _getVersionsFromNPM(repo, libraryInfo, _request)
        .then((versionsFromNPM) => {
          // This just makes the file a bit prettier.
          var sortedVersions = uniqueArray(
            versions.concat(versionsFromNPM)
          ).sort((a, b) => {
            return parseFloat(a) > parseFloat(b);
          });

          resolve(sortedVersions);
        })
        .catch(reject);
    }

    resolve(versions);
  });
}

function _getVersionsFromNPM(repo, libraryInfo, _request=request) {
  return new Promise((resolve, reject) => {
    _request.get({
      json: true,
      url: `https://registry.npmjs.org/${repo}`,
    }, (err, response, data) => {
      if (err || !response || response.statusCode !== 200) {
        log.info(
          `node module "${repo}" not found or an error occured`);
        return reject(new Error(
          `RequestError: npm "${repo}" (statusCode: ${response.statusCode})`));
      }

      var versions = Object.keys(data.versions);
      resolve(versions);
    });
  });
}

function _getVersionsFromLibraries(repo, libraryInfo) {
  if (libraryInfo.versions && libraryInfo.versions.length) {
    return libraryInfo.versions;
  } else {
    return null;
  }
}
