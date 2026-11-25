export function shouldFlushMarkdownParse(previous: string, next: string) {
  if (!previous || next.length <= 80 || next.length < previous.length || !next.startsWith(previous))
    return true;
  const delta = next.slice(previous.length);
  let end = next.length;
  while (end > 0 && next.charCodeAt(end - 1) === 10) end--;
  const line = next.slice(next.lastIndexOf('\n', end - 1) + 1, end).trim();
  const cells = line.includes('|') ? line.replace(/^\|/, '').replace(/\|$/, '').split('|') : [];
  const tableSeparator =
    cells.length >= 2 &&
    cells.every((cell) => {
      const value = cell.trim();
      return (
        value.length > 0 &&
        value
          .replace(/^:/, '')
          .replace(/:$/, '')
          .split('')
          .every((char) => char === '-')
      );
    });
  return (
    tableSeparator ||
    /^={3,}$/.test(line) ||
    /^-{3,}$/.test(line) ||
    delta.includes('\n\n') ||
    /(?:^|\n)(?:#{1,6}\s|[-+*]\s+|\d+[.)]\s+|>\s*|`{3,}|~{3,})/.test(delta)
  );
}

export function createMarkdownParseCoalescer(initial: string, commit: (content: string) => void) {
  let content = initial;
  let latest = initial;
  let committedAt = performance.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  function cancel() {
    if (timer != null) clearTimeout(timer);
    timer = undefined;
  }
  function flush(value = latest) {
    cancel();
    latest = value;
    committedAt = performance.now();
    if (content !== value) {
      content = value;
      commit(value);
    }
  }
  return {
    flush,
    cancel,
    update(
      value: string,
      options: {
        enabled: boolean;
        final?: boolean | undefined;
        interval?: number | undefined;
        reset?: boolean;
      },
    ) {
      latest = value;
      if (options.reset) {
        flush();
        return;
      }
      if (content === value) return;
      if (!options.enabled || options.final || shouldFlushMarkdownParse(content, value)) {
        flush();
        return;
      }
      if (timer != null) return;
      const interval =
        typeof options.interval === 'number' &&
        Number.isFinite(options.interval) &&
        options.interval >= 0
          ? options.interval
          : 80;
      const delay = Math.max(0, interval - (performance.now() - committedAt));
      if (delay <= 0) flush();
      else timer = setTimeout(() => flush(), delay);
    },
  };
}
