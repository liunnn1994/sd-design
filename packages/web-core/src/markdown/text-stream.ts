export interface MarkdownTextSegment {
  id: number;
  content: string;
  startedAt: number;
  finished: boolean;
}

export function createMarkdownTextStream(initial: string) {
  let settled = initial;
  let previous = initial;
  let nextId = 0;
  let segments: MarkdownTextSegment[] = [];
  function settleFinished() {
    let count = 0;
    for (const segment of segments) {
      if (!segment.finished) break;
      settled += segment.content;
      count++;
    }
    if (count) segments = segments.slice(count);
    return count > 0;
  }
  return {
    get settled() {
      return settled;
    },
    get segments(): readonly MarkdownTextSegment[] {
      return segments;
    },
    update(content: string, cached: string | undefined, fade: boolean, now: number) {
      if (fade && content === previous && (!cached || cached === content || segments.length))
        return false;
      const base = cached ?? previous;
      if (fade && base && content.length > base.length && content.startsWith(base)) {
        if (base !== previous) {
          settled = base;
          segments = [];
        }
        const delta = content.slice(base.length);
        const last = segments.at(-1);
        segments =
          last && (now - last.startedAt < 50 || segments.length >= 4)
            ? [...segments.slice(0, -1), { ...last, content: last.content + delta }]
            : [...segments, { id: nextId++, content: delta, startedAt: now, finished: false }];
      } else {
        settled = content;
        segments = [];
      }
      previous = content;
      return true;
    },
    finish(id: number, hold = false) {
      const segment = segments.find((segment) => segment.id === id);
      if (!segment) return false;
      segment.finished = true;
      return hold ? false : settleFinished();
    },
    settleFinished,
  };
}
