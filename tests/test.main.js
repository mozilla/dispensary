import Dispensary from 'dispensary';
import { createInstance } from 'main';

describe('Main Dispensary module', function() {

  it('should create an instance of Dispensary', () => {
    var dispensary = createInstance();
    assert.instanceOf(dispensary, Dispensary);
  });

});
