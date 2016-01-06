import request from 'request';


// Downloads a bunch of files based on version array and the data in
// libraries.json.
export default class Downloader {

  constructor(libraryName, versions, libraries) {
    this.library = libraries[libraryName];
    this.libraryName = libraryName;
    this.versions = versions;

    this.files = {};
  }

  getAll() {
    var promises = [];

    for (let version of this.versions) {
      // console.log(version);
      var url = this.library.url.replace('$VERSION', version)
        .replace('$FILENAME', this.library.path);
      var minifiedURL = this.library.url.replace('$VERSION', version)
        .replace('$FILENAME', this.library.pathToMinified);

      promises.push(this.getFileFromURL(minifiedURL, version,
                                        {minified: true}));
      promises.push(this.getFileFromURL(url, version));
    }

    return Promise.all(promises)
      .then(() => {
        console.log('I HAVE BEEN RUN');
        // console.log(files);
        return this.files;
      });
  }

  getFileFromURL(url, version, {minified=false}={}, _request=request) {
    console.log(`Getting ${url}`);

    return new Promise((resolve) => {
      _request.get({
        url: url,
      }, (err, response, data) => {
        if (!response || response.statusCode !== 200) {
          return resolve(null);
        }

        var versionKey = (minified === true) ? `${version}.min` : version;
        this.files[versionKey] = {
          contents: data,
          libraryName: this.libraryName,
          minified: minified,
          version: version,
          versionWithMinified: versionKey,
        };

        // console.log(`I got stuff for ${this.libraryName}-${versionKey}.js`);

        resolve();
      });
    });
  }

}
