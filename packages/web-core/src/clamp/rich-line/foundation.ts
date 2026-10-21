// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { MutableCell } from '../multiline.js';
import type { NativeClampMode } from '../native.js';
import type {
  PreparedRich,
  RichClampProbe,
  RichClampResult,
  RichClampOptions,
  RichSearchIndex,
  RichState,
} from '../rich.js';
import type { ClampBoundary, ClampLength } from '../types.js';

import { borderBoxWidth, cssLength, hasMeasuredPeers, normalizeLineLimit } from '../layout.js';
import { createLayoutMeasurer, hasExplicitTextWidth } from '../measure.js';
import { createMultilineClamp } from '../multiline.js';
import { measureNativeClamped, resolveNativeMode } from '../native.js';
import { canSafelyCloneRichProbe, clampRich, patchRich, prepareRichTextBatch } from '../rich.js';
import { shouldVerifyFullCandidate } from '../search.js';
type ProbeElements = {
  affixes: {
    after: ProbeAffixState;
    before: ProbeAffixState;
  };
  body: HTMLElement;
  content: HTMLElement;
};

type ProbeAffixState = {
  clone: HTMLElement | null;
  signature: string | null;
  source: HTMLElement | null;
};

type PreparedProbe = {
  affixSignature: string;
  probe: RichClampProbe;
};

type RankHint = {
  hasObservedRankSlope: boolean;
  rank: number;
  rankCount: number;
  rankPerPx: number;
  textRankSafe: boolean;
  width: number;
};

export interface RichLineClampFoundationOptions {
  readonly html: string;
  readonly maxLines: number | undefined;

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
    bodyRef: MutableCell<HTMLElement | null>;
    afterRef: MutableCell<HTMLElement | null>;
    isClamped: MutableCell<boolean>;
    hasActiveClamp: MutableCell<boolean>;

    preparedHtml: MutableCell<PreparedRich | null>;
    probeRef: MutableCell<HTMLElement | null>;
    isFallback: MutableCell<boolean>;
  };
}
const warmBootstrapWidthDelta = 32;
export function createRichLineClampFoundation(options: RichLineClampFoundationOptions) {
  const {
    expanded,
    rootRef,
    contentRef,
    beforeRef,
    bodyRef,
    afterRef,
    isClamped,
    hasActiveClamp,
    preparedHtml,
    probeRef,
    isFallback,
  } = options.state;
  let visibleState: RichState | null = null;
  let visibleIsPatched = false;
  let measuredState: RichState | null = null;
  let probeElements: ProbeElements | null = null;
  let probeSearchIndex: RichSearchIndex | null = null;
  let measuredAffixSignature: string | null = null;
  let measuredWidth: number | null = null;
  let rankHint: RankHint | null = null;
  let clampedMaxWidth: number | null = null;
  let sourceProbeSafety: {
    prepared: PreparedRich;
    safe: boolean;
  } | null = null;
  let probeCloneBlocked = false;
  async function recompute(
    expanded: MutableCell<boolean>,
    rootWidthSnapshot?: number,
  ): Promise<void> {
    const lineLimit = normalizeLineLimit(options.maxLines);
    if (
      expanded.value ||
      options.html.length === 0 ||
      (lineLimit === undefined && options.maxHeight === undefined)
    ) {
      // Expanded, empty, and unlimited states should leave the trusted HTML
      // visible as authored.
      await resetClamp();
      return;
    }
    const bodyElement = bodyRef.value;
    if (!bodyElement) {
      await resetClamp();
      return;
    }
    const nativeMode = getNativeMode(lineLimit);
    if (nativeMode) {
      const contentElement = contentRef.value;
      if (!contentElement) {
        await resetClamp();
        return;
      }
      if (visibleIsPatched) {
        const prepared = preparedHtml.value;
        if (!prepared) {
          await resetClamp();
          return;
        }
        patchVisible(prepared, { kind: 'full' });
      }
      resetStates();
      clearProbe();
      const clampedElement = nativeMode === 'multi-line' ? contentElement : bodyElement;
      const nextClamped = measureNativeClamped(
        clampedElement,
        nativeMode,
        nativeMode === 'multi-line' ? rootWidthSnapshot : undefined,
      );
      await applyStatus(nextClamped ?? false, false);
      return;
    }
    const prepared = preparedHtml.value;
    if (!prepared) {
      // DOMParser can be unavailable in non-browser environments. Keep the
      // authored source rather than trying to measure an unknown tree.
      await resetClamp();
      return;
    }
    if (probeCloneBlocked) {
      await applySourceFallback(prepared);
      return;
    }
    if (
      !canSafelyPrepareSource(prepared) ||
      !canSafelyCloneRichProbe(beforeRef.value) ||
      !canSafelyCloneRichProbe(afterRef.value)
    ) {
      // Arbitrary connected clones can run custom-element lifecycle hooks,
      // duplicate document/form identities, or activate embedded resources.
      // Preserve the authored source instead of approximating those cases.
      probeCloneBlocked = true;
      await applySourceFallback(prepared);
      return;
    }
    const preparedProbe = prepareProbe(rootWidthSnapshot);
    if (!preparedProbe) {
      await resetClamp();
      return;
    }
    const { affixSignature, probe } = preparedProbe;
    const sameAffix = affixSignature === measuredAffixSignature;
    const skipFullFit = canSkipFullFit(probe.width, sameAffix);
    const searchHint = searchHintForWidth(probe.width, sameAffix);
    const preferHintedTextRun =
      searchHint?.kind === 'clamped' && measuredWidth !== null && sameAffix;
    const input: RichClampOptions = {
      ellipsis: options.ellipsis,
      from: measuredState,
      hint: searchHint,
      lineLimit,
      maxHeight: options.maxHeight,
      prepared,
      preferHintedTextRun,
      probe,
      searchIndex: probeSearchIndex,
      skipFullFit,
      verifyFullCandidate: shouldVerifyFullCandidate(
        skipFullFit,
        probe.width,
        measuredWidth,
        measuredState?.kind === 'full',
        clampedMaxWidth,
      ),
    };
    const beforeElement = beforeRef.value;
    const afterElement = afterRef.value;
    const isCurrent = () =>
      bodyRef.value === bodyElement &&
      probeRef.value === probe.root &&
      preparedHtml.value === prepared &&
      hasActiveClamp.value &&
      normalizeLineLimit(options.maxLines) === lineLimit &&
      options.maxHeight === input.maxHeight &&
      options.ellipsis === input.ellipsis &&
      beforeRef.value === beforeElement &&
      afterRef.value === afterElement;
    // Return the existing settlement promise directly: another async boundary
    // would let nextTick observe stale slot status after the text is committed.
    const commit = (result: RichClampResult): Promise<void> => {
      measuredState = result.state;
      probeSearchIndex = result.searchIndex ?? null;
      measuredAffixSignature = affixSignature;
      measuredWidth = probe.width;
      updateRankHint(result, probe.width, sameAffix);
      updateClampedMaxWidth(result, probe.width, sameAffix);
      if (!result.state) {
        // A zero-width probe should not replace visible content with a guessed rich
        // fragment.
        return resetClamp();
      }
      patchVisible(prepared, result.state);
      return applyStatus(result.state.kind === 'clamped', result.fallback);
    };
    let settlement: Promise<void> | undefined;
    let result: RichClampResult | null = null;
    if (
      hasMeasuredPeers() &&
      options.ellipsis.length > 0 &&
      visibleState === measuredState &&
      rootRef.value &&
      hasExplicitTextWidth(rootRef.value)
    ) {
      const measurement = prepareRichTextBatch(input);
      if ('result' in measurement) result = measurement.result;
      else {
        const measured = await options.measureLayout(measurement.task, isCurrent, (next) => {
          if (typeof next !== 'function') settlement = commit(next);
        });
        if (!isCurrent()) return;
        if (settlement) {
          await settlement;
          return;
        }
        result = typeof measured === 'function' ? measured() : measured;
      }
    }
    result ??= clampRich(input);
    await commit(result);
  }
  function createProbe(): ProbeElements {
    const content = document.createElement('span');
    const body = document.createElement('span');
    content.dataset.part = 'content';
    body.dataset.part = 'body';
    content.appendChild(body);
    return {
      affixes: {
        after: createProbeAffixState(),
        before: createProbeAffixState(),
      },
      body,
      content,
    };
  }
  function createProbeAffixState(): ProbeAffixState {
    return {
      clone: null,
      signature: null,
      source: null,
    };
  }
  function ensureProbeRoot(probeRoot: HTMLElement, content: HTMLElement): void {
    if (content.parentNode === probeRoot && probeRoot.childNodes.length === 1) {
      return;
    }
    probeRoot.replaceChildren(content);
  }
  function syncProbeContent(
    elements: ProbeElements,
    beforeElement: HTMLElement | null,
    afterElement: HTMLElement | null,
  ): void {
    const { body, content } = elements;
    const beforeClone = syncProbeAffixClone(
      elements.affixes.before,
      beforeElement,
      options.observedSizeSnapshot(beforeElement).signature,
    );
    const afterClone = syncProbeAffixClone(
      elements.affixes.after,
      afterElement,
      options.observedSizeSnapshot(afterElement).signature,
    );
    if (!beforeClone && !afterClone) {
      if (body.parentNode !== content || content.childNodes.length !== 1) {
        content.replaceChildren(body);
      }
      return;
    }
    const nextChildren: HTMLElement[] = [];
    if (beforeClone) {
      nextChildren.push(beforeClone);
    }
    nextChildren.push(body);
    if (afterClone) {
      nextChildren.push(afterClone);
    }
    const currentChildren = content.childNodes;
    let structureChanged = currentChildren.length !== nextChildren.length;
    for (let index = 0; !structureChanged && index < nextChildren.length; index += 1) {
      structureChanged = currentChildren[index] !== nextChildren[index];
    }
    if (structureChanged) {
      content.replaceChildren(...nextChildren);
    }
  }
  function syncProbeAffixClone(
    affixState: ProbeAffixState,
    source: HTMLElement | null,
    nextSignature: string,
  ): HTMLElement | null {
    if (!source) {
      affixState.clone = null;
      affixState.signature = null;
      affixState.source = null;
      return null;
    }
    if (
      affixState.clone &&
      affixState.source === source &&
      affixState.signature === nextSignature
    ) {
      return affixState.clone;
    }
    // Slot content affects fit but should not be mutated by rich candidate
    // patches, so the probe receives cloned slot boxes.
    const clone = source.cloneNode(true) as HTMLElement;
    affixState.clone = clone;
    affixState.signature = nextSignature;
    affixState.source = source;
    return clone;
  }
  function resetStates(): void {
    // visibleIsPatched describes the live DOM, not a reusable patch cursor. It
    // intentionally survives semantic-state resets until source DOM is restored.
    visibleState = null;
    measuredState = null;
    probeSearchIndex = null;
    measuredAffixSignature = null;
    measuredWidth = null;
    rankHint = null;
    clampedMaxWidth = null;
  }
  function clearProbe(): void {
    probeRef.value?.replaceChildren();
    probeElements = null;
  }
  function canSafelyPrepareSource(prepared: PreparedRich): boolean {
    if (sourceProbeSafety?.prepared === prepared) {
      return sourceProbeSafety.safe;
    }
    // `html`/`boundary` changes create a new prepared source, so the static
    // clone-safety walk is paid once per source rather than once per reclamp.
    const safe = canSafelyCloneRichProbe(prepared.root) && canSafelyCloneRichProbe(bodyRef.value);
    sourceProbeSafety = { prepared, safe };
    return safe;
  }
  function getNativeMode(lineLimit: number | undefined): NativeClampMode | null {
    if (probeCloneBlocked) {
      return null;
    }
    return resolveNativeMode({
      boundary: options.boundary,
      ellipsis: options.ellipsis,
      expanded: expanded.value,
      hasAfterSlot: afterRef.value !== null,
      lineLimit,
      locationRatio: 1,
      maxHeight: options.maxHeight,
    });
  }
  function searchHintForWidth(width: number, sameAffix: boolean): RichState | null {
    if (!measuredState || !sameAffix) {
      return null;
    }
    const stateWidth = measuredWidth;
    if (stateWidth === null || width === stateWidth) {
      return measuredState;
    }
    const hint = rankHint;
    if (hint?.textRankSafe) {
      const count = hint.rankCount;
      const start = Math.max(0, Math.min(count - 1, hint.rank));
      const target = estimatedTargetRank(hint, width);
      // Retained density can seed the first resize before an observed slope is
      // available. Neither estimate changes the separate full-source fit gate.
      // These ranks count primary text cuts and atomic endpoints. Word-mode
      // grapheme fallback has different units and cannot map through this array.
      const points = probeSearchIndex?.data.rankPoints;
      return points?.length === count && target !== start
        ? { kind: 'clamped', point: points.at(target) }
        : measuredState;
    }
    return Math.abs(width - stateWidth) <= warmBootstrapWidthDelta ? measuredState : null;
  }
  function estimatedTargetRank(hint: RankHint, width: number): number {
    const deltaWidth = width - hint.width;
    const rankMove = Math.abs(deltaWidth) * hint.rankPerPx;
    const start = Math.max(0, Math.min(hint.rankCount - 1, hint.rank));
    const target = start + Math.sign(deltaWidth) * Math.ceil(rankMove);
    return Math.max(0, Math.min(hint.rankCount - 1, target));
  }
  function nextRankPerPx(
    result: RichClampResult,
    width: number,
    sameAffix: boolean,
    previous: RankHint | null,
  ): number {
    const rank = result.rank ?? 0;
    if (!sameAffix || !previous || previous.rankCount !== result.rankCount) {
      return Math.max(1 / width, rank / width);
    }
    const deltaWidth = Math.abs(width - previous.width);
    if (deltaWidth === 0) {
      return previous.rankPerPx;
    }
    const observed = Math.abs(rank - previous.rank) / deltaWidth;
    return Number.isFinite(observed) && observed > 0 ? observed : previous.rankPerPx;
  }
  function updateRankHint(result: RichClampResult, width: number, sameAffix: boolean): void {
    if (result.rank === undefined || result.rankCount === undefined || result.rankCount <= 0) {
      rankHint = null;
      return;
    }
    const previous = rankHint;
    rankHint = {
      // Same-width invalidations preserve a slope learned from an earlier resize.
      hasObservedRankSlope:
        sameAffix && !!previous && (previous.hasObservedRankSlope || previous.width !== width),
      rank: result.rank,
      rankCount: result.rankCount,
      rankPerPx: nextRankPerPx(result, width, sameAffix, previous),
      textRankSafe: result.textRankSafe ?? false,
      width,
    };
  }
  function updateClampedMaxWidth(result: RichClampResult, width: number, sameAffix: boolean): void {
    if (result.state?.kind !== 'clamped') {
      clampedMaxWidth = null;
      return;
    }
    clampedMaxWidth = sameAffix ? Math.max(width, clampedMaxWidth ?? width) : width;
  }
  function canSkipFullFit(width: number, sameAffix: boolean): boolean {
    const state = measuredState;
    const stateWidth = measuredWidth;
    if (state?.kind !== 'clamped' || stateWidth === null || !sameAffix) {
      return false;
    }
    const hint = rankHint;
    if (options.boundary === 'word' && hint?.hasObservedRankSlope) {
      return estimatedTargetRank(hint, width) < hint.rankCount - 1;
    }
    return width <= stateWidth + warmBootstrapWidthDelta;
  }
  function patchVisible(prepared: PreparedRich, state: RichState): void {
    const bodyElement = bodyRef.value;
    if (!bodyElement) {
      // If Vue has not mounted the target body, discard states rather than
      // applying future patches against an unknown DOM state.
      visibleIsPatched = false;
      resetStates();
      return;
    }
    visibleState = patchRich(prepared, bodyElement, visibleState, state, options.ellipsis);
    visibleIsPatched = state.kind === 'clamped';
  }
  async function applyStatus(nextClamped: boolean, nextFallback: boolean): Promise<void> {
    const changed = isClamped.value !== nextClamped || isFallback.value !== nextFallback;
    isClamped.value = nextClamped;
    isFallback.value = nextFallback;
    if (changed) {
      // Layout and visible DOM are already final; this tick exposes status changes
      // after Vue commits any render-mode transition.
      await options.afterRender();
    }
  }
  async function resetClamp(): Promise<void> {
    if (visibleIsPatched) {
      const prepared = preparedHtml.value;
      if (prepared) {
        // Reset through the structural patcher so existing visible descendants
        // are restored consistently with normal clamp commits.
        patchVisible(prepared, { kind: 'full' });
      } else {
        resetStates();
      }
    } else {
      resetStates();
    }
    await applyStatus(false, false);
  }
  async function applySourceFallback(prepared: PreparedRich): Promise<void> {
    if (visibleIsPatched) {
      // Slot-only changes can make an already-clamped tree unsafe to clone. HTML
      // changes clear visibleIsPatched after Vue restores innerHTML, so avoiding a
      // redundant patch also avoids reconnecting custom elements.
      patchVisible(prepared, { kind: 'full' });
    }
    resetStates();
    clearProbe();
    await applyStatus(false, true);
  }
  function probeAffixSignature(elements: ProbeElements): string {
    return `${elements.affixes.before.signature ?? ''}|${elements.affixes.after.signature ?? ''}`;
  }
  function prepareProbe(rootWidth?: number): PreparedProbe | null {
    const rootElement = rootRef.value;
    const probeRoot = probeRef.value;
    if (!rootElement || !probeRoot) {
      return null;
    }
    const elements = (probeElements ??= createProbe());
    const normalizedMaxHeight = cssLength(options.maxHeight);
    const width = rootWidth ?? borderBoxWidth(rootElement);
    probeRoot.style.width = `${width}px`;
    probeRoot.style.maxHeight = normalizedMaxHeight ?? '';
    probeRoot.style.overflow = normalizedMaxHeight === undefined ? 'visible' : 'hidden';
    const beforeElement = beforeRef.value;
    const afterElement = afterRef.value;
    syncProbeContent(elements, beforeElement, afterElement);
    ensureProbeRoot(probeRoot, elements.content);
    return {
      affixSignature: probeAffixSignature(elements),
      probe: {
        body: elements.body,
        content: elements.content,
        root: probeRoot,
        width,
      },
    };
  }
  function resetSource(changed: boolean) {
    if (changed) visibleIsPatched = false;
    probeCloneBlocked = false;
    resetStates();
    isFallback.value = false;
  }
  return { recompute, getNativeMode, resetSource };
}
