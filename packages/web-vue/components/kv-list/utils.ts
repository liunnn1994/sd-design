import type { KvListItem } from './types';

export function normalizeKvList(items: readonly KvListItem[] | undefined) {
  if (!items) return [];

  return items
    .filter((item) => item.key.trim() !== '')
    .map((item) => ({ key: item.key, value: item.value }));
}

export function parseBulkKvList(value: string): KvListItem[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(':');

      if (separatorIndex < 0) {
        return { key: line, value: '' };
      }

      return {
        key: line.slice(0, separatorIndex).trim(),
        value: line.slice(separatorIndex + 1).trimStart(),
      };
    })
    .filter((item) => item.key !== '');
}

export function stringifyKvList(items: readonly KvListItem[]) {
  return normalizeKvList(items)
    .map(({ key, value }) => `${key}: ${value}`)
    .join('\n');
}

export function isSameKvList(first: readonly KvListItem[], second: readonly KvListItem[]) {
  return (
    first.length === second.length &&
    first.every(
      (item, index) => item.key === second[index]?.key && item.value === second[index]?.value,
    )
  );
}
