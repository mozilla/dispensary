import { getVersions } from 'versions';

import 'babel-core/polyfill';


export function main(repo) {
  return getVersions(repo)
    .then(() => {
      // console.log(results);
    })
    .catch(() => {
      // console.error(err);
    });
}
