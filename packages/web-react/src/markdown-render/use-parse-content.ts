import {
  createMarkdownParseCoalescer,
  shouldFlushMarkdownParse,
} from '@sdata/web-core/markdown/parse-coalescer';
import { useLayoutEffect, useRef, useState } from 'react';

export function useMarkdownParseContent(options: {
  content: string;
  enabled: boolean;
  final?: boolean | undefined;
  interval?: number | undefined;
  parser: unknown;
  parseOptions: unknown;
}) {
  const [content, setContent] = useState(options.content);
  const [coalescer] = useState(() => createMarkdownParseCoalescer(options.content, setContent));
  const identity = useRef([options.parser, options.parseOptions]);
  const reset =
    identity.current[0] !== options.parser || identity.current[1] !== options.parseOptions;
  useLayoutEffect(() => {
    identity.current = [options.parser, options.parseOptions];
    coalescer.update(options.content, { ...options, reset });
  }, [
    coalescer,
    options.content,
    options.enabled,
    options.final,
    options.interval,
    options.parser,
    options.parseOptions,
  ]);
  useLayoutEffect(() => () => coalescer.cancel(), [coalescer]);
  return {
    content:
      !options.enabled ||
      options.final ||
      reset ||
      shouldFlushMarkdownParse(content, options.content)
        ? options.content
        : content,
    flush: coalescer.flush,
  };
}
