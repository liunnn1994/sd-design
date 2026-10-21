import type { SimpleLineFit } from '../layout.js';
// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { MutableCell } from '../multiline.js';
import type { NativeClampMode } from '../native.js';
import type { PreparedText } from '../text.js';
import type { TextClampLayoutInput, TextClampResult } from '../text.js';
import type { ClampBoundary, ClampLength, LineClampLocation } from '../types.js';

import {
  borderBoxWidth,
  estimateLineCapacity,
  hasBorderBoxSize,
  hasMeasuredPeers,
  simpleLineFitFromStyle,
  textLayoutMetricKey,
} from '../layout.js';
import { createLayoutMeasurer, hasExplicitTextWidth } from '../measure.js';
import { createMultilineClamp } from '../multiline.js';
import { measureNativeClamped, resolveNativeMode } from '../native.js';
import { clampTextToLayout, searchTextLayout, normalizeLocationRatio } from '../text.js';
import { searchLineEndCandidates } from './end-search.js';
type LineFitResult = {
  readonly fit: SimpleLineFit | undefined;
  readonly metricsChanged: boolean;
};

export interface LineClampFoundationOptions {
  readonly text: string;
  readonly location: LineClampLocation;

  readonly maxHeight: ClampLength | undefined;
  readonly boundary: ClampBoundary;
  readonly ellipsis: string;
  measureLayout: ReturnType<typeof createLayoutMeasurer>;
  afterRender: () => Promise<unknown>;
  observedSizeSnapshot: ReturnType<typeof createMultilineClamp>['observedSizeSnapshot'];

  state: {
    expanded: MutableCell<boolean>;
    rootRef: MutableCell<HTMLElement | null>;
    contentRef: MutableCell<HTMLElement | null>;
    beforeRef: MutableCell<HTMLElement | null>;
    afterRef: MutableCell<HTMLElement | null>;
    isClamped: MutableCell<boolean>;
    hasActiveClamp: MutableCell<boolean>;

    textRef: MutableCell<HTMLElement | null>;
    visibleText: MutableCell<{ text: string }>;
    lineLimit: MutableCell<number | undefined>;
    preparedText: MutableCell<PreparedText>;
  };
}
export function createLineClampFoundation(options: LineClampFoundationOptions) {
  const {
    expanded,
    rootRef,
    contentRef,
    beforeRef,
    afterRef,
    isClamped,
    hasActiveClamp,
    textRef,
    visibleText,
    lineLimit,
    preparedText,
  } = options.state;
  let lastTextClamp: TextClampResult | null = null;
  let lineFitCache: {
    fit: SimpleLineFit;
    key: string;
  } | null = null;
  let lineFitKey: string | null = null;
  function onFontLoad() {
    lineFitCache = null;
    // Keep only the current marked text's semantic rank for a fresh DOM anchor.
    // Font changes invalidate every width observation and full-fit conclusion.
    if (lastTextClamp && !lastTextClamp.fullPrepared) {
      const semanticHint = { ...lastTextClamp };
      delete semanticHint.rootWidth;
      delete semanticHint.clampedMaxWidth;
      lastTextClamp = semanticHint;
    } else {
      lastTextClamp = null;
    }
  }
  async function recompute(
    expanded: MutableCell<boolean>,
    rootWidthSnapshot?: number,
  ): Promise<void> {
    const currentLineLimit = lineLimit.value;
    if (expanded.value || options.text.length === 0 || !hasClampLimit(currentLineLimit)) {
      // Expanded, empty, and unlimited states should expose the source text
      // directly so the DOM stays simple when no truncation is needed.
      await resetClamp();
      return;
    }
    const rootElement = rootRef.value;
    const contentElement = contentRef.value;
    const textElement = textRef.value;
    if (!rootElement || !contentElement || !textElement) {
      // Missing refs are a mount/teardown timing state; avoid caching a partial
      // measurement result.
      await resetClamp();
      return;
    }
    const locationRatio = normalizeLocationRatio(options.location);
    const nativeMode = getNativeMode(afterRef.value !== null, currentLineLimit, locationRatio);
    if (nativeMode) {
      // Browser native clamping is cheaper and more faithful for exact subsets
      // where CSS supports every requested behavior.
      resetTextClampHint();
      const clampedElement = nativeMode === 'multi-line' ? contentElement : textElement;
      const nextClamped = measureNativeClamped(
        clampedElement,
        nativeMode,
        nativeMode === 'multi-line' ? rootWidthSnapshot : undefined,
      );
      // Native rendering already committed the full source with no hidden copy.
      visibleText.value.text = options.text;
      await applyTextState(options.text, nextClamped ?? false);
      return;
    }
    const beforeElement = beforeRef.value;
    const afterElement = afterRef.value;
    const beforeSize = options.observedSizeSnapshot(beforeElement);
    const afterSize = options.observedSizeSnapshot(afterElement);
    const rootWidth = rootWidthSnapshot ?? borderBoxWidth(rootElement);
    const layoutKey = `${beforeSize.signature}|${afterSize.signature}`;
    const hasAffixes =
      hasBorderBoxSize(beforeSize.signature) || hasBorderBoxSize(afterSize.signature);
    const prepared = preparedText.value;
    const textStyle = getComputedStyle(textElement);
    const lineCapacity = estimateLineCapacity(
      rootElement,
      options.maxHeight,
      currentLineLimit,
      textStyle.lineHeight,
    );
    const lineFitResult = lineFit(currentLineLimit, textStyle, layoutKey);
    if (lineFitResult.metricsChanged) lastTextClamp = null;
    const input: TextClampLayoutInput = {
      content: contentElement,
      ellipsis: options.ellipsis,
      hasAffixes,
      hint: lastTextClamp,
      lineCapacity,
      layoutKey,
      lineLimit: currentLineLimit,
      maxHeight: options.maxHeight,
      prepared,
      ratio: locationRatio,
      root: rootElement,
      rootWidth,
      searchCandidates:
        options.boundary === 'grapheme' &&
        locationRatio === 1 &&
        currentLineLimit !== undefined &&
        options.maxHeight === undefined
          ? (candidateInput) =>
              searchLineEndCandidates(candidateInput, {
                content: contentElement,
                target: textElement,
                lineLimit: currentLineLimit,
                rootWidth,
                style: textStyle,
              })
          : undefined,
      reuseFullFitOnGrow:
        !lineFitResult.metricsChanged && !hasAffixes && options.maxHeight === undefined,
      simpleLineFit: lineFitResult.fit,
      target: textElement,
    };
    // Candidate writes only change the body text. Slot rendering happens after
    // the search commits; each pass keeps its current affix elements and metrics.
    // Full-text reuse has no iterative layout work to amortize across instances.
    let settled: Promise<void> | undefined;
    function commit(nextResult: TextClampResult | null): void {
      if (nextResult === null) {
        settled = resetClamp();
      } else {
        lastTextClamp = nextResult;
        settled = applyTextState(nextResult.text, nextResult.text !== prepared.text);
      }
    }
    if (
      hasMeasuredPeers() &&
      options.ellipsis.length > 0 &&
      lastTextClamp?.text !== prepared.text &&
      hasExplicitTextWidth(rootElement)
    ) {
      await options.measureLayout(
        searchTextLayout(input, false),
        () =>
          rootRef.value === rootElement &&
          textRef.value === textElement &&
          preparedText.value === prepared &&
          hasActiveClamp.value &&
          lineLimit.value === currentLineLimit &&
          options.maxHeight === input.maxHeight &&
          options.ellipsis === input.ellipsis &&
          normalizeLocationRatio(options.location) === locationRatio &&
          beforeRef.value === beforeElement &&
          afterRef.value === afterElement,
        commit,
      );
      // Completion commits inside Vue's flush. Its recursive render pass has
      // settled before this await resumes; another tick would delay queued inputs.
    } else {
      commit(clampTextToLayout(input));
      await settled;
    }
  }
  async function applyTextState(nextText: string, nextClamped: boolean): Promise<void> {
    const visible = visibleText.value;
    const structureChanged = (visible.text !== options.text) !== (nextText !== options.text);
    const stateChanged = isClamped.value !== nextClamped;
    if (structureChanged) {
      visibleText.value = { text: nextText };
    } else {
      visible.text = nextText;
    }
    isClamped.value = nextClamped;
    if (structureChanged || stateChanged) {
      // DOM measurement has already completed synchronously; this tick only lets
      // Vue commit the final visible state before callers observe it.
      await options.afterRender();
    }
  }
  async function resetClamp(): Promise<void> {
    resetTextClampHint();
    return applyTextState(options.text, false);
  }
  function resetTextClampHint(): void {
    lastTextClamp = null;
    resetLineFitState();
  }
  function hasClampLimit(currentLineLimit: number | undefined): boolean {
    return currentLineLimit !== undefined || options.maxHeight !== undefined;
  }
  function getNativeMode(
    hasAfterSlot: boolean,
    currentLineLimit: number | undefined,
    locationRatio: number,
  ): NativeClampMode | null {
    return resolveNativeMode({
      boundary: options.boundary,
      ellipsis: options.ellipsis,
      expanded: expanded.value,
      hasAfterSlot,
      lineLimit: currentLineLimit,
      locationRatio,
      maxHeight: options.maxHeight,
    });
  }
  function lineFit(
    currentLineLimit: number | undefined,
    style: CSSStyleDeclaration,
    layoutKey: string,
  ): LineFitResult {
    const simpleLineFit =
      currentLineLimit !== undefined && options.maxHeight === undefined
        ? simpleLineFitFromStyle(style)
        : undefined;
    const key = `${layoutKey}\n${textLayoutMetricKey(style)}`;
    const metricsChanged = lineFitKey !== null && lineFitKey !== key;
    lineFitKey = key;
    if (lineFitCache?.key === key) {
      return {
        fit: lineFitCache.fit,
        metricsChanged,
      };
    }
    const fit =
      simpleLineFit && (beforeRef.value !== null || afterRef.value !== null)
        ? { lineHeight: simpleLineFit.lineHeight, verifyOverflow: true }
        : simpleLineFit;
    lineFitCache = fit ? { fit, key } : null;
    return {
      fit,
      metricsChanged,
    };
  }
  function resetLineFitState(): void {
    lineFitCache = null;
    lineFitKey = null;
  }
  return { onFontLoad, recompute, getNativeMode, resetTextClampHint, hasClampLimit };
}
