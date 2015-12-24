import path from 'path';

export const DEFAULT_LIBRARY_FILE = global.appRoot ?
  path.join(global.appRoot, '../src/libraries.json') : './src/libraries.json';
