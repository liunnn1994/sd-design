import type { InputMaskPattern, InputMaskSelection, InputMaskToken } from './types';

import {
  codeUnitToGraphemeIndex,
  graphemeIndexToCodeUnit,
  splitGraphemes,
} from '../_utils/grapheme';

interface ParsedMaskToken {
  literal?: string;
  pattern?: RegExp;
}

interface LayoutPosition {
  /** Rendered characters for this position (a grapheme cluster or literal). */
  char: string;
  literal: boolean;
  filled: boolean;
}

export interface FormatMaskOptions {
  maskChar: string | null;
  showMask: boolean;
  formatChars?: Readonly<Record<string, RegExp>>;
}

export interface FormatMaskResult {
  value: string;
  selection: InputMaskSelection;
  complete: boolean;
}

export const defaultInputMaskFormatChars: Readonly<Record<string, RegExp>> = {
  '9': /[0-9]/,
  'a': /[A-Za-z]/,
  '*': /[A-Za-z0-9]/,
  'H': /\p{Script=Han}/u,
  'L': /\p{Letter}/u,
  'N': /[\p{Letter}\p{Number}]/u,
};

const matches = (pattern: RegExp, character: string) => {
  pattern.lastIndex = 0;
  return pattern.test(character);
};

const parseStringMask = (
  mask: string,
  formatChars: Readonly<Record<string, RegExp>>,
): ParsedMaskToken[] => {
  const tokens: ParsedMaskToken[] = [];
  let escaped = false;

  for (const character of Array.from(mask)) {
    if (!escaped && character === '\\') {
      escaped = true;
      continue;
    }

    const pattern = !escaped ? formatChars[character] : undefined;
    tokens.push(pattern ? { pattern } : { literal: character });
    escaped = false;
  }

  if (escaped) tokens.push({ literal: '\\' });
  return tokens;
};

const parseMask = (
  mask: InputMaskPattern,
  formatChars: Readonly<Record<string, RegExp>>,
): ParsedMaskToken[] => {
  if (typeof mask === 'string') return parseStringMask(mask, formatChars);
  return mask.map((token: InputMaskToken) =>
    token instanceof RegExp ? { pattern: token } : { literal: token },
  );
};

const mergeFormatChars = (formatChars?: Readonly<Record<string, RegExp>>) => ({
  ...defaultInputMaskFormatChars,
  ...formatChars,
});

const readEditableCharacters = (
  rawValue: string,
  tokens: readonly ParsedMaskToken[],
  maskChar: string | null,
) => {
  const input = splitGraphemes(rawValue);
  const values: string[] = [];
  let inputIndex = 0;

  for (const token of tokens) {
    if (token.literal !== undefined) {
      if (input[inputIndex] === token.literal) inputIndex += 1;
      continue;
    }

    while (inputIndex < input.length) {
      const character = input[inputIndex++];
      if (maskChar && character === maskChar) continue;
      if (token.pattern && matches(token.pattern, character)) {
        values.push(character);
        break;
      }
    }
  }

  return values;
};

const buildLayout = (
  tokens: readonly ParsedMaskToken[],
  values: readonly string[],
  maskChar: string | null,
  showMask: boolean,
): LayoutPosition[] => {
  const positions: LayoutPosition[] = [];
  // The full placeholder template is only meaningful when a maskChar exists.
  // Without one, only literals adjacent to filled positions are rendered, so a
  // partial value never shows stray trailing separators.
  const showTemplate = showMask && Boolean(maskChar);
  let valueIndex = 0;
  let previousEditableFilled = false;

  for (const token of tokens) {
    if (token.literal !== undefined) {
      if (showTemplate || valueIndex < values.length || previousEditableFilled) {
        positions.push({ char: token.literal, literal: true, filled: false });
      }
      previousEditableFilled = false;
      continue;
    }

    const value = values[valueIndex];
    if (value !== undefined) {
      positions.push({ char: value, literal: false, filled: true });
      valueIndex += 1;
      previousEditableFilled = true;
    } else if (showTemplate) {
      positions.push({ char: maskChar as string, literal: false, filled: false });
      previousEditableFilled = false;
    } else {
      previousEditableFilled = false;
    }
  }

  return positions;
};

const renderMask = (
  tokens: readonly ParsedMaskToken[],
  values: readonly string[],
  maskChar: string | null,
  showMask: boolean,
) => {
  if (!values.length && !showMask) return '';
  return buildLayout(tokens, values, maskChar, showMask)
    .map((position) => position.char)
    .join('');
};

const sliceToGraphemeBoundary = (value: string, cursor: number) => {
  const graphemeIndex = codeUnitToGraphemeIndex(value, cursor);
  return value.slice(0, graphemeIndexToCodeUnit(value, graphemeIndex));
};

export function formatInputMask(
  rawValue: string,
  rawCursor: number | null,
  mask: InputMaskPattern,
  options: FormatMaskOptions,
): FormatMaskResult {
  const formatChars = mergeFormatChars(options.formatChars);
  const tokens = parseMask(mask, formatChars);
  const values = readEditableCharacters(rawValue, tokens, options.maskChar);
  const value = renderMask(tokens, values, options.maskChar, options.showMask);
  const editableCount = tokens.filter((token) => token.pattern).length;

  const prefix = rawCursor === null ? rawValue : sliceToGraphemeBoundary(rawValue, rawCursor);
  const prefixValues = readEditableCharacters(prefix, tokens, options.maskChar);
  const cursorValue = renderMask(tokens, prefixValues, null, false);
  const cursor = Math.min(cursorValue.length, value.length);

  return {
    value,
    selection: { start: cursor, end: cursor },
    complete: values.length === editableCount,
  };
}

const layoutOffset = (positions: readonly LayoutPosition[], index: number) => {
  let offset = 0;
  for (let i = 0; i < index && i < positions.length; i++) {
    offset += positions[i].char.length;
  }
  return offset;
};

const layoutIndexAtOffset = (positions: readonly LayoutPosition[], offset: number) => {
  let acc = 0;
  for (let i = 0; i < positions.length; i++) {
    const len = positions[i].char.length;
    if (offset < acc + len) return i;
    acc += len;
  }
  return positions.length - 1;
};

const nearestFilled = (positions: readonly LayoutPosition[], fromIndex: number, step: number) => {
  for (let i = fromIndex + step; i >= 0 && i < positions.length; i += step) {
    if (positions[i].filled) return i;
  }
  return -1;
};

/**
 * Resolves a single-character deletion so that backspace/delete on a fixed
 * separator (or an attempt to delete an empty placeholder) clears the adjacent
 * filled editable value instead of being a no-op. This mirrors react-input-mask's
 * `getLeftEditablePosition` / `getRightEditablePosition` behavior.
 *
 * Returns the re-formatted value, cursor and completeness, or `null` to let the
 * caller fall back to a full reformat (insertions, multi-char deletions, range
 * edits, or nothing-to-delete). The result is always canonical (re-packed), so
 * the stored value, the displayed value and the emitted modelValue stay in sync.
 */
export function resolveDeletion(
  previousValue: string,
  previousSelection: InputMaskSelection | null,
  rawValue: string,
  rawCursor: number,
  mask: InputMaskPattern,
  formatChars?: Readonly<Record<string, RegExp>>,
  maskChar: string | null = null,
): { value: string; cursor: number; complete: boolean } | null {
  if (!previousSelection || previousSelection.start !== previousSelection.end) return null;
  if (previousValue.length - rawValue.length !== 1) return null;

  const prevCursor = previousSelection.start;
  const backspace = rawCursor === prevCursor - 1;
  const forward = rawCursor === prevCursor;
  if (!backspace && !forward) return null;

  const merged = mergeFormatChars(formatChars);
  const tokens = parseMask(mask, merged);
  const values = readEditableCharacters(previousValue, tokens, maskChar);
  const layout = buildLayout(tokens, values, maskChar, true);

  const deletedOffset = backspace ? prevCursor - 1 : prevCursor;
  const deletedIndex = layoutIndexAtOffset(layout, deletedOffset);
  if (deletedIndex < 0) return null;
  const deleted = layout[deletedIndex];

  let targetIndex: number;
  if (deleted.literal) {
    targetIndex = nearestFilled(layout, deletedIndex, backspace ? -1 : 1);
    if (targetIndex < 0) return null;
  } else if (deleted.filled) {
    targetIndex = deletedIndex;
  } else {
    // Empty placeholder: reformatting restores it, so treat as a no-op.
    return null;
  }

  const targetOffset = layoutOffset(layout, targetIndex);
  const targetLen = layout[targetIndex].char.length;
  const adjustedRaw =
    previousValue.slice(0, targetOffset) + previousValue.slice(targetOffset + targetLen);
  const result = formatInputMask(adjustedRaw, targetOffset, mask, {
    maskChar,
    showMask: true,
    formatChars: merged,
  });
  return { value: result.value, cursor: result.selection.start, complete: result.complete };
}
