import type { MarkdownImageLifecycle } from './image.js';
import type { MarkdownTextProbeProfile } from './text-height.js';
import type {
  MarkstreamRendererHandle,
  MarkstreamVirtualAnchor,
  MarkstreamVirtualMetrics,
  MarkstreamVirtualReason,
  MarkstreamVirtualState,
  MarkstreamHeightCache,
} from './virtual-types.js';

import { getMarkdownFallbackHeight } from './fallback-height.js';
import { estimateMarkdownTextHeight } from './text-height.js';
import {
  getCompatibleMarkdownHeightCache,
  getCompatibleMarkdownStandaloneHeightCache,
  getMarkdownContentHash,
  getMarkdownNodeSignature,
  getMarkdownWidthBucket,
  limitMarkdownHeightCache,
} from './virtual-state.js';

export interface MarkdownVirtualControllerConfig {
  nodes: readonly unknown[];
  sessionKey: string;
  threadKey?: string;
  measurementKey?: string;
  indexPrefix: string;
  final?: boolean | undefined;
  virtual?: boolean;
  coordinated?: boolean;
  maxLiveNodes?: number;
  liveNodeBuffer?: number;
  renderedCount?: number;
  isNodeRendered?(index: number): boolean;
  customParagraph?: boolean;
  textProbeProfile?: MarkdownTextProbeProfile | undefined;
  estimateCodeHeight?(node: unknown, width: number): { height: number } | null;
  scrollRoot?: HTMLElement | null;
  settleMode?: 'auto' | 'manual';
  settledToken?: string | number | boolean;
  heightCacheLimit?: number;
  heightCache?: MarkstreamHeightCache | null | undefined;
  heightCacheWidth?: number;
  heightDiffThresholdPx?: number;
  emitIntervalMs?: number;
}
export interface MarkdownVirtualControllerPort {
  config(): MarkdownVirtualControllerConfig;
  afterRender(): Promise<void>;
  notify(): void;
  flushPending?(): void;
  heightChange?(metrics: MarkstreamVirtualMetrics): void;
  virtualStateChange?(state: MarkstreamVirtualState): void;
  renderSettled?(metrics: MarkstreamVirtualMetrics): void;
  renderFinal?(metrics: MarkstreamVirtualMetrics): void;
  anchorChange?(anchor: MarkstreamVirtualAnchor): void;
}
export interface MarkdownVirtualController
  extends MarkstreamRendererHandle, MarkdownImageLifecycle {
  connect(root: HTMLElement | null): void;
  setNode(index: number, element: HTMLElement | null): void;
  update(reason?: MarkstreamVirtualReason): void;
  getRange(): { start: number; end: number; top: number; bottom: number };
  getPlaceholderHeight(index: number): number;
  dispose(): void;
}

export function createMarkdownVirtualController(
  port: MarkdownVirtualControllerPort,
): MarkdownVirtualController {
  let root: HTMLElement | null = null;
  let scrollRoot: HTMLElement | null = null;
  let observer: ResizeObserver | undefined;
  let cleanup: (() => void) | undefined;
  let width = 0;
  let revision = 0;
  let stableRevision = -1;
  let emittedSettled = -1;
  let lastMetrics: MarkstreamVirtualMetrics | undefined;
  let lastEmissionAt = -Infinity;
  let emissionTimer: ReturnType<typeof setTimeout> | undefined;
  let lastAnchor = '';
  let reason: MarkstreamVirtualReason = 'content';
  let identity = '';
  let signatures: string[] = [];
  let inputFlags = '';
  let manual = false;
  let disposed = false;
  let scheduled = false;
  let generation = 0;
  let prefix: number[] | undefined;
  let average: number | undefined;
  let textProbeProfile: MarkdownTextProbeProfile | undefined;
  let estimateCodeHeight: MarkdownVirtualControllerConfig['estimateCodeHeight'];
  let follow:
    | { index: number; align: 'start' | 'center' | 'end' | 'nearest' }
    | { anchor: MarkstreamVirtualAnchor }
    | undefined;
  let writtenTop: number | undefined;
  let restoreKey = '';
  let standaloneCacheKey = '';
  let standaloneCacheInputs: readonly unknown[] = [];
  let restoreRequest = 0;
  let queuedRestore:
    | {
        state: MarkstreamVirtualState;
        options: NonNullable<Parameters<MarkstreamRendererHandle['restoreVirtualState']>[1]>;
        request: number;
      }
    | undefined;
  const elements = new Map<number, HTMLElement>();
  const heights = new Map<number, number>();
  const pending = new Map<string, { count: number; identity: string }>();
  const frames = new Set<() => void>();
  const config = port.config;
  const currentIdentity = () =>
    [config().sessionKey, config().threadKey ?? '', config().measurementKey ?? ''].join('\0');
  function invalidate(nextReason: MarkstreamVirtualReason) {
    revision++;
    reason = nextReason;
    prefix = undefined;
    average = undefined;
    stableRevision = -1;
  }
  function averageHeight() {
    return (average ??= heights.size
      ? Math.max(12, [...heights.values()].reduce((sum, height) => sum + height, 0) / heights.size)
      : 32);
  }
  function placeholderHeight(index: number) {
    const options = config();
    const measured = heights.get(index);
    if (measured !== undefined) return measured;
    const node = options.nodes[index] as { type?: string } | undefined;
    if (
      options.coordinated &&
      !(options.customParagraph && ['paragraph', 'list_item', 'list'].includes(node?.type ?? ''))
    ) {
      const estimate = estimateMarkdownTextHeight(node, width, options.textProbeProfile);
      if (estimate) return estimate.height;
    }
    if (options.coordinated) {
      const estimate = options.estimateCodeHeight?.(node, width);
      if (estimate) return estimate.height;
    }
    return getMarkdownFallbackHeight(
      options.nodes[index],
      width,
      options.coordinated ? averageHeight() : 32,
      options.customParagraph,
    );
  }
  function offsets() {
    if (prefix) return prefix;
    const count = config().nodes.length;
    const average = averageHeight();
    prefix = [0];
    for (let index = 0; index < count; index++)
      prefix.push(
        prefix[index] +
          (config().coordinated ? placeholderHeight(index) : (heights.get(index) ?? average)),
      );
    return prefix;
  }
  function indexAt(offset: number) {
    const positions = offsets();
    let low = 0,
      high = Math.max(0, positions.length - 2);
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (positions[middle] > offset) high = middle - 1;
      else low = middle;
    }
    return low;
  }
  function box() {
    if (!root || !scrollRoot) return null;
    const doc = root.ownerDocument;
    const viewport =
      scrollRoot === doc.scrollingElement ||
      scrollRoot === doc.documentElement ||
      scrollRoot === doc.body;
    const maximum = Math.max(0, scrollRoot.scrollHeight - scrollRoot.clientHeight);
    const reverse =
      !viewport && doc.defaultView?.getComputedStyle(scrollRoot).flexDirection === 'column-reverse';
    const top = reverse ? maximum + scrollRoot.scrollTop : scrollRoot.scrollTop;
    const viewportTop = viewport
      ? 0
      : scrollRoot.getBoundingClientRect().top + scrollRoot.clientTop;
    const height = viewport ? doc.documentElement.clientHeight : scrollRoot.clientHeight;
    return {
      doc,
      viewport,
      reverse,
      maximum,
      top,
      height,
      viewportTop,
      rendererTop: root.getBoundingClientRect().top - viewportTop + top,
    };
  }
  function writeScroll(top: number) {
    const bounds = box();
    if (!bounds || !scrollRoot) return;
    scrollRoot.scrollTop = bounds.reverse ? top - bounds.maximum : top;
    writtenTop = box()?.top;
  }
  function range() {
    const options = config();
    const count = options.nodes.length;
    const positions = offsets();
    if (!options.virtual || !count) return { start: 0, end: count, top: 0, bottom: 0 };
    const buffer = Math.max(0, Math.trunc(options.liveNodeBuffer ?? 60));
    const maximum = Math.max(1, Math.trunc(options.maxLiveNodes || 220));
    const bounds = box();
    const first = bounds ? indexAt(Math.max(0, bounds.top - bounds.rendererTop)) : 0;
    const last = bounds
      ? indexAt(Math.max(0, bounds.top - bounds.rendererTop + bounds.height))
      : first;
    const start = Math.max(0, first - buffer);
    const end = Math.min(count, Math.max(last + buffer + 1, start + maximum));
    return {
      start,
      end,
      top: positions[start],
      bottom: Math.max(0, positions[count] - positions[end]),
    };
  }
  function measured() {
    const options = config(),
      visible = range();
    if (
      !root ||
      !options.final ||
      pending.size ||
      (options.renderedCount ?? options.nodes.length) < options.nodes.length
    )
      return false;
    for (let index = visible.start; index < visible.end; index++)
      if (options.isNodeRendered?.(index) === false || !heights.has(index) || !elements.has(index))
        return false;
    return true;
  }
  function ready() {
    const options = config();
    return (
      measured() &&
      (options.settleMode !== 'manual' ||
        manual ||
        !(
          options.settledToken == null ||
          options.settledToken === false ||
          options.settledToken === ''
        ))
    );
  }
  function metrics(nextReason = reason): MarkstreamVirtualMetrics {
    const options = config(),
      visible = range(),
      positions = offsets();
    const count = options.nodes.length,
      measuredCount = heights.size;
    const stable = stableRevision === revision && ready();
    const phase = !options.final
      ? count
        ? 'streaming'
        : 'estimating'
      : !measured()
        ? 'measuring'
        : stable
          ? 'settled'
          : 'settling';
    return {
      sessionKey: options.sessionKey,
      threadKey: options.threadKey,
      phase,
      nodeCount: count,
      liveRange: { start: visible.start, end: visible.end },
      renderedCount: options.renderedCount ?? count,
      measuredCount,
      estimatedCount: Math.max(0, count - measuredCount),
      averageNodeHeight: averageHeight(),
      topSpacerHeight: visible.top,
      bottomSpacerHeight: visible.bottom,
      visibleDomHeight: [...elements.values()].reduce(
        (sum, element) => sum + element.offsetHeight,
        0,
      ),
      totalHeight: Math.max(positions[count] ?? 0, root?.offsetHeight ?? 0),
      width,
      final: options.final === true,
      stable,
      confidence:
        count > 0 && measuredCount >= count
          ? 'measured'
          : measuredCount > 0 || count > 0
            ? 'mixed'
            : 'estimate',
      reason: nextReason,
    };
  }
  function anchor(
    requireViewport = false,
    fallback = false,
  ): { anchor: MarkstreamVirtualAnchor; captured: boolean } | null {
    const bounds = box(),
      count = config().nodes.length;
    if (bounds && root && count) {
      const rect = root.getBoundingClientRect();
      const near =
        rect.bottom >= bounds.viewportTop - 64 &&
        rect.top <= bounds.viewportTop + bounds.height + 64;
      if (requireViewport && !near) return null;
      const bottomDistance = bounds.viewportTop + bounds.height - rect.bottom;
      if (bounds.maximum - bounds.top <= 64 && bottomDistance >= -8 && bottomDistance <= 160)
        return {
          anchor: { type: 'bottom', distanceFromBottomPx: Math.max(0, bottomDistance) },
          captured: true,
        };
      const offset = Math.max(0, bounds.top - bounds.rendererTop);
      const nodeIndex = indexAt(offset),
        positions = offsets();
      return {
        anchor: {
          type: 'node',
          nodeIndex,
          offsetWithinNodePx: Math.max(
            0,
            Math.min(
              offset - positions[nodeIndex],
              positions[nodeIndex + 1] - positions[nodeIndex] - 1,
            ),
          ),
        },
        captured: near,
      };
    }
    return fallback && count
      ? {
          anchor: { type: 'node', nodeIndex: range().start, offsetWithinNodePx: 0 },
          captured: false,
        }
      : null;
  }
  function capture(
    options: Parameters<MarkstreamRendererHandle['captureVirtualState']>[0] = {},
  ): MarkstreamVirtualState | null {
    const current = config(),
      measured = metrics('manual');
    const captured = anchor(options.requireViewport === true, options.allowFallbackAnchor === true);
    const heightCache = limitMarkdownHeightCache(
      [...heights]
        .map(([index, height]) => ({
          index,
          height,
          nodeType: String((current.nodes[index] as { type?: unknown } | undefined)?.type ?? ''),
          signature: signatures[index] ?? getMarkdownNodeSignature(current.nodes[index]),
        }))
        .sort((left, right) => left.index - right.index),
      measured.liveRange,
      current.nodes.length,
      current.liveNodeBuffer ?? 60,
      current.heightCacheLimit,
    );
    if (!captured && !heightCache.length && options.includeEmptyState === false) return null;
    return {
      sessionKey: current.sessionKey,
      threadKey: current.threadKey,
      ...(captured ? { anchor: captured.anchor } : {}),
      anchorCaptured: captured?.captured ?? false,
      metrics: measured,
      width,
      contentHash: getMarkdownContentHash(current.nodes),
      measurementKey: current.measurementKey,
      heightCache: heightCache.length ? heightCache : undefined,
    };
  }
  function metricsChanged(next: MarkstreamVirtualMetrics) {
    return (
      !lastMetrics ||
      Math.abs(next.totalHeight - lastMetrics.totalHeight) >
        (config().heightDiffThresholdPx ?? 1) ||
      next.phase !== lastMetrics.phase ||
      next.sessionKey !== lastMetrics.sessionKey ||
      next.threadKey !== lastMetrics.threadKey ||
      next.stable !== lastMetrics.stable ||
      next.final !== lastMetrics.final ||
      next.width !== lastMetrics.width ||
      next.measuredCount !== lastMetrics.measuredCount ||
      next.nodeCount !== lastMetrics.nodeCount ||
      next.liveRange.start !== lastMetrics.liveRange.start ||
      next.liveRange.end !== lastMetrics.liveRange.end
    );
  }
  function emitNow(force = false) {
    if (disposed) return;
    const next = metrics();
    if (force || metricsChanged(next)) {
      lastMetrics = next;
      lastEmissionAt = performance.now();
      port.heightChange?.(next);
      const state = capture();
      if (state) {
        state.metrics = next;
        port.virtualStateChange?.(state);
      }
    }
    const currentAnchor = anchor();
    const key = JSON.stringify(currentAnchor?.anchor);
    if (currentAnchor?.captured && key !== lastAnchor) {
      lastAnchor = key;
      port.anchorChange?.(currentAnchor.anchor);
    }
    if (next.stable && emittedSettled !== revision) {
      emittedSettled = revision;
      port.renderSettled?.(next);
      if (next.final)
        port.renderFinal?.({
          ...next,
          phase: 'final',
          confidence: next.measuredCount >= next.nodeCount ? 'final' : next.confidence,
        });
    }
  }
  function cancelEmission() {
    clearTimeout(emissionTimer);
    emissionTimer = undefined;
  }
  function emit(force = false) {
    if (disposed) return;
    if (force) {
      cancelEmission();
      emitNow(true);
      return;
    }
    if (emissionTimer !== undefined) return;
    const interval = Math.max(0, config().emitIntervalMs ?? 32);
    const delay = Math.max(0, interval - (performance.now() - lastEmissionAt));
    if (delay > 0)
      emissionTimer = setTimeout(() => {
        emissionTimer = undefined;
        emitNow();
      }, delay);
    else emitNow();
  }
  function waitFrame() {
    if (!root || disposed) return Promise.resolve();
    const view = root.ownerDocument.defaultView;
    return new Promise<void>((resolve) => {
      let frame: number | undefined;
      const done = () => {
        if (frame != null) view?.cancelAnimationFrame(frame);
        clearTimeout(timer);
        frames.delete(done);
        resolve();
      };
      const timer = setTimeout(done, 40);
      frames.add(done);
      frame = view?.requestAnimationFrame(done);
    });
  }
  function measure() {
    if (!root || disposed) return;
    const saved = !follow && (config().virtual || config().coordinated) ? anchor() : null;
    const nextWidth = root.clientWidth || root.getBoundingClientRect().width;
    const resized = nextWidth !== width;
    if (getMarkdownWidthBucket(nextWidth) !== getMarkdownWidthBucket(width)) {
      heights.clear();
      standaloneCacheKey = '';
    }
    if (resized) invalidate('resize');
    width = nextWidth;
    let changed = false;
    const current = config();
    const seedInputs = [
      current.heightCache,
      current.heightCacheWidth,
      current.coordinated,
      identity,
      signatures,
      getMarkdownWidthBucket(width),
    ];
    if (seedInputs.some((value, index) => value !== standaloneCacheInputs[index])) {
      standaloneCacheInputs = seedInputs;
      const seed = current.coordinated
        ? getCompatibleMarkdownStandaloneHeightCache(
            { nodes: current.nodes, width },
            current.heightCache,
            current.heightCacheWidth,
          )
        : [];
      if (seed.length) {
        const key = [
          identity,
          getMarkdownWidthBucket(width),
          current.nodes.length,
          ...seed.map((entry) =>
            [
              entry.index,
              Math.round(entry.height * 10),
              entry.nodeType ?? '',
              entry.signature,
            ].join('\u0002'),
          ),
        ].join('\u0001');
        if (key !== standaloneCacheKey) {
          standaloneCacheKey = key;
          for (const entry of seed) {
            if (heights.get(entry.index) !== entry.height) {
              heights.set(entry.index, entry.height);
              changed = true;
            }
          }
        }
      } else standaloneCacheKey = '';
    }
    for (const [index, element] of elements) {
      if (config().isNodeRendered?.(index) === false) continue;
      const height = element.offsetHeight;
      if (index < config().nodes.length && height > 0 && heights.get(index) !== height) {
        heights.set(index, height);
        changed = true;
      }
    }
    if (changed) {
      invalidate('node-resize');
      if (follow) applyFollow();
      else if (saved?.captured) applyAnchor(saved.anchor);
      port.notify();
    } else if (resized) port.notify();
    applyQueuedRestore();
  }
  function applyQueuedRestore() {
    if (!queuedRestore || disposed) return;
    const { state, options, request } = queuedRestore;
    const current = config();
    if (
      !current.coordinated ||
      state.sessionKey !== current.sessionKey ||
      (state.threadKey ?? '') !== (current.threadKey ?? '')
    ) {
      queuedRestore = undefined;
      return;
    }
    if (!root || !current.nodes.length) return;
    const saved =
      state.anchorCaptured !== false || options.allowUncapturedAnchor ? state.anchor : undefined;
    const stateWidth = state.width > 0 ? state.width : state.metrics.width;
    if (
      width <= 0 &&
      (state.heightCache?.length || (options.restoreAnchor && saved && stateWidth > 0))
    )
      return;
    queuedRestore = undefined;
    const cache = getCompatibleMarkdownHeightCache({ ...current, width }, state);
    for (const entry of cache) heights.set(entry.index, entry.height);
    if (cache.length) {
      invalidate('restore');
      port.notify();
    }
    if (options.restoreAnchor && saved) {
      const token = `${identity}\0${options.restoreToken ?? 'imperative'}\0${JSON.stringify(saved)}`;
      const expectedIdentity = identity;
      if (token !== restoreKey) {
        void port.afterRender().then(() => {
          if (
            disposed ||
            !root ||
            restoreRequest !== request ||
            currentIdentity() !== expectedIdentity
          )
            return;
          restoreKey = token;
          follow = { anchor: saved };
          applyFollow();
          port.notify();
          schedule();
        });
      }
    }
    schedule();
  }
  function schedule() {
    if (scheduled || disposed || !root) return;
    scheduled = true;
    const token = generation;
    void (async () => {
      await waitFrame();
      if (token !== generation) return;
      if (!root || disposed) {
        scheduled = false;
        return;
      }
      measure();
      const previous = revision;
      await port.afterRender();
      await waitFrame();
      if (token !== generation) return;
      scheduled = false;
      if (!root || disposed) return;
      measure();
      if (revision === previous && ready()) stableRevision = revision;
      emit();
      if (revision !== previous) schedule();
    })();
  }
  function update(nextReason: MarkstreamVirtualReason = 'content') {
    const options = config();
    const nextIdentity = currentIdentity();
    const nextFlags = [
      options.final,
      options.virtual,
      options.coordinated,
      options.customParagraph,
      options.maxLiveNodes,
      options.liveNodeBuffer,
      options.renderedCount,
      options.settleMode,
      options.settledToken,
    ].join('\0');
    let changed =
      nextFlags !== inputFlags ||
      nextIdentity !== identity ||
      options.textProbeProfile !== textProbeProfile ||
      options.estimateCodeHeight !== estimateCodeHeight;
    textProbeProfile = options.textProbeProfile;
    estimateCodeHeight = options.estimateCodeHeight;
    if (nextIdentity !== identity) {
      heights.clear();
      for (const [key, entry] of pending) if (entry.identity !== nextIdentity) pending.delete(key);
      manual = false;
      emittedSettled = -1;
      follow = undefined;
      restoreKey = '';
      standaloneCacheKey = '';
    }
    const nextSignatures = options.nodes.map(getMarkdownNodeSignature);
    for (let index = 0; index < Math.max(signatures.length, nextSignatures.length); index++)
      if (signatures[index] !== nextSignatures[index]) {
        heights.delete(index);
        changed = true;
      }
    signatures = nextSignatures;
    identity = nextIdentity;
    inputFlags = nextFlags;
    if (changed) {
      invalidate(nextReason);
      port.notify();
    }
    measure();
    applyQueuedRestore();
    schedule();
  }
  function disconnect() {
    cancelEmission();
    cleanup?.();
    cleanup = undefined;
    observer?.disconnect();
    observer = undefined;
    scrollRoot = null;
  }
  function flushUnmountSnapshot() {
    if (!root || disposed || !config().coordinated) return;
    try {
      measure();
      const next = metrics('manual');
      if (metricsChanged(next)) {
        lastMetrics = next;
        lastEmissionAt = performance.now();
        port.heightChange?.(next);
      }
      const state = capture();
      if (state) {
        state.metrics = next;
        port.virtualStateChange?.(state);
        if (state.anchor) port.anchorChange?.(state.anchor);
      }
    } catch {
      // Consumer callbacks must not prevent observer and timer cleanup.
    }
  }
  function connect(element: HTMLElement | null) {
    if (!element) flushUnmountSnapshot();
    generation++;
    scheduled = false;
    disconnect();
    root = element;
    disposed = false;
    if (!root) {
      for (const done of [...frames]) done();
      return;
    }
    const doc = root.ownerDocument;
    scrollRoot = config().scrollRoot ?? null;
    for (let parent = root.parentElement; !scrollRoot && parent; parent = parent.parentElement)
      if (/(auto|scroll|overlay)/.test(doc.defaultView?.getComputedStyle(parent).overflowY ?? ''))
        scrollRoot = parent;
    scrollRoot ??= (doc.scrollingElement as HTMLElement | null) ?? doc.documentElement;
    const onScroll = () => {
      const top = box()?.top;
      if (top != null && writtenTop != null && Math.abs(top - writtenTop) > 2) follow = undefined;
      port.notify();
      emit();
      schedule();
    };
    const onIntent = () => {
      follow = undefined;
      writtenTop = undefined;
    };
    const onFont = () => {
      invalidate('font');
      measure();
      schedule();
    };
    const eventRoot =
      scrollRoot === doc.scrollingElement || scrollRoot === doc.documentElement
        ? doc.defaultView
        : scrollRoot;
    eventRoot?.addEventListener('scroll', onScroll, { passive: true });
    for (const name of ['wheel', 'pointerdown', 'touchstart', 'keydown'])
      eventRoot?.addEventListener(name, onIntent, { passive: true });
    doc.fonts?.addEventListener('loadingdone', onFont);
    cleanup = () => {
      eventRoot?.removeEventListener('scroll', onScroll);
      for (const name of ['wheel', 'pointerdown', 'touchstart', 'keydown'])
        eventRoot?.removeEventListener(name, onIntent);
      doc.fonts?.removeEventListener('loadingdone', onFont);
    };
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        measure();
        schedule();
      });
      observer.observe(root);
      for (const node of elements.values()) observer.observe(node);
      if (scrollRoot !== root) observer.observe(scrollRoot);
    }
    update();
  }
  function resolveIndex(key: string | number) {
    if (typeof key === 'number')
      return Number.isInteger(key) && key >= 0 && key < config().nodes.length ? key : null;
    const prefix = `${config().indexPrefix}-`;
    const suffix = key.startsWith(prefix) ? key.slice(prefix.length).split('-')[0] : key;
    if (!/^\d+$/.test(suffix)) return null;
    const index = Number(suffix);
    return Number.isInteger(index) && index >= 0 && index < config().nodes.length ? index : null;
  }
  async function forceMeasure(nextReason: MarkstreamVirtualReason = 'manual') {
    await port.afterRender();
    measure();
    reason = nextReason;
    await port.afterRender();
    emit(true);
    return metrics(nextReason);
  }
  async function settle(options: Parameters<MarkstreamRendererHandle['settle']>[0] = {}) {
    if (options.flushPendingTimers) port.flushPending?.();
    manual = true;
    const started = Date.now(),
      required = Math.max(1, Math.trunc(options.frames ?? 2));
    let unchanged = 0;
    while (!disposed && root && Date.now() - started <= (options.timeoutMs ?? 2000)) {
      const previous = revision;
      await port.afterRender();
      await waitFrame();
      measure();
      unchanged = previous === revision && ready() ? unchanged + 1 : 0;
      if (unchanged >= required) {
        stableRevision = revision;
        break;
      }
    }
    reason = options.reason ?? 'manual';
    emit(true);
    return metrics(reason);
  }
  function applyAnchor(saved: MarkstreamVirtualAnchor) {
    const bounds = box();
    if (!bounds) return;
    if (saved.type === 'node') {
      const index = Math.max(0, Math.min(config().nodes.length - 1, saved.nodeIndex));
      writeScroll(
        bounds.rendererTop + (offsets()[index] ?? 0) + Math.max(0, saved.offsetWithinNodePx),
      );
    } else
      writeScroll(
        bounds.rendererTop +
          (offsets().at(-1) ?? 0) -
          bounds.height -
          Math.max(0, saved.distanceFromBottomPx),
      );
  }
  function applyFollow() {
    if (!follow) return;
    if ('anchor' in follow) applyAnchor(follow.anchor);
    else positionNode(follow.index, follow.align);
  }
  function positionNode(index: number, align: 'start' | 'center' | 'end' | 'nearest') {
    const bounds = box(),
      count = config().nodes.length;
    if (!bounds || !count || !Number.isFinite(index)) return;
    const target = Math.max(0, Math.min(count - 1, Math.trunc(index))),
      positions = offsets();
    const start = bounds.rendererTop + positions[target],
      end = bounds.rendererTop + positions[target + 1];
    let top = start;
    if (align === 'center') top = start - (bounds.height - (end - start)) / 2;
    if (align === 'end') top = end - bounds.height;
    if (align === 'nearest')
      top =
        start < bounds.top
          ? start
          : end > bounds.top + bounds.height
            ? end - bounds.height
            : bounds.top;
    writeScroll(top);
  }
  function scrollToNode(index: number, align: 'start' | 'center' | 'end' | 'nearest' = 'start') {
    follow = { index, align };
    applyFollow();
    port.notify();
    schedule();
  }
  return {
    connect,
    update,
    getRange: range,
    getPlaceholderHeight: placeholderHeight,
    getVirtualMetrics: () => metrics(),
    captureVirtualState: capture,
    forceMeasure,
    settle,
    scrollToNode,
    setNode(index, element) {
      const previous = elements.get(index);
      if (previous && previous !== element) observer?.unobserve(previous);
      if (element) {
        elements.set(index, element);
        observer?.observe(element);
      } else elements.delete(index);
      schedule();
    },
    reportHeight(key, height) {
      const index = resolveIndex(key);
      if (index == null || !Number.isFinite(height) || height <= 0) return;
      const measured = elements.get(index)?.offsetHeight || height;
      if (heights.get(index) === measured) return;
      heights.set(index, measured);
      invalidate('async-node');
      port.notify();
      schedule();
    },
    markPending(key) {
      if (resolveIndex(key) == null) return;
      const entry = pending.get(String(key));
      const epoch = currentIdentity();
      pending.set(String(key), {
        identity: epoch,
        count: entry?.identity === epoch ? entry.count + 1 : 1,
      });
      invalidate('async-node');
      schedule();
    },
    markSettled(key) {
      const entry = pending.get(String(key));
      if (!entry || entry.identity !== currentIdentity()) return;
      if (entry.count === 1) pending.delete(String(key));
      else entry.count--;
      invalidate('async-node');
      schedule();
    },
    restoreVirtualState(state, options = {}) {
      queuedRestore = { state, options, request: ++restoreRequest };
      update('restore');
    },
    dispose() {
      flushUnmountSnapshot();
      queuedRestore = undefined;
      restoreRequest++;
      generation++;
      scheduled = false;
      disposed = true;
      disconnect();
      root = null;
      for (const done of [...frames]) done();
      elements.clear();
      pending.clear();
    },
  };
}
