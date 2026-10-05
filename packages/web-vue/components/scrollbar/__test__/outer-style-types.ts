import type { ScrollbarProps } from '../interface';

export const stringStyle: ScrollbarProps['outerStyle'] = 'height: 80px';
export const nestedStyle: ScrollbarProps['outerStyle'] = [
  { width: '120px' },
  ['height: 80px', false],
];
