import type { Mode } from './types.js';

export function getDefaultFormat(mode: Mode = 'date', showTime = false) {
  switch (mode) {
    case 'date':
      return showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
    case 'month':
      return 'YYYY-MM';
    case 'year':
      return 'YYYY';
    case 'week':
      return 'gggg-wo';
    case 'quarter':
      return 'YYYY-[Q]Q';
    default:
      return 'YYYY-MM-DD';
  }
}

export function getDefaultValueFormat(mode: Mode = 'date', showTime = false) {
  switch (mode) {
    case 'date':
      return showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
    case 'month':
      return 'YYYY-MM';
    case 'year':
      return 'YYYY';
    case 'week':
      return 'YYYY-MM-DD';
    case 'quarter':
      return 'YYYY-MM';
    default:
      return 'YYYY-MM-DD';
  }
}
