import createHash from 'hasher';


describe('createHash() helper', function() {

  it('should generate a sha256 hash', () => {
    assert.equal(createHash('hasher'),
      '9320ea11f6d427aec4949634dc8676136b2fa8cdad289d22659b44541abb8c51');
  });

});
