export function urlFormat(url, {filename=null, version=null}={}) {
  if (!filename || !version) {
    throw new Error('ArgumentError: File and version are required.');
  }

  // This allows us to process jQuery's URLs.
  return url.replace('$VERSION', version)
            .replace('$FILENAME', filename)
            .replace('$VERSION', version)
            .replace('$FILENAME', filename);
}
