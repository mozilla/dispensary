import request from 'request';


// Downloads a bunch of files based on version array and the data in
// libraries.json.
export default class Downloader {

  constructor(libraryName, versions, libraries) {
    this.library = libraries[libraryName];
    this.libraryName = libraryName;
    this.versions = versions;
  }

  getAll() {
    var promises = [];

    for (let version of this.versions) {
      var url = this.library.url.replace('$VERSION', version)
        .replace('$FILENAME', this.library.path);
      var minifiedURL = this.library.url.replace('$VERSION', version)
        .replace('$FILENAME', this.library.pathToMinified);

      promises.push(this.getFileFromURL(minifiedURL, version));
      promises.push(this.getFileFromURL(url, version));
    }

    return Promise.all(promises)
      .then((files) => {
        console.log('I HAVE BEEN RUN');
        console.log(files);
        return files;
      });
  }

  getFileFromURL(url, version, _request=request) {
    console.log(`Getting ${url}`);

    return new Promise((resolve) => {
      _request.get({
        url: url,
      }, (err, response, data) => {
        if (!response || response.statusCode !== 200) {
          return resolve(null);
        }

        console.log(`I got stuff for ${this.libraryName} ${version}`);

        resolve({
          contents: data,
          libraryName: this.libraryName,
          version: version,
        });
      });
    });
  }

}
