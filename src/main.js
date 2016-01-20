import cli from 'cli';
import Dispensary from 'dispensary';
import log from 'logger';


export function createInstance(config=cli.argv) {
  log.level(config.logLevel);
  log.info('Creating new Dispensary instance', { config: config });

  return new Dispensary(config);
}

export default Dispensary;
