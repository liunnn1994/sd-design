// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { MutableCell } from '../multiline.js';
import type { ClampLength } from '../types.js';
import type { ClampLimits, SequenceMeasurement, WrapClampItemKey } from './types.js';

import {
  borderBoxSizeSignature,
  createCoalescingRunner,
  emptyBorderBoxSignature,
  normalizeLineLimit,
} from '../layout.js';
import { findLargestFittingCount } from '../search.js';
import {
  averageItemWidth,
  findItemElements,
  isSameSize,
  measureElementSize,
  measureSequence,
  measureVisibleAtomicHeight,
  showItemCandidate,
  simulateStaticFlow,
  itemWidthAt,
  layoutTolerance,
} from './flow.js';

export interface WrapClampFoundationOptions {
  readonly items: readonly unknown[];
  readonly maxLines: number | undefined;
  readonly maxHeight: ClampLength | undefined;
  readonly slots: { readonly before?: unknown; readonly after?: unknown };
  state: {
    expanded: MutableCell<boolean>;
    rootRef: MutableCell<HTMLElement | null>;
    contentRef: MutableCell<HTMLElement | null>;
    beforeRef: MutableCell<HTMLElement | null>;
    afterRef: MutableCell<HTMLElement | null>;
    visibleCount: MutableCell<number>;
    materializedCount: MutableCell<number>;
    isClamped: MutableCell<boolean>;
  };
  afterRender: () => Promise<unknown>;
}

const fallbackMaterializedGrowItems = 32;
const maxMaterializedGrowItemsPerLine = 48;

export function createWrapClampFoundation(options: WrapClampFoundationOptions) {
  const {
    expanded,
    rootRef,
    contentRef,
    beforeRef,
    afterRef,
    visibleCount,
    materializedCount,
    isClamped,
  } = options.state;
  let lastLayoutSignature: string | null = null;
  let lastRootWidth: number | null = null;
  let measuredItemWidths: number[] = [];
  let isRecomputing = false;
  let lastRootSizeSignature = emptyBorderBoxSignature;
  let lastContentSizeSignature = emptyBorderBoxSignature;
  let lastBeforeSizeSignature = emptyBorderBoxSignature;
  let lastAfterSizeSignature = emptyBorderBoxSignature;
  async function applyVisibleCount(nextVisibleCount: number): Promise<void> {
    const totalItems = options.items.length;
    const normalizedVisibleCount = Math.max(0, Math.min(totalItems, nextVisibleCount));
    const nextClamped = normalizedVisibleCount < totalItems;
    const changed =
      visibleCount.value !== normalizedVisibleCount || isClamped.value !== nextClamped;
    const materializedChanged = materializedCount.value !== 0;
    visibleCount.value = normalizedVisibleCount;
    materializedCount.value = 0;
    isClamped.value = nextClamped;
    if (changed || materializedChanged) {
      // Measurement reads the rendered item sequence, so each visible-count
      // change must be committed before the next probe.
      await options.afterRender();
    }
  }
  function layoutSignature(updateObserved = true): string {
    const root = borderBoxSizeSignature(rootRef.value);
    const content = borderBoxSizeSignature(contentRef.value);
    const before = borderBoxSizeSignature(beforeRef.value);
    const after = borderBoxSizeSignature(afterRef.value);
    if (updateObserved) {
      lastRootSizeSignature = root;
      lastContentSizeSignature = content;
      lastBeforeSizeSignature = before;
      lastAfterSizeSignature = after;
    }
    return `${root}|${content}|${before}|${after}`;
  }
  function lastObservedSignature(element: Element): string | null {
    if (element === rootRef.value) {
      return lastRootSizeSignature;
    }
    if (element === contentRef.value) {
      return lastContentSizeSignature;
    }
    if (element === beforeRef.value) {
      return lastBeforeSizeSignature;
    }
    if (element === afterRef.value) {
      return lastAfterSizeSignature;
    }
    return null;
  }
  function canUseStaticFlowSearch(limits: ClampLimits): boolean {
    return (
      options.slots.after === undefined &&
      (limits.lineLimit !== undefined || limits.clipToRootHeight)
    );
  }
  function measureCurrentSequence(
    rootElement: HTMLElement,
    limits: ClampLimits,
  ): SequenceMeasurement {
    const { clipToRootHeight, lineLimit } = limits;
    if (lineLimit === undefined && (options.slots.after !== undefined || !clipToRootHeight)) {
      return measureSequence(rootElement, contentRef.value, limits);
    }
    measuredItemWidths.length = Math.min(measuredItemWidths.length, options.items.length);
    return measureSequence(rootElement, contentRef.value, limits, {
      recordItemWidth(index, width) {
        measuredItemWidths[index] = width;
      },
    });
  }
  function uniformAverageItemWidth(): number | null {
    let count = 0;
    let max = 0;
    let min = Number.POSITIVE_INFINITY;
    let sum = 0;
    for (const width of measuredItemWidths) {
      if (!Number.isFinite(width) || width <= 0) {
        continue;
      }
      count += 1;
      max = Math.max(max, width);
      min = Math.min(min, width);
      sum += width;
      if (max - min > layoutTolerance) {
        return null;
      }
    }
    return count >= 2 ? sum / count : null;
  }
  function estimateMaterializedGrowLineLimit(
    rootElement: HTMLElement,
    limits: ClampLimits,
  ): number | null {
    const { clipToRootHeight, lineLimit } = limits;
    if (!clipToRootHeight) {
      return lineLimit ?? null;
    }
    const atomicHeight = measureVisibleAtomicHeight(contentRef.value);
    if (atomicHeight === null || rootElement.clientHeight <= 0) {
      return lineLimit ?? null;
    }
    const clipLineLimit = Math.max(
      1,
      Math.floor((rootElement.clientHeight + layoutTolerance) / atomicHeight),
    );
    return lineLimit === undefined ? clipLineLimit : Math.min(lineLimit, clipLineLimit);
  }
  function estimateMaterializedFrontierFromWidths(
    containerWidth: number,
    lineLimit: number,
    totalItems: number,
    fallbackItemWidth: number,
    beforeWidth: number,
  ): number {
    const result = simulateStaticFlow({
      beforeWidth,
      containerWidth,
      itemCount: totalItems,
      itemWidth: (index) => itemWidthAt(measuredItemWidths, index, fallbackItemWidth),
      lineLimit,
    });
    // Include the first predicted overflow item so DOM search has an overflow
    // side instead of accepting a too-low upper bound.
    return result.status === 'overflow' ? Math.min(totalItems, result.fitCount + 1) : totalItems;
  }
  function estimateMaterializedGrowCount(
    containerWidth: number,
    lineLimit: number,
    currentVisibleCount: number,
    totalItems: number,
    beforeWidth = 0,
  ): number {
    const averageWidth = averageItemWidth(measuredItemWidths);
    // The extra item gives DOM search an overflow side when the estimate
    // lands exactly on the fitting frontier.
    let estimatedFrontierCount = fallbackMaterializedGrowItems;
    if (averageWidth !== null) {
      estimatedFrontierCount = estimateMaterializedFrontierFromWidths(
        containerWidth,
        lineLimit,
        totalItems,
        averageWidth,
        beforeWidth,
      );
    }
    const materializationCap = Math.max(
      fallbackMaterializedGrowItems,
      lineLimit * maxMaterializedGrowItemsPerLine,
    );
    const cappedTargetCount = Math.min(estimatedFrontierCount, materializationCap);
    return Math.min(totalItems, Math.max(currentVisibleCount + 1, cappedTargetCount));
  }
  async function applyStaticFlowCountHint(
    containerWidth: number,
    limits: ClampLimits,
    fallbackItemWidth: number | null = null,
  ): Promise<void> {
    const hasBefore = options.slots.before !== undefined;
    if (
      options.slots.after !== undefined ||
      limits.clipToRootHeight ||
      limits.lineLimit === undefined ||
      (hasBefore && fallbackItemWidth === null)
    ) {
      return;
    }
    const estimate = simulateStaticFlow({
      beforeWidth: hasBefore ? (measureElementSize(beforeRef.value)?.width ?? 0) : 0,
      containerWidth,
      itemCount: options.items.length,
      itemWidth: (index) => measuredItemWidths[index] ?? fallbackItemWidth,
      lineLimit: limits.lineLimit,
    });
    const estimatedVisibleCount =
      estimate.status === 'unknown' && estimate.fitCount === 0 ? null : estimate.fitCount;
    if (
      estimatedVisibleCount !== null &&
      (hasBefore
        ? estimatedVisibleCount > visibleCount.value + 1
        : estimatedVisibleCount !== visibleCount.value)
    ) {
      await applyVisibleCount(estimatedVisibleCount);
    }
  }
  async function applyStaticFlowShrink(
    rootElement: HTMLElement,
    limits: ClampLimits,
  ): Promise<boolean> {
    if (!canUseStaticFlowSearch(limits)) {
      return false;
    }
    const measurement = measureCurrentSequence(rootElement, limits);
    if (measurement.allFit || measurement.visibleItems >= visibleCount.value) {
      return false;
    }
    await applyVisibleCount(measurement.visibleItems);
    const verification = measureCurrentSequence(rootElement, limits);
    return (
      verification.allFit &&
      verification.visibleItems === visibleCount.value &&
      isSameSize(measurement.beforeSize, verification.beforeSize)
    );
  }
  async function applyStaticFlowMaterializedGrow(
    rootElement: HTMLElement,
    rootWidth: number,
    limits: ClampLimits,
  ): Promise<boolean> {
    if (!canUseStaticFlowSearch(limits)) {
      return false;
    }
    let currentVisibleCount = visibleCount.value;
    const totalItems = options.items.length;
    const beforeSize = measureElementSize(beforeRef.value);
    const searchLineLimit = estimateMaterializedGrowLineLimit(rootElement, limits);
    if (searchLineLimit === null) {
      return false;
    }
    let searchItemCount = estimateMaterializedGrowCount(
      rootWidth,
      searchLineLimit,
      currentVisibleCount,
      totalItems,
      beforeSize?.width,
    );
    if (currentVisibleCount >= searchItemCount) {
      return false;
    }
    let additionalItems = 1;
    while (currentVisibleCount < totalItems) {
      // Each chunk materializes a suffix once, then toggles component-owned item
      // shells during search. User slots are not rerun for every candidate.
      materializedCount.value = searchItemCount;
      await options.afterRender();
      const itemElements = findItemElements(contentRef.value);
      const contentElement = contentRef.value;
      if (!contentElement || itemElements.length < searchItemCount) {
        await applyVisibleCount(currentVisibleCount);
        return false;
      }
      let shownCount = currentVisibleCount;
      const measureCandidate = (candidate: number) => {
        shownCount = showItemCandidate(itemElements, shownCount, candidate);
        return measureSequence(rootElement, contentElement, limits);
      };
      const fits = (candidate: number) => {
        const measurement = measureCandidate(candidate);
        return measurement.allFit && measurement.visibleItems === candidate;
      };
      let bestFitCount: number;
      if (searchItemCount - currentVisibleCount <= 2) {
        // With at most one interior cut, keep the existing midpoint-first order.
        // A rejected successor can settle a near-complete width hint in one read.
        bestFitCount = findLargestFittingCount(currentVisibleCount, searchItemCount, fits);
      } else {
        const upper = measureCandidate(searchItemCount);
        bestFitCount = searchItemCount;
        if (!upper.allFit || upper.visibleItems !== searchItemCount) {
          // The first overflow proposes a frontier. Verify its successor before
          // treating it as an upper bound; final committed DOM still verifies fit.
          const frontier = Math.max(
            currentVisibleCount,
            Math.min(searchItemCount - 1, upper.visibleItems),
          );
          const successor = frontier + 1;
          bestFitCount =
            successor === searchItemCount || !fits(successor)
              ? frontier
              : findLargestFittingCount(successor, searchItemCount - 1, fits);
        }
      }
      showItemCandidate(itemElements, shownCount, currentVisibleCount);
      await applyVisibleCount(bestFitCount);
      const verification = measureCurrentSequence(rootElement, limits);
      if (
        !verification.allFit ||
        verification.visibleItems !== visibleCount.value ||
        !isSameSize(beforeSize, verification.beforeSize)
      )
        return false;
      if (bestFitCount < searchItemCount || searchItemCount === totalItems) return true;
      // The measured upper boundary fits. Probe the next item first, then grow
      // the additional materialization geometrically if that boundary also fits.
      currentVisibleCount = bestFitCount;
      searchItemCount = Math.min(totalItems, currentVisibleCount + additionalItems);
      additionalItems *= 2;
    }
    return true;
  }
  async function applyDynamicAfterGrowHint(
    rootWidth: number,
    rootWidthDelta: number,
    limits: ClampLimits,
  ): Promise<void> {
    if (
      options.slots.after === undefined ||
      limits.clipToRootHeight ||
      limits.lineLimit === undefined ||
      visibleCount.value >= options.items.length
    ) {
      return;
    }
    const averageWidth = averageItemWidth(measuredItemWidths);
    if (averageWidth === null || rootWidthDelta < averageWidth - layoutTolerance) {
      return;
    }
    const beforeSize = measureElementSize(beforeRef.value);
    const afterSize = measureElementSize(afterRef.value);
    const estimatedVisibleCount = simulateStaticFlow({
      afterWidth: afterSize?.width ?? 0,
      beforeWidth: beforeSize?.width ?? 0,
      containerWidth: rootWidth,
      itemCount: options.items.length,
      itemWidth: (index) => itemWidthAt(measuredItemWidths, index, averageWidth),
      lineLimit: limits.lineLimit,
    }).fitCount;
    if (
      estimatedVisibleCount <= visibleCount.value + 1 ||
      estimatedVisibleCount > options.items.length
    ) {
      return;
    }
    await applyVisibleCount(estimatedVisibleCount);
  }
  async function settleVisibleCount(rootElement: HTMLElement, limits: ClampLimits): Promise<void> {
    const totalItems = options.items.length;
    let measurement = measureCurrentSequence(rootElement, limits);
    while (
      visibleCount.value > 0 &&
      (!measurement.allFit || measurement.visibleItems < visibleCount.value)
    ) {
      // First shrink to a known fitting prefix. Measurement may report fewer
      // visible items than requested when before/after slots consume space.
      await applyVisibleCount(Math.min(measurement.visibleItems, visibleCount.value - 1));
      measurement = measureCurrentSequence(rootElement, limits);
    }
    while (
      measurement.allFit &&
      measurement.visibleItems === visibleCount.value &&
      visibleCount.value < totalItems
    ) {
      const currentVisibleCount = visibleCount.value;
      // Then grow one item at a time to recover space after width increases.
      // Linear growth is deliberate because each item can have arbitrary width.
      await applyVisibleCount(currentVisibleCount + 1);
      measurement = measureCurrentSequence(rootElement, limits);
      if (!measurement.allFit || measurement.visibleItems < currentVisibleCount + 1) {
        await applyVisibleCount(currentVisibleCount);
        return;
      }
    }
  }
  async function recompute(): Promise<void> {
    const totalItems = options.items.length;
    const limits: ClampLimits = {
      clipToRootHeight: options.maxHeight !== undefined,
      lineLimit: normalizeLineLimit(options.maxLines),
    };
    if (
      expanded.value ||
      totalItems === 0 ||
      (limits.lineLimit === undefined && !limits.clipToRootHeight)
    ) {
      // Without an active clamp constraint, render the full item list so slot
      // props and DOM order stay straightforward.
      await applyVisibleCount(totalItems);
      return;
    }
    const rootElement = rootRef.value;
    const rootWidth = rootElement?.getBoundingClientRect().width ?? 0;
    if (!rootElement || rootWidth <= 0) {
      // Hidden or unmounted roots cannot produce stable item measurements.
      lastRootWidth = null;
      await applyVisibleCount(totalItems);
      return;
    }
    const previousRootWidth = lastRootWidth;
    const rootWidthDelta = previousRootWidth === null ? 0 : rootWidth - previousRootWidth;
    const rootWidthShrank = rootWidthDelta < -layoutTolerance;
    const rootWidthGrew = rootWidthDelta > layoutTolerance;
    lastRootWidth = rootWidth;
    await applyVisibleCount(Math.min(visibleCount.value, totalItems));
    // Fast paths are ordered from cheapest proof to most speculative hint.
    // Any rejected path falls through to live-DOM settlement below.
    if (rootWidthShrank && (await applyStaticFlowShrink(rootElement, limits))) {
      return;
    }
    const uniformItemWidth =
      rootWidthGrew &&
      options.slots.after === undefined &&
      !limits.clipToRootHeight &&
      limits.lineLimit !== undefined
        ? uniformAverageItemWidth()
        : null;
    await applyStaticFlowCountHint(rootWidth, limits, uniformItemWidth);
    if (rootWidthGrew && (await applyStaticFlowMaterializedGrow(rootElement, rootWidth, limits))) {
      return;
    }
    if (rootWidthGrew) {
      await applyDynamicAfterGrowHint(rootWidth, rootWidthDelta, limits);
    }
    await settleVisibleCount(rootElement, limits);
  }
  const requestRecompute = createCoalescingRunner(async () => {
    isRecomputing = true;
    try {
      await recompute();
      lastLayoutSignature = layoutSignature();
    } finally {
      isRecomputing = false;
    }
  });

  function resetMeasurements() {
    measuredItemWidths = [];
  }
  return {
    requestRecompute,
    layoutSignature,
    lastObservedSignature,
    resetMeasurements,
    get isRecomputing() {
      return isRecomputing;
    },
    get lastLayoutSignature() {
      return lastLayoutSignature;
    },
  };
}

export function resolveItemKey<T>(
  itemKey: WrapClampItemKey<T> | undefined,
  item: T,
  index: number,
): string | number {
  if (typeof itemKey === 'function') {
    // Functional keys let callers describe identity for arbitrary item shapes.
    return itemKey(item, index);
  }

  if (
    typeof itemKey === 'string' &&
    item &&
    typeof item === 'object' &&
    itemKey in (item as Record<string, unknown>)
  ) {
    const value = (item as Record<string, unknown>)[itemKey];
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }
  }

  // Falling back to index keeps primitive arrays usable without requiring a key
  // option, matching Vue's simple-list ergonomics.
  return index;
}
