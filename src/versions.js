import request from 'request';

import { uniqueArray } from 'utils';


export function getVersions(repo, libraryInfo={}, _request=request) {
  if (!libraryInfo || !Object.keys(libraryInfo).length) {
    return Promise.reject(new Error(`No library info supplied for "${repo}"`));
  }

  var versions = _getVersionsFromLibraries(repo, libraryInfo) || [];

  if (libraryInfo.useNPM) {
    return _getVersionsFromNPM(repo, libraryInfo, _request)
      .then((versionsFromNPM) => {
        return uniqueArray(versions.concat(versionsFromNPM)).sort((a, b) => {
          return parseFloat(a) > parseFloat(b);
        });
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  return Promise.resolve(versions);
}

function _getVersionsFromNPM(repo, libraryInfo, _request=request) {
  return new Promise((resolve, reject) => {
    _request.get({
      json: true,
      url: `https://registry.npmjs.org/${repo}`,
    }, (err, response, data) => {
      if (response.statusCode !== 200) {
        return reject(
          new Error(`node module "${repo}" not found or an error occured.`));
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
