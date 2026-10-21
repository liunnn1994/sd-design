import type { RegexVisDiagram, RegexVisGraphNode } from './layout.js';
import type {
  RegexVisFlag,
  RegexVisParseResult,
  RegexVisSelectInfo,
  RegexVisTranslate,
} from './types.js';

import { createRegexVisDiagram } from './layout.js';
import { parseRegex } from './parser/index.js';

export interface RegexVisState {
  modelValue: string;
  flags: RegexVisFlag[];
  selectedId: string | undefined;
  readonly selectable: boolean;
  readonly parseResult: RegexVisParseResult;
}

export function createRegexVisFoundation(
  state: RegexVisState,
  translate: RegexVisTranslate,
  onSelect: (info: RegexVisSelectInfo) => void,
) {
  const supportedFlags = new Set<RegexVisFlag>(['d', 'g', 'i', 'm', 's', 'u', 'y']);
  const getParseResult = () => parseRegex(state.modelValue, { flags: state.flags });
  const getParseError = () => (state.parseResult.type === 'error' ? state.parseResult : undefined);
  const getEffectiveFlags = () =>
    state.parseResult.type === 'regex' && state.parseResult.literal
      ? state.parseResult.flags
      : state.flags;
  const getDiagram = () => {
    if (state.parseResult.type === 'error' || !state.modelValue) return undefined;
    return createRegexVisDiagram(state.parseResult.body, translate);
  };
  const isRegexVisFlag = (value: string | number | boolean): value is RegexVisFlag =>
    typeof value === 'string' && supportedFlags.has(value as RegexVisFlag);
  const updateFlags = (value: (string | number | boolean)[]) => {
    const flags = value.filter(isRegexVisFlag);
    state.flags = flags;
    if (state.parseResult.type === 'regex' && state.parseResult.literal) {
      const literalEnd = state.modelValue.lastIndexOf('/');
      state.modelValue = `${state.modelValue.slice(0, literalEnd + 1)}${flags.join('')}`;
    }
  };
  const selectNode = (node: RegexVisGraphNode) => {
    if (!state.selectable) return;
    state.selectedId = node.id;
    onSelect({ node: node.node, label: node.label });
  };
  const getLiteralFlags = () =>
    state.parseResult.type === 'regex' && state.parseResult.literal
      ? state.parseResult.flags
      : undefined;
  const syncLiteralFlags = (flags: RegexVisFlag[] | undefined) => {
    if (
      flags &&
      (flags.length !== state.flags.length ||
        flags.some((flag, index) => flag !== state.flags[index]))
    ) {
      state.flags = [...flags];
    }
  };
  const syncDiagram = (nextDiagram: RegexVisDiagram | undefined) => {
    if (state.selectedId && !nextDiagram?.nodes.some((node) => node.id === state.selectedId)) {
      state.selectedId = undefined;
    }
  };
  return {
    getParseResult,
    getParseError,
    getEffectiveFlags,
    getDiagram,
    updateFlags,
    selectNode,
    getLiteralFlags,
    syncLiteralFlags,
    syncDiagram,
  };
}
