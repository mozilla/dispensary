import Downloader from 'downloader';
import { FAKE_LIBRARIES } from './helpers';


describe('Downloader', function() {

  it('should resolve with null when a non-200 status code is returned', () => {
    var downloader = new Downloader('angular', ['0.1.19'], FAKE_LIBRARIES);
    downloader.getFileFromURL('https://nowhere.noplace/I-DONT-EXIST', '0.1.19')
      .then((results) => {
        assert.isNull(results);
      });
  });

});
