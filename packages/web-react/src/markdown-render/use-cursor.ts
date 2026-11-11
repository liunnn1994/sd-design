import {
  findMarkdownCursorText,
  getMarkdownTypewriterMode,
  isMarkdownCursorTailEligible,
  positionMarkdownCursor,
} from '@sdata/web-core/markdown/cursor';
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

export const MarkdownCursorOwnerContext = createContext(false);
const targetClass = 'typewriter-simple-cursor-target';
export function useMarkdownCursor(options: {
  root: RefObject<HTMLElement | null>;
  source: string;
  visible: string;
  final?: boolean;
  suppliedNodes: boolean;
  fragment: boolean;
  typewriter: unknown;
  nodes: readonly { type: string }[];
  slots: ReadonlyMap<number, HTMLElement>;
  shouldRender(index: number): boolean;
}) {
  const inheritedOwner = useContext(MarkdownCursorOwnerContext);
  const live = useRef(options);
  live.current = options;
  const mode = getMarkdownTypewriterMode(options.typewriter);
  const [active, setActive] = useState(false);
  const activity = useRef(false);
  const cursor = useRef<HTMLSpanElement>(null);
  const target = useRef<HTMLElement | null>(null);
  const previous = useRef({ source: 0, visible: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const frame = useRef<number | undefined>(undefined);
  const cleanPosition = () => {
    if (frame.current != null) cancelAnimationFrame(frame.current);
    frame.current = undefined;
    target.current?.classList.remove(targetClass);
    target.current = null;
    if (cursor.current) cursor.current.style.visibility = 'hidden';
  };
  const stop = () => {
    if (timer.current != null) clearTimeout(timer.current);
    timer.current = undefined;
    activity.current = false;
    setActive(false);
    cleanPosition();
  };
  const tail = options.nodes.at(-1)?.type;
  useLayoutEffect(() => {
    if (options.fragment || inheritedOwner || mode === 'off' || options.final) {
      stop();
      return;
    }
    if (options.suppliedNodes) {
      previous.current = { source: options.source.length, visible: options.visible.length };
      stop();
      return;
    }
    const grew =
      options.source.length > previous.current.source ||
      options.visible.length > previous.current.visible;
    previous.current = { source: options.source.length, visible: options.visible.length };
    if (!isMarkdownCursorTailEligible(tail)) {
      stop();
      return;
    }
    if (!grew) return;
    activity.current = true;
    setActive(true);
    if (timer.current != null) clearTimeout(timer.current);
    timer.current = setTimeout(stop, 3000);
  }, [
    mode,
    inheritedOwner,
    options.fragment,
    options.final,
    options.suppliedNodes,
    options.source,
    options.visible,
    tail,
  ]);
  useLayoutEffect(() => {
    if (!activity.current || !options.root.current) return;
    const text = findMarkdownCursorText(options.nodes, options.slots, options.shouldRender);
    if (mode === 'simple') {
      const next =
        text?.parentElement?.closest<HTMLElement>('.text-node') ?? text?.parentElement ?? null;
      if (next !== target.current) {
        target.current?.classList.remove(targetClass);
        target.current = next;
      }
      next?.classList.add(targetClass);
      return;
    }
    target.current?.classList.remove(targetClass);
    target.current = null;
    if (mode !== 'precise' || !cursor.current || frame.current != null) return;
    const position = () => {
      frame.current = undefined;
      const current = live.current;
      if (activity.current && current.root.current && cursor.current)
        positionMarkdownCursor(
          current.root.current,
          cursor.current,
          findMarkdownCursorText(current.nodes, current.slots, current.shouldRender),
        );
    };
    if (typeof requestAnimationFrame === 'function')
      frame.current = requestAnimationFrame(position);
    else position();
  });
  useLayoutEffect(
    () => () => {
      if (timer.current != null) clearTimeout(timer.current);
      cleanPosition();
      activity.current = false;
      previous.current = { source: 0, visible: 0 };
    },
    [],
  );
  return { active, mode, ref: cursor };
}
