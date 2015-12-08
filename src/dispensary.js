import Hasher from 'hasher';
import { getVersions } from 'versions';


export default class Dispensary {

  constructor(config) {
    this.libraryName = config._[0];
  }

  run() {
    return getVersions(this.libraryName)
      .then((versions) => {
        var hasher = new Hasher(this.libraryName, versions);
        return hasher.generate();
      })
      .then((results) => {
        console.log(results);
      })
      .catch((err) => {
        console.error(err);
      });
  }

}
