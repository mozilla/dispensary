import createHash from 'sha.js';

import log from 'logger';


class Hasher {

  constructor(packageName, files) {
    this.files = files;
    this.packageName = packageName;
  }

  generate() {
    return new Promise((resolve) => {
      log.debug(
        `${this.packageName}: ${Object.keys(this.versions).length} versions.`);

      for (let i in this.files) {
        if (this.files[i].contents) {
          this.files[i].hash = Hasher.makeHash(this.files[i].contents);
        } else {
          console.log(this.files[i].packageName, 'err');
        }
      }

      resolve(this.files);
    });
  }
}

Hasher.makeHash = (string) => {
  return createHash('sha256').update(string, 'utf8').digest('hex');
};

export default Hasher;
