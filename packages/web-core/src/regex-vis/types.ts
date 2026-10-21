import type { Flag, Node, RegexError } from './parser/ast.js';
import type { parseRegex } from './parser/index.js';

export type RegexVisFlag = Flag;
export type RegexVisNode = Node;
export type RegexVisError = RegexError;
export type RegexVisTranslate = (key: string, ...args: unknown[]) => string;
export type RegexVisSelectInfo = { node: RegexVisNode; label: string };
export type RegexVisParseResult = ReturnType<typeof parseRegex>;
