import type { TableClassName, TableContent } from './types.js';

export function tableClassName(...values: (TableClassName | false | undefined)[]): string {
  return values
    .flatMap((value): string[] => {
      if (!value) return [];
      if (typeof value === 'string') return [value];
      if (Array.isArray(value)) return [tableClassName(...value)];
      return Object.keys(value).filter((name) => value[name]);
    })
    .join(' ');
}
export function renderTableContent(content: TableContent) {
  return typeof content === 'function' ? content() : content;
}
