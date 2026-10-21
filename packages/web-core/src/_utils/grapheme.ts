/**
 * Grapheme-aware string utilities built on `Intl.Segmenter`.
 *
 * The DOM (`selectionStart`, `value.length`, `setSelectionRange`) counts in
 * UTF-16 code units, while user-perceived characters are grapheme clusters.
 * These helpers convert between the two so that astral characters (CJK
 * Extension B, emoji) and combining sequences are counted and sliced as a
 * single unit. Falls back to code-point iteration when `Intl.Segmenter` is
 * unavailable (older runtimes).
 */

let segmenter: Intl.Segmenter | null | undefined;

const getSegmenter = (): Intl.Segmenter | undefined => {
  if (segmenter === null) return undefined;
  if (segmenter) return segmenter;
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  } else {
    segmenter = null;
  }
  return segmenter ?? undefined;
};

/** Split a string into its grapheme-cluster segments. */
export const splitGraphemes = (value: string): string[] => {
  const seg = getSegmenter();
  if (!seg) return Array.from(value);
  const result: string[] = [];
  for (const { segment } of seg.segment(value)) result.push(segment);
  return result;
};

/** Count user-perceived characters (grapheme clusters). */
export const countGraphemes = (value: string): number => splitGraphemes(value).length;

/** Keep the first `maxLength` grapheme clusters. */
export const sliceGraphemes = (value: string, maxLength: number): string => {
  if (maxLength <= 0) return '';
  const seg = getSegmenter();
  if (!seg) return Array.from(value).slice(0, maxLength).join('');
  let count = 0;
  let out = '';
  for (const { segment } of seg.segment(value)) {
    if (count >= maxLength) break;
    out += segment;
    count++;
  }
  return out;
};

/**
 * Grapheme index that contains (or is at) the given UTF-16 code-unit offset.
 * Round-trips with {@link graphemeIndexToCodeUnit}.
 */
export const codeUnitToGraphemeIndex = (value: string, offset: number): number => {
  const seg = getSegmenter();
  if (!seg) {
    let index = 0;
    let acc = 0;
    for (const grapheme of Array.from(value)) {
      if (acc >= offset) break;
      acc += grapheme.length;
      index++;
    }
    return index;
  }
  let index = 0;
  let acc = 0;
  for (const { segment } of seg.segment(value)) {
    if (acc >= offset) break;
    acc += segment.length;
    index++;
  }
  return index;
};

/** UTF-16 code-unit offset at the start of the given grapheme index. */
export const graphemeIndexToCodeUnit = (value: string, index: number): number => {
  const seg = getSegmenter();
  if (!seg) {
    let offset = 0;
    let i = 0;
    for (const grapheme of Array.from(value)) {
      if (i >= index) break;
      offset += grapheme.length;
      i++;
    }
    return offset;
  }
  let offset = 0;
  let i = 0;
  for (const { segment } of seg.segment(value)) {
    if (i >= index) break;
    offset += segment.length;
    i++;
  }
  return offset;
};
