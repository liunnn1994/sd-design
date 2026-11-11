import type {
  MarkstreamHeightCache,
  MarkstreamHeightCacheEntry,
  MarkstreamVirtualState,
} from './virtual-types.js';

// Signature and cache compatibility follow markstream-vue 2.0.18; see THIRD_PARTY_NOTICES.md.
const structuralFields = new Set([
  'children',
  'items',
  'header',
  'rows',
  'cells',
  'attrs',
  'data',
  'term',
  'definition',
]);
function hashText(text: string, seed = 2166136261) {
  let hash = seed;
  for (let index = 0; index < text.length; index++)
    hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  return hash >>> 0;
}
function serialize(value: unknown, seen = new WeakSet<object>(), depth = 0): string {
  if (value == null || typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (typeof value === 'string')
    return `s:${value.length}:${hashText(value.length > 8192 ? `${value.slice(0, 8192)}...${value.length}` : value).toString(36)}`;
  if (typeof value === 'function') return 'fn';
  if (typeof value !== 'object') return typeof value;
  if (seen.has(value)) return 'cycle';
  if (depth >= 6) return 'max-depth';
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      if (value.length <= 160)
        return `a:${value.length}:${Array.from(value, (item) => serialize(item, seen, depth + 1)).join(',')}`;
      const head: string[] = [],
        tail: string[] = [];
      let hash = 2166136261;
      for (let index = 0; index < value.length; index++) {
        const entry = serialize(value[index], seen, depth + 1);
        hash = Math.imul(hashText(entry, hash) ^ 31, 16777619);
        if (index < 32) head.push(entry);
        if (index >= value.length - 32) tail.push(entry);
      }
      return [
        `a:${value.length}`,
        `h=${head.join(',')}`,
        `t=${tail.join(',')}`,
        `all=${(hash >>> 0).toString(36)}`,
      ].join(':');
    }
    const object = value as Record<string, unknown>;
    const keys = Object.keys(object)
      .filter((key) => {
        const entry = object[key];
        return (
          key !== 'parent' &&
          key !== 'el' &&
          key !== 'component' &&
          (entry == null ||
            typeof entry === 'string' ||
            typeof entry === 'number' ||
            typeof entry === 'boolean' ||
            structuralFields.has(key))
        );
      })
      .sort();
    return `o:${keys.length}:${keys.map((key) => `${key}=${serialize(object[key], seen, depth + 1)}`).join(';')}`;
  } finally {
    seen.delete(value);
  }
}
export function getMarkdownNodeSignature(node: unknown) {
  return hashText(serialize(node)).toString(36);
}
export function getMarkdownContentHash(nodes: readonly unknown[]) {
  let hash = 2166136261;
  for (const node of nodes) hash = hashText(getMarkdownNodeSignature(node), hash);
  return hash.toString(36);
}
export function getMarkdownWidthBucket(width: unknown) {
  const numeric = Number(width);
  return !Number.isFinite(numeric) || numeric <= 0 ? -1 : Math.round(numeric / 32);
}
export interface MarkdownVirtualIdentity {
  sessionKey: string;
  threadKey?: string;
  measurementKey?: string;
  width: number;
  nodes: readonly unknown[];
}
export function getCompatibleMarkdownHeightCache(
  current: MarkdownVirtualIdentity,
  state: MarkstreamVirtualState,
): MarkstreamHeightCache {
  const stateWidth =
    Number.isFinite(state.width) && state.width > 0 ? state.width : state.metrics.width;
  const widthBucket = getMarkdownWidthBucket(current.width);
  if (
    state.sessionKey !== current.sessionKey ||
    (state.threadKey ?? '') !== (current.threadKey ?? '') ||
    (state.measurementKey ?? '') !== (current.measurementKey ?? '') ||
    widthBucket === -1 ||
    getMarkdownWidthBucket(stateWidth) !== widthBucket
  )
    return [];
  const sameContent = Boolean(
    state.contentHash && state.contentHash === getMarkdownContentHash(current.nodes),
  );
  const cache = state.heightCache ?? [];
  if (
    !cache.some((entry) =>
      sameContent ? Boolean(entry.nodeType || entry.signature) : Boolean(entry.signature),
    )
  )
    return [];
  return filterHeightCache(current.nodes, cache, !sameContent, !state.contentHash);
}
function filterHeightCache(
  nodes: readonly unknown[],
  cache: MarkstreamHeightCache,
  requireSignature: boolean,
  requireMetadata: boolean,
) {
  return cache.filter((entry) => {
    if (
      !Number.isInteger(entry.index) ||
      entry.index < 0 ||
      entry.index >= nodes.length ||
      !Number.isFinite(entry.height) ||
      entry.height <= 0
    )
      return false;
    if (requireSignature && !entry.signature) return false;
    if (requireMetadata && !entry.nodeType && !entry.signature) return false;
    const node = nodes[entry.index];
    if (
      entry.nodeType &&
      entry.nodeType !== String((node as { type?: unknown } | null)?.type ?? '')
    )
      return false;
    return !entry.signature || entry.signature === getMarkdownNodeSignature(node);
  });
}
export function getCompatibleMarkdownStandaloneHeightCache(
  current: Pick<MarkdownVirtualIdentity, 'nodes' | 'width'>,
  cache: MarkstreamHeightCache | null | undefined,
  cacheWidth: number | undefined,
): MarkstreamHeightCache {
  const bucket = getMarkdownWidthBucket(current.width);
  if (bucket === -1 || getMarkdownWidthBucket(cacheWidth) !== bucket) return [];
  return filterHeightCache(current.nodes, cache ?? [], true, false);
}
export function limitMarkdownHeightCache(
  entries: MarkstreamHeightCache,
  range: { start: number; end: number },
  nodeCount: number,
  buffer: number,
  limit = 5000,
): MarkstreamHeightCache {
  if (!Number.isFinite(limit) || limit <= 0 || entries.length <= Math.max(1, Math.trunc(limit)))
    return entries;
  const maximum = Math.max(1, Math.trunc(limit));
  const selected = new Map<number, MarkstreamHeightCacheEntry>();
  const add = (entry: MarkstreamHeightCacheEntry) => {
    if (selected.size < maximum) selected.set(entry.index, entry);
  };
  const start = Math.max(0, Math.min(nodeCount, range.start - 2 * buffer));
  const end = Math.max(start, Math.min(nodeCount, range.end + 2 * buffer));
  for (const entry of entries) if (entry.index >= start && entry.index < end) add(entry);
  const stride = Math.max(1, Math.ceil(entries.length / maximum));
  for (let index = 0; index < entries.length && selected.size < maximum; index += stride)
    add(entries[index]);
  for (let index = entries.length - 1; index >= 0 && selected.size < maximum; index -= stride)
    add(entries[index]);
  return [...selected.values()].sort((left, right) => left.index - right.index).slice(0, maximum);
}
