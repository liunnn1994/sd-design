import type { NumberFlowValue } from './types';

export type NumberFlowPartType =
  | Exclude<Intl.NumberFormatPartTypes, 'minusSign' | 'plusSign'>
  | 'sign'
  | 'prefix'
  | 'suffix';

export interface NumberFlowPart {
  key: string;
  type: NumberFlowPartType;
  value: string;
  digit?: number;
  position?: number;
}

export interface NumberFlowData {
  parts: NumberFlowPart[];
  digitCharacters: string[];
  value: number;
  valueAsString: string;
}

const digitCharactersCache = new WeakMap<Intl.NumberFormat, string[]>();

export function formatNumberFlow(
  value: NumberFlowValue,
  formatter: Intl.NumberFormat,
  prefix?: string,
  suffix?: string,
): NumberFlowData {
  let digitCharacters = digitCharactersCache.get(formatter);
  if (!digitCharacters) {
    const digitFormatter = new Intl.NumberFormat('en', {
      numberingSystem: formatter.resolvedOptions().numberingSystem,
      useGrouping: false,
    });
    digitCharacters = Array.from(digitFormatter.format(9876543210)).reverse();
    digitCharactersCache.set(formatter, digitCharacters);
  }

  const numericValue = typeof value === 'string' ? Number.parseFloat(value) : value;
  const rawParts = formatter.formatToParts(numericValue);
  const integerDigits = rawParts
    .filter((part) => part.type === 'integer')
    .reduce((count, part) => count + Array.from(part.value).length, 0);
  const counts = new Map<NumberFlowPartType, number>();
  let integerPosition = integerDigits - 1;
  let fractionPosition = -1;

  const nextKey = (type: NumberFlowPartType) => {
    const index = counts.get(type) ?? 0;
    counts.set(type, index + 1);
    return `${type}:${index}`;
  };

  const parts: NumberFlowPart[] = [];
  if (prefix) parts.push({ key: nextKey('prefix'), type: 'prefix', value: prefix });

  for (const part of rawParts) {
    const type: NumberFlowPartType =
      part.type === 'minusSign' || part.type === 'plusSign' ? 'sign' : part.type;

    if (type === 'integer' || type === 'fraction') {
      for (const character of part.value) {
        const position = type === 'integer' ? integerPosition-- : fractionPosition--;
        parts.push({
          key: `${type}:${position}`,
          type,
          value: character,
          digit: digitCharacters.indexOf(character),
          position,
        });
      }
      continue;
    }

    parts.push({ key: nextKey(type), type, value: part.value });
  }

  if (suffix) parts.push({ key: nextKey('suffix'), type: 'suffix', value: suffix });

  return {
    parts,
    digitCharacters,
    value: numericValue,
    valueAsString: `${prefix ?? ''}${formatter.format(numericValue)}${suffix ?? ''}`,
  };
}
