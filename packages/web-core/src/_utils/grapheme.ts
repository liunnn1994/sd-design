import { Segmenter } from '@formatjs/intl-segmenter';

/**
 * Grapheme-aware string utilities built on `Intl.Segmenter`.
 *
 * The DOM (`selectionStart`, `value.length`, `setSelectionRange`) counts in
 * UTF-16 code units, while user-perceived characters are grapheme clusters.
 * These helpers convert between the two so that astral characters (CJK
 * Extension B, emoji) and combining sequences are counted and sliced as a
 * single unit.
 */

export function createTextSegmenter(granularity: 'grapheme' | 'word') {
  const Constructor = typeof Intl.Segmenter === 'function' ? Intl.Segmenter : Segmenter;
  return new Constructor(undefined, { granularity });
}

let segmenter: ReturnType<typeof createTextSegmenter> | undefined;

const getSegmenter = () => (segmenter ??= createTextSegmenter('grapheme'));

/** Split a string into its grapheme-cluster segments. */
export const splitGraphemes = (value: string): string[] => {
  const seg = getSegmenter();
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
  let offset = 0;
  let i = 0;
  for (const { segment } of seg.segment(value)) {
    if (i >= index) break;
    offset += segment.length;
    i++;
  }
  return offset;
};
