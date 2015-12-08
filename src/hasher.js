import createHash from 'sha.js';


class Hasher {
  constructor(packageName, versions) {
    this.packageName = packageName;
    this.versions = versions;
  }

  generate() {
    return new Promise((resolve) => {
      console.log(
        `${this.packageName}: ${Object.keys(this.versions).length} versions.`);

      resolve();
      // runVersions({
      //   bail: true,
      //   name: this.packageName,
      //   command: `echo $PWD >> ./test.txt`,
      //   versions: this.versions,
      // }, (results) => {
      //   console.log('done', results);
      //   resolve(results);
      // }).on('result', (version, result) => {
      //   console.log(`${this.packageName}: version ${version}`);
      //   console.log(version, result);
      // });
    });
  }
}

Hasher.makeHash = (string) => {
  return createHash('sha256').update(string, 'utf8').digest('hex');
};

export default Hasher;
