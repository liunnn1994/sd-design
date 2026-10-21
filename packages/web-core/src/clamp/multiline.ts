import type { BorderBoxSizeSnapshot } from './layout.js';
import type { ClampSlotProps } from './types.js';

import { createClampControls } from './controls.js';
// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import { scheduleFontFrame } from './font-frame.js';
import {
  borderBoxSizeSnapshot,
  createCoalescingRunner,
  emptyBorderBoxSignature,
  listenForFontLoads,
  observeBorderBoxSizes,
  observedBorderBoxSizeSnapshot,
} from './layout.js';

export interface MutableCell<T> {
  value: T;
}
export interface MultilineState {
  rootRef: MutableCell<HTMLElement | null>;
  contentRef: MutableCell<HTMLElement | null>;
  beforeRef: MutableCell<HTMLElement | null>;
  bodyRef: MutableCell<HTMLElement | null>;
  afterRef: MutableCell<HTMLElement | null>;
  isClamped: MutableCell<boolean>;
}
export interface MultilineOptions {
  active: MutableCell<boolean>;
  expanded: MutableCell<boolean>;
  state: MultilineState;
  afterRender: (task: () => void) => void;
  onFontLoad?: () => void;
  observeSizes?: typeof observeBorderBoxSizes;
  recompute: (expanded: MutableCell<boolean>, rootWidth?: number) => Promise<void>;
  syncAffixSignaturesOnRootChange?: boolean;
}
const emptySizeSnapshot: BorderBoxSizeSnapshot = {
  signature: emptyBorderBoxSignature,
  width: 0,
};

export function createMultilineClamp(options: MultilineOptions) {
  const {
    active,
    expanded,
    onFontLoad,
    observeSizes = observeBorderBoxSizes,
    recompute,
    syncAffixSignaturesOnRootChange = false,
  } = options;
  const controls = createClampControls(expanded);
  const state = options.state;

  let lastLayoutSignature: string | null = null;
  const observedSizes = new WeakMap<Element, BorderBoxSizeSnapshot>();
  let pendingRootWidth: number | undefined;
  let pendingAffixSignaturesFresh = false;
  let recomputeEpoch = 0;
  let fontRecomputeEpoch = 0;
  let cancelPendingFontFrame: (() => void) | null = null;

  function readRootSnapshot(): BorderBoxSizeSnapshot {
    return readSize(state.rootRef.value);
  }

  function readLayoutSignature(reuseAffixSignatures = false): string {
    // The content shell captures body geometry, while slots are tracked
    // separately. This signature only needs to decide whether another
    // synchronous clamp pass is needed.
    const content = readSize(state.contentRef.value);
    if (!reuseAffixSignatures) {
      readAffixSignatures();
    }

    return (
      observedSizeSnapshot(state.rootRef.value).signature +
      '|' +
      content.signature +
      '|' +
      observedSizeSnapshot(state.beforeRef.value).signature +
      '|' +
      observedSizeSnapshot(state.afterRef.value).signature
    );
  }

  function readAffixSignatures(): void {
    readSize(state.beforeRef.value);
    readSize(state.afterRef.value);
  }

  function readSize(element: HTMLElement | null): BorderBoxSizeSnapshot {
    const snapshot = borderBoxSizeSnapshot(element);
    if (element) observedSizes.set(element, snapshot);
    return snapshot;
  }

  function requestRecompute(rootWidth?: number): void {
    if (rootWidth !== undefined) {
      pendingRootWidth = rootWidth;
    }

    requestRecomputeRunner();
  }

  function hasObservedSizeChange(entries: readonly ResizeObserverEntry[]): boolean {
    let changed = false;

    for (const entry of entries) {
      const previous = observedSizes.get(entry.target);
      const snapshot = observedBorderBoxSizeSnapshot(
        entry,
        previous?.signature ?? emptySizeSnapshot.signature,
        true,
      );
      if (snapshot === null) {
        changed = true;
        continue;
      }

      if (previous?.signature === snapshot.signature) {
        continue;
      }

      observedSizes.set(entry.target, snapshot);
      if (entry.target === state.rootRef.value) {
        pendingRootWidth = snapshot.width;
      }
      changed = true;
    }

    return changed;
  }

  function observedSizeSnapshot(element: HTMLElement | null): BorderBoxSizeSnapshot {
    return element ? (observedSizes.get(element) ?? emptySizeSnapshot) : emptySizeSnapshot;
  }

  function affixSlotProps(): ClampSlotProps {
    return {
      expand: controls.expand,
      collapse: controls.collapse,
      toggle: controls.toggle,
      clamped: state.isClamped.value,
      expanded: expanded.value,
    };
  }

  const requestRecomputeRunner = createCoalescingRunner(async () => {
    const rootWidth = pendingRootWidth;
    const affixSignaturesFresh = pendingAffixSignaturesFresh;
    const wasClamped = state.isClamped.value;
    pendingRootWidth = undefined;
    pendingAffixSignaturesFresh = false;
    recomputeEpoch += 1;

    await recompute(expanded, rootWidth);
    if (!active.value) {
      lastLayoutSignature = null;
      return;
    }
    readRootSnapshot();
    lastLayoutSignature = readLayoutSignature(
      affixSignaturesFresh && wasClamped === state.isClamped.value,
    );
  });
  function createAffixRefSetter(target: MutableCell<HTMLElement | null>) {
    return (element: HTMLElement | null) => {
      if (target.value === element) return;
      target.value = element;
      options.afterRender(requestRecompute);
    };
  }
  const setBeforeElement = createAffixRefSetter(state.beforeRef);
  const setAfterElement = createAffixRefSetter(state.afterRef);

  function cancelFontRecompute(): void {
    if (cancelPendingFontFrame !== null) {
      cancelPendingFontFrame();
      cancelPendingFontFrame = null;
    }
  }

  function requestFontRecompute(): void {
    onFontLoad?.();
    fontRecomputeEpoch = recomputeEpoch;
    cancelPendingFontFrame ??= scheduleFontFrame(() => {
      cancelPendingFontFrame = null;

      // A same-frame resize/update pass already measured the current fonts.
      if (fontRecomputeEpoch === recomputeEpoch) {
        requestRecompute();
      }
    });
  }

  function observe(): () => void {
    if (!active.value) return () => {};

    const observed = [
      state.rootRef.value,
      state.contentRef.value,
      state.beforeRef.value,
      state.afterRef.value,
    ];
    const stopObserving = observeSizes(
      observed.filter((element): element is HTMLElement => element instanceof HTMLElement),
      (entries) => {
        // ResizeObserver is the async catch-all for container and slot sizes.
        if (hasObservedSizeChange(entries)) {
          requestRecompute();
        }
      },
    );

    return stopObserving;
  }

  function listenFonts(): () => void {
    return active.value ? listenForFontLoads(requestFontRecompute) : () => {};
  }

  function mount(): void {
    if (active.value) {
      requestRecompute();
    }
  }

  function updated(): void {
    if (!active.value) {
      return;
    }

    const previousRootSizeSignature = observedSizeSnapshot(state.rootRef.value).signature;
    const rootSnapshot = readRootSnapshot();
    if (rootSnapshot.signature !== previousRootSizeSignature) {
      // A root change is enough to start the same-flush pass. Rich opts into
      // fresh affix signatures for hidden clone validation; content refreshes
      // after recompute records the settled layout.
      if (syncAffixSignaturesOnRootChange) {
        readAffixSignatures();
        pendingAffixSignaturesFresh = true;
      }
      requestRecompute(rootSnapshot.width);
      return;
    }

    if (readLayoutSignature() !== lastLayoutSignature) {
      // Same-flush Vue updates should not wait for a later ResizeObserver tick;
      // otherwise stale clamp output can be painted for one frame.
      requestRecompute(rootSnapshot.width);
    }
  }

  return {
    mount,
    updated,
    observe,
    listenFonts,
    dispose: cancelFontRecompute,
    ...state,
    ...controls,
    affixSlotProps,
    observedSizeSnapshot,
    setBeforeElement,
    setAfterElement,
    requestRecompute,
  };
}
