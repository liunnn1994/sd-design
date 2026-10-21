export interface MenuOverflowItem {
  type: 'item' | 'mirror' | 'overflow';
  width: number;
}
export function getMenuOverflowIndex(
  wrapperWidth: number,
  nodes: Iterable<MenuOverflowItem>,
): number | null {
  let index = 0;
  let right = 0;
  let overflow = 0;
  for (const node of nodes) {
    if (node.type === 'overflow') continue;
    if (node.type === 'mirror') {
      overflow = node.width;
      continue;
    }
    right += node.width;
    if (right + overflow + 10 > wrapperWidth) return index - 1;
    index++;
  }
  return null;
}
export function roundMenuWidth(width: number) {
  return +width.toFixed(2);
}
export function parseMenuMargin(value: string) {
  const result = Number(value.replace('px', ''));
  return Number.isNaN(result) ? 0 : result;
}
