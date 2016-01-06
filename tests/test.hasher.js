import Hasher from 'hasher';


describe('Hasher', function() {

  it('should store package name', () => {
    var hasher = new Hasher('angular', ['1.0.0', '1.1.0']);
    assert.equal(hasher.packageName, 'angular');
  });

  it('should store package name', () => {
    var hasher = new Hasher('angular', ['1.0.0', '1.1.0']);
    assert.equal(hasher.packageName, 'angular');
  });

});
