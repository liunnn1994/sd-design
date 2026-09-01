import type * as AST from './ast';

import { removeBackslash } from './backslash';
import * as dict from './dict';
import Lexer from './lexer';
import * as patterns from './patterns';
import { TokenType } from './token';

const rangeEscapeCharacters: Record<string, string> = {
  'b': '\b',
  'f': '\f',
  'n': '\n',
  'r': '\r',
  't': '\t',
  'v': '\v',
  '0': '\0',
};

const decodeRangeCharacter = (raw: string) => {
  if (!raw.startsWith('\\') || /^\\[dDwWsS]$/.test(raw)) return raw;

  const escape = raw.slice(1);
  if (escape in rangeEscapeCharacters) return rangeEscapeCharacters[escape];
  if (/^c[A-Za-z]$/.test(escape)) return String.fromCharCode(escape.charCodeAt(1) % 32);
  if (/^x[0-9A-Fa-f]{2}$/.test(escape))
    return String.fromCharCode(Number.parseInt(escape.slice(1), 16));
  if (/^u[0-9A-Fa-f]{4}$/.test(escape))
    return String.fromCharCode(Number.parseInt(escape.slice(1), 16));
  if (/^u\{[0-9A-Fa-f]{1,6}\}$/.test(escape))
    return String.fromCodePoint(Number.parseInt(escape.slice(2, -1), 16));

  return escape;
};

export type Options = {
  escapeBackslash?: boolean;
  flags?: AST.Flag[];
  idGenerator?: (size?: number) => string;
};

export class Parser {
  regex: string;
  escapeBackslash = false;
  literal = false;
  flags: AST.Flag[] = [];
  message: string = '';
  lexer!: Lexer;
  groupIndex = 1;
  idGenerator: (size?: number) => string;
  constructor(regex: string, { idGenerator, escapeBackslash = false, flags = [] }: Options = {}) {
    this.regex = regex;
    this.escapeBackslash = escapeBackslash;
    this.flags = flags;
    let id = 0;
    this.idGenerator = idGenerator ?? (() => `regex-vis-${id++}`);
  }

  public parse(): AST.Regex | AST.RegexError {
    if (!this.validate()) {
      return { type: 'error', message: this.message };
    }
    this.lexer = new Lexer(this.regex, this.escapeBackslash, this.unicodeMode);

    const body = this.parseNodes();
    return {
      id: this.id(),
      type: 'regex',
      body,
      flags: this.flags,
      literal: this.literal,
      escapeBackslash: this.escapeBackslash,
    };
  }

  id() {
    return this.idGenerator();
  }

  get unicodeMode() {
    return this.flags.includes('u');
  }

  parseNodes(): AST.Node[] {
    const branches: AST.Node[][] = [];
    let nodes: AST.Node[] = [];

    const pushCharacterString = (str: string, quantifier: AST.Quantifier | null) => {
      let qStr = '';
      if (quantifier) {
        qStr = str.slice(-1);
        str = str.slice(0, str.length - 1);
      }
      if (str && nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        if (lastNode.type === 'character' && lastNode.kind === 'string' && !lastNode.quantifier) {
          lastNode.value += str;
          str = '';
        }
      }
      if (str) {
        nodes.push({
          id: this.id(),
          type: 'character',
          kind: 'string',
          value: str,
          quantifier: null,
        });
      }
      if (qStr) {
        nodes.push({
          id: this.id(),
          type: 'character',
          kind: 'string',
          value: qStr,
          quantifier,
        });
      }
    };

    while (true) {
      const {
        type,
        span: { start, end },
      } = this.lexer.read();
      switch (type) {
        case TokenType.GraphEnd:
        case TokenType.RegexBodyEnd: {
          if (branches.length > 0) {
            // make sure nodes not empty
            if (nodes.length === 0) {
              nodes.push({
                id: this.id(),
                type: 'character',
                kind: 'string',
                value: '',
                quantifier: null,
              });
            }
            branches.push(nodes);
            const choice: AST.Node = {
              id: this.id(),
              type: 'choice',
              branches,
            };
            return [choice];
          } else {
            return nodes;
          }
        }
        case TokenType.CharacterClass: {
          const value = this.regex.slice(start, end);
          const quantifier = this.parseQuantifier();
          nodes.push({
            id: this.id(),
            type: 'character',
            kind: 'class',
            value,
            quantifier,
          });
          break;
        }
        case TokenType.BackReference: {
          const ref =
            this.regex[start + 1] === 'k'
              ? this.regex.slice(start + 3, end - 1)
              : this.regex.slice(start + 1, end);
          const quantifier = this.parseQuantifier();
          nodes.push({
            id: this.id(),
            type: 'backReference',
            ref,
            quantifier,
          });
          break;
        }
        case TokenType.Assertion: {
          const value = this.regex.slice(start, end);
          let node: AST.Node = {
            id: this.id(),
            type: 'boundaryAssertion',
            kind: 'beginning',
          };
          switch (value) {
            case '\\b': {
              node = { ...node, kind: 'word', negate: false };
              break;
            }
            case '\\B': {
              node = { ...node, kind: 'word', negate: true };
              break;
            }
            case '$': {
              node = { ...node, kind: 'end' };
              break;
            }
          }
          nodes.push(node);
          break;
        }
        case TokenType.NormalCharacter: {
          const value = this.regex.slice(start, end);
          const quantifier = this.parseQuantifier();
          pushCharacterString(value, quantifier);
          break;
        }
        case TokenType.EscapedChar: {
          const value = this.regex.slice(end - 1, end);
          const quantifier = this.parseQuantifier();
          pushCharacterString(value, quantifier);
          break;
        }
        case TokenType.GroupStart: {
          const matches = this.lexer.readByRegex(patterns.lookAround);
          if (matches) {
            const lookAround = dict.lookAround.get(matches[0])!;
            nodes.push(this.parseLookAround(lookAround));
          } else {
            nodes.push(this.parseGroup());
          }
          break;
        }
        case TokenType.RangeStart: {
          nodes.push(this.parseRanges(start));
          break;
        }
        case TokenType.Choice: {
          // make sure nodes not empty
          if (nodes.length === 0) {
            nodes.push({
              id: this.id(),
              type: 'character',
              kind: 'string',
              value: '',
              quantifier: null,
            });
          }
          branches.push(nodes);
          nodes = [];
          break;
        }
      }
    }
  }

  parseQuantifier(): AST.Quantifier | null {
    let quantifier: AST.Quantifier | null = null;
    const target = this.lexer.readTargets(['?', '+', '*']);
    if (target) {
      switch (target) {
        case '?': {
          quantifier = { kind: '?', min: 0, max: 1, greedy: true };
          break;
        }
        case '+': {
          quantifier = { kind: '+', min: 1, max: Infinity, greedy: true };
          break;
        }
        case '*': {
          quantifier = { kind: '*', min: 0, max: Infinity, greedy: true };
          break;
        }
      }
    } else {
      const matches = this.lexer.readByRegex(patterns.quantifier);
      if (matches) {
        const min = Number.parseInt(matches[1]);
        let max = min;
        if (matches[2]) {
          max = Infinity;
          if (matches[3]) {
            max = Number.parseInt(matches[3]);
          }
        }
        quantifier = {
          kind: 'custom',
          min,
          max,
          greedy: true,
        };
      }
    }
    if (quantifier) {
      if (this.lexer.readTarget('?')) {
        quantifier.greedy = false;
      }
    }
    return quantifier;
  }

  parseRanges(rangeStart: number): AST.Node {
    const ranges: AST.Range[] = [];
    let negate = false;
    if (this.lexer.readTarget('^')) {
      negate = true;
    }
    let from: string | null = null;
    const pushCharacter = (value: string) => {
      ranges.push({ id: this.id(), from: value, to: value });
    };
    while (true) {
      const {
        type,
        span: { start, end },
      } = this.lexer.readRange();
      if (type === TokenType.RangeEnd) {
        break;
      }
      const raw = this.regex.slice(start, end);
      // \d \w \s（含大小写）与 \p{...} / \P{...} 是字符集，不能作为区间端点
      const isCharacterSet =
        type === TokenType.CharacterClass &&
        (/^\\[dDwWsS]$/.test(raw) || (this.unicodeMode && /^\\[pP]\{[^}]*\}$/.test(raw)));
      const value = decodeRangeCharacter(raw);
      if (from) {
        if (isCharacterSet) {
          pushCharacter(from);
          pushCharacter('-');
          pushCharacter(raw);
        } else {
          ranges.push({ id: this.id(), from, to: value });
        }
        from = null;
        continue;
      }
      if (!isCharacterSet && this.lexer.readTarget('-')) {
        from = value;
        continue;
      }
      pushCharacter(isCharacterSet ? raw : value);
    }
    if (from) {
      pushCharacter(from);
      pushCharacter('-');
    }
    const rangeEnd = this.lexer.index;
    const quantifier = this.parseQuantifier();
    return {
      id: this.id(),
      type: 'character',
      kind: 'ranges',
      raw: this.regex.slice(rangeStart, rangeEnd),
      ranges,
      negate,
      quantifier,
    };
  }

  parseGroup(): AST.Node {
    let group: AST.Group = { kind: 'nonCapturing' };
    const matches = this.lexer.readByRegex(patterns.namedCapturing);
    if (matches) {
      group = {
        kind: 'namedCapturing',
        name: matches[1],
        index: this.groupIndex++,
      };
    } else if (!this.lexer.readByRegex(patterns.nonCapturing)) {
      const index = this.groupIndex++;
      group = { kind: 'capturing', index, name: index.toString() };
    }
    const children = this.parseNodes();
    const quantifier = this.parseQuantifier();
    return {
      id: this.id(),
      type: 'group',
      ...group,
      children,
      quantifier,
    };
  }

  parseLookAround(lookAround: AST.LookAround): AST.Node {
    const children = this.parseNodes();
    const quantifier = this.parseQuantifier();
    return {
      id: this.id(),
      type: 'lookAroundAssertion',
      ...lookAround,
      children,
      quantifier,
    };
  }

  validate() {
    try {
      if (this.validateAsLiteral()) {
        this.literal = true;
      }
      let regex = this.regex;
      if (this.escapeBackslash) {
        regex = removeBackslash(regex);
      }
      // eslint-disable-next-line no-new
      new RegExp(regex, this.flags.join(''));
    } catch (error) {
      if (error instanceof Error) {
        this.message = error.message;
      }
      return false;
    }
    return true;
  }

  validateAsLiteral() {
    const start = this.regex.indexOf('/');
    const end = this.regex.lastIndexOf('/');
    if (start !== 0 || end === 0) {
      return false;
    }
    const flags = this.regex.slice(end + 1);
    // eslint-disable-next-line no-new
    new RegExp('', flags);
    this.flags = flags.split('') as AST.Flag[];
    this.regex = this.regex.slice(start + 1, end);
    return true;
  }
}
