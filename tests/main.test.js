import Dispensary from 'dispensary';
import { createInstance } from 'main';

describe('Main Dispensary module', () => {
  it('should create an instance of Dispensary', () => {
    const dispensary = createInstance();
    expect(dispensary).toBeInstanceOf(Dispensary);
  });
});
