import type { Options } from './parser.js';

import { Parser } from './parser.js';

function parse(regex: string, options: Options = {}) {
  const parser = new Parser(regex, options);
  return parser.parse();
}

export default parse;
