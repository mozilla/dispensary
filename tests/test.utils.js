import { urlFormat } from 'utils';

describe('urlFormat()', function() {

  it('should throw an error if missing arguments', () => {
    var url = 'http://download.com/$VERSION/$FILENAME';

    assert.throws(() => {
      urlFormat(url);
    }, Error, /ArgumentError/);

    assert.throws(() => {
      urlFormat(url, {filename: 'mylib.js'});
    }, Error, /ArgumentError/);

    assert.throws(() => {
      urlFormat(url, {version: '1.1.1'});
    }, Error, /ArgumentError/);
  });

  it('should process $FILENAME and $VERSION recursively', () => {
    var result = urlFormat('http://download.net/$VERSION/$FILENAME', {
      filename: 'mylib-$VERSION.js',
      version: '1.1.1',
    });

    assert.equal(result, 'http://download.net/1.1.1/mylib-1.1.1.js');
  });

});
