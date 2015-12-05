import request from 'request';


export function getVersions(repo, _request=request) {
  return new Promise((resolve, reject) => {
    _request.get({
      json: true,
      url: `https://registry.npmjs.org/${repo}`,
    }, (err, response, data) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Repo ${repo} not found or an error occured.`));
      }

      var versions = Object.keys(data.versions);
      resolve(versions);
    });
  });
}
