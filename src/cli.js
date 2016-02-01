import argv from 'yargs';

import { version } from 'json!../package';


export default argv
  // jscs:disable
  .usage('Usage: ./$0 [options] library-json-file \n\n' +
    'Mozilla Dispensary v' + version)
  // jscs:enable
  .option('log-level', {
    describe: 'The log-level to generate',
    type: 'string',
    default: 'fatal',
    choices: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
  })
  .option('output', {
    alias: 'o',
    describe: 'The type of output to generate',
    type: 'string',
    default: 'json',
    choices: ['json', 'text'],
  })
  .option('pretty', {
    describe: 'Prettify JSON output',
    type: 'boolean',
    default: false,
  })
  .option('max', {
    describe: 'Maximum number of concurrent HTTP requests',
    type: 'string',
    default: '35',
  })
  .option('stack', {
    describe: 'Show stacktraces when errors are thrown',
    type: 'boolean',
    default: false,
  })
  .option('boring', {
    describe: 'Disables colorful shell output',
    type: 'boolean',
    default: false,
  })
  .demand(0)
  .help('help')
  .alias('h', 'help');
