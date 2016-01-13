import cli_ from 'cli';


var cli;

describe('Basic CLI tests', function() {

  beforeEach(() => {
    // Override yargs fail func so we can introspect the right errors
    // are happening when we hand it bogus input.
    this.fakeFail = sinon.stub();
    cli = cli_.exitProcess(false).fail(this.fakeFail);
  });

  it('should default logLevel type to "fatal"', () => {
    // This means by default there won't be any output.
    var args = cli.parse(['angular']);
    assert.equal(args.logLevel, 'fatal');
    assert.equal(args['log-level'], 'fatal');
  });

  it('should default max HTTP requests to 35', () => {
    var args = cli.parse(['angular']);
    assert.equal(args.max, '35');
  });

  it('should default add-on output to "json"', () => {
    var args = cli.parse(['angular']);
    assert.equal(args.output, 'json');
    assert.equal(args.o, 'json');
  });

  it('should default stack to false', () => {
    var args = cli.parse(['angular']);
    assert.equal(args.stack, false);
  });

  it('should default pretty to false', () => {
    var args = cli.parse(['angular']);
    assert.equal(args.pretty, false);
  });

  it('should default boring to false', () => {
    var args = cli.parse(['angular']);
    assert.equal(args.boring, false);
  });

  it('should not error with no arguments', () => {
    cli.parse([]);
    assert.notOk(this.fakeFail.calledWithMatch(
      'Should not fail with zero arguments'));
  });

  it('should show error if incorrect output', () => {
    cli.parse(['-o', 'false', 'whatevs']);
    assert.ok(
      this.fakeFail.calledWithMatch(
        'Invalid values:\n  Argument: output, Given: "false"'));
  });

});
