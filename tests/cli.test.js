import cli_ from 'cli';

let cli;

describe('Basic CLI tests', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  beforeEach(() => {
    // Override yargs fail func so we can introspect the right errors
    // are happening when we hand it bogus input.
    testContext.fakeFail = sinon.stub();
    cli = cli_.exitProcess(false).fail(testContext.fakeFail);
  });

  it('should default logLevel type to "fatal"', () => {
    // This means by default there won't be any output.
    const args = cli.parse(['angular']);
    expect(args.logLevel).toEqual('fatal');
    expect(args['log-level']).toEqual('fatal');
  });

  it('should default max HTTP requests to 35', () => {
    const args = cli.parse(['angular']);
    expect(args.max).toEqual('35');
  });

  it('should default add-on output to "json"', () => {
    const args = cli.parse(['angular']);
    expect(args.output).toEqual('json');
    expect(args.o).toEqual('json');
  });

  it('should default stack to false', () => {
    const args = cli.parse(['angular']);
    expect(args.stack).toEqual(false);
  });

  it('should default pretty to false', () => {
    const args = cli.parse(['angular']);
    expect(args.pretty).toEqual(false);
  });

  it('should default boring to false', () => {
    const args = cli.parse(['angular']);
    expect(args.boring).toEqual(false);
  });

  it('should not error with no arguments', () => {
    cli.parse([]);
    expect(
      testContext.fakeFail.calledWithMatch(
        'Should not fail with zero arguments',
      ),
    ).toBeFalsy();
  });

  it('should show error if incorrect output', () => {
    cli.parse(['-o', 'false', 'whatevs']);
    expect(
      testContext.fakeFail.calledWithMatch(
        'Invalid values:\n  Argument: output, Given: "false"',
      ),
    ).toBeTruthy();
  });
});
