const excludedTypes = new Set([
  'code_block',
  'admonition',
  'table',
  'math_block',
  'html_block',
  'image',
  'thematic_break',
]);
const excludedSelector = [
  '.typewriter-cursor',
  '.height-estimation-probes',
  ...[...excludedTypes].map((type) => `[data-node-type="${type}"]`),
  'script',
  'style',
].join(',');

export function getMarkdownTypewriterMode(value: unknown): 'off' | 'simple' | 'precise' {
  return value === 'simple'
    ? 'simple'
    : value === true || value === 'true' || value === 'precise'
      ? 'precise'
      : 'off';
}
export function isMarkdownCursorTailEligible(type?: string) {
  return !excludedTypes.has(type ?? '');
}
function lastText(root: HTMLElement): Text | null {
  let current: Node | null = root.lastChild;
  while (current) {
    if (
      current.nodeType === 3 &&
      current.textContent?.trim() &&
      !current.parentElement?.closest(excludedSelector)
    )
      return current as Text;
    if (
      current.nodeType === 1 &&
      !(current as Element).matches(excludedSelector) &&
      current.lastChild
    ) {
      current = current.lastChild;
      continue;
    }
    while (current && current !== root && !current.previousSibling) current = current.parentNode;
    if (!current || current === root) break;
    current = current.previousSibling;
  }
  return null;
}
export function findMarkdownCursorText(
  nodes: readonly { type: string }[],
  slots: ReadonlyMap<number, HTMLElement>,
  shouldRender: (index: number) => boolean,
) {
  for (const [index, element] of [...slots].sort(([a], [b]) => b - a)) {
    if (!nodes[index] || !isMarkdownCursorTailEligible(nodes[index].type) || !shouldRender(index))
      continue;
    const text = lastText(element);
    if (text) return text;
  }
  return null;
}
export function positionMarkdownCursor(root: HTMLElement, cursor: HTMLElement, text: Text | null) {
  cursor.style.visibility = 'hidden';
  if (!text?.textContent) return;
  const range = root.ownerDocument.createRange();
  range.setStart(text, Math.max(0, text.textContent.length - 1));
  range.setEnd(text, text.textContent.length);
  const rects = range.getClientRects();
  const rect = rects[rects.length - 1] ?? text.parentElement?.getBoundingClientRect();
  if (!rect) return;
  const bounds = root.getBoundingClientRect();
  cursor.style.transform = `translate(${Math.max(0, rect.right - bounds.left + root.scrollLeft)}px, ${Math.max(0, rect.top - bounds.top + root.scrollTop)}px)`;
  cursor.style.height = `${rect.height || 20}px`;
  cursor.style.visibility = 'visible';
}
