import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { BloomMenuItem, BloomMenuOffset } from '../dist/bloom-menu/types.js';

import {
  createBloomMenuFoundation,
  getBloomMenuInitialState,
  type BloomMenuFoundationState,
} from '../dist/bloom-menu/foundation.js';
function fixture(modelValue: boolean | undefined = undefined, defaultOpen = false) {
  let controller!: ReturnType<typeof createBloomMenuFoundation<BloomMenuItem>>;
  const initial = getBloomMenuInitialState(modelValue, defaultOpen),
    events: unknown[][] = [],
    render: (() => void)[] = [],
    frames: (() => void)[] = [];
  const props: {
    items: BloomMenuItem[];
    columns: number;
    modelValue: boolean | undefined;
    offset: BloomMenuOffset | undefined;
  } = {
    items: [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two', disabled: true },
    ],
    columns: 3,
    modelValue,
    offset: undefined,
  };
  const env = {
    button: undefined as HTMLElement | undefined,
    panel: undefined as HTMLElement | undefined,
    custom: false,
    reduced: false as boolean | null,
  };
  const state: BloomMenuFoundationState<BloomMenuItem> = {
    props,
    prefixCls: 'sd-bloom-menu',
    get buttonElement() {
      return env.button;
    },
    get panelElement() {
      return env.panel;
    },
    get hasCustomTrigger() {
      return env.custom;
    },
    get reducedMotion() {
      return env.reduced;
    },
    get normalizedColumns() {
      return controller.getNormalizedColumns();
    },
    get rowCount() {
      return controller.getRowCount();
    },
    get isOpen() {
      return controller.getIsOpen();
    },
    get panelCollapsed() {
      return controller.getPanelCollapsed();
    },
    get panelAnimate() {
      return controller.getPanelAnimate();
    },
    ...initial,
  };
  controller = createBloomMenuFoundation(state, {
    afterRender: (task) => render.push(task),
    requestFrame: (task) => frames.push(task),
    update: (value) => events.push(['update', value, state.internalOpen]),
    opened: () => events.push(['open']),
    closed: () => events.push(['close']),
    select: (item, index) => events.push(['select', item, index]),
  });
  return {
    controller,
    state,
    props,
    env,
    events,
    render,
    frames,
    flush: () => render.splice(0).forEach((task) => task()),
  };
}
class ElementStub {
  width = 144;
  height = 44;
  focuses = 0;
  visibility = 'visible';
  selected = new Map<string, ElementStub>();
  descendants = new Set<ElementStub>();
  style = {
    backgroundColor: 'red',
    borderColor: 'blue',
    borderRadius: '8px',
    boxShadow: 'none',
    color: 'white',
  };
  onFocus: () => void = () => {};
  querySelector(selector: string) {
    return this.selected.get(selector) ?? null;
  }
  getBoundingClientRect() {
    return { width: this.width, height: this.height };
  }
  contains(node: unknown) {
    return node === this || this.descendants.has(node as ElementStub);
  }
  focus() {
    this.focuses++;
    this.onFocus();
  }
}
function browser(
  run: (b: {
    button: ElementStub;
    panel: ElementStub;
    item: ElementStub;
    close: ElementStub;
    document: { activeElement: unknown };
    timers: Map<number, { task: () => void; delay: number }>;
    execute: () => void;
  }) => void,
) {
  const names = ['window', 'document', 'HTMLElement', 'getComputedStyle'] as const,
    previous = names.map((n) => Object.getOwnPropertyDescriptor(globalThis, n)),
    doc = { activeElement: undefined as unknown },
    timers = new Map<number, { task: () => void; delay: number }>();
  let sequence = 0;
  const style = (element: ElementStub) => ({ ...element.style, visibility: element.visibility });
  const button = new ElementStub(),
    panel = new ElementStub(),
    item = new ElementStub(),
    close = new ElementStub();
  panel.selected.set('.sd-bloom-menu-item:not(:disabled)', item);
  panel.selected.set('.sd-bloom-menu-close', close);
  panel.descendants.add(item);
  panel.descendants.add(close);
  for (const element of [button, panel, item, close])
    element.onFocus = () => {
      doc.activeElement = element;
    };
  try {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        clearTimeout(id: number) {
          timers.delete(id);
        },
        setTimeout(task: () => void, delay: number) {
          const id = ++sequence;
          timers.set(id, { task, delay });
          return id;
        },
        getComputedStyle: style,
      },
    });
    Object.defineProperty(globalThis, 'document', { configurable: true, value: doc });
    Object.defineProperty(globalThis, 'HTMLElement', { configurable: true, value: ElementStub });
    Object.defineProperty(globalThis, 'getComputedStyle', { configurable: true, value: style });
    run({
      button,
      panel,
      item,
      close,
      document: doc,
      timers,
      execute: () => {
        for (const [id, { task }] of [...timers]) {
          timers.delete(id);
          task();
        }
      },
    });
  } finally {
    names.forEach((name, index) => {
      if (previous[index]) Object.defineProperty(globalThis, name, previous[index]!);
      else Reflect.deleteProperty(globalThis, name);
    });
  }
}
const connect = (f: ReturnType<typeof fixture>, b: { button: ElementStub; panel: ElementStub }) => {
  f.env.button = b.button as unknown as HTMLElement;
  f.env.panel = b.panel as unknown as HTMLElement;
};

test('initial controlled/default ownership and trigger snapshots are isolated without a DOM', () => {
  const a = getBloomMenuInitialState(undefined, true),
    b = getBloomMenuInitialState(false, true);
  assert.equal(a.internalOpen, true);
  assert.equal(a.popupVisible, true);
  assert.equal(b.internalOpen, true);
  assert.equal(b.popupVisible, false);
  assert.notEqual(a.triggerStyle, b.triggerStyle);
  assert.equal(a.triggerStyle.width, 144);
  assert.equal(a.triggerStyle.height, 44);
  const f = fixture(false);
  f.props.modelValue = true;
  f.controller.syncOpen(true);
  assert.equal(f.state.popupVisible, false);
  assert.equal(f.render.length, 0);
  assert.equal(typeof globalThis.document, 'undefined');
});
test('uncontrolled open updates fallback before notifications and watcher mounts the popup', () =>
  browser((b) => {
    const f = fixture();
    connect(f, b);
    f.controller.open();
    assert.equal(f.state.isOpen, true);
    assert.equal(f.state.popupVisible, false);
    assert.deepEqual(f.events, [['update', true, true], ['open']]);
    f.controller.syncOpen(true);
    assert.equal(f.state.popupVisible, true);
    f.flush();
    assert.equal(b.item.focuses, 1);
    f.controller.open();
    assert.equal(f.events.length, 2);
  }));
test('controlled rejected opening leaves fallback and popup closed', () =>
  browser((b) => {
    const f = fixture(false);
    connect(f, b);
    f.controller.handlePopupVisibleChange(true);
    assert.equal(f.state.internalOpen, false);
    assert.equal(f.state.isOpen, false);
    assert.equal(f.state.popupVisible, false);
    assert.deepEqual(f.events, [['update', true, false], ['open']]);
    f.props.modelValue = undefined;
    assert.equal(f.state.isOpen, false);
  }));
test('forced controlled close resets Trigger state and reopening repairs it without duplicate events', () =>
  browser((b) => {
    const f = fixture(true);
    connect(f, b);
    b.document.activeElement = b.item;
    f.controller.handlePopupVisibleChange(false);
    assert.equal(b.button.focuses, 1);
    assert.equal(f.state.isOpen, true);
    assert.equal(f.state.popupVisible, false);
    assert.deepEqual(f.events, [['update', false, false], ['close']]);
    f.controller.handlePopupVisibleChange(true);
    assert.equal(f.state.popupVisible, true);
    assert.equal(f.events.length, 2);
    assert.equal(f.render.length, 1);
    f.flush();
    assert.equal(b.item.focuses, 1);
  }));
test('selection preserves item identity and event order, skips disabled items and restores fresh trigger focus', () =>
  browser((b) => {
    const f = fixture(undefined, true);
    connect(f, b);
    f.controller.selectItem(f.props.items[1], 1);
    assert.deepEqual(f.events, []);
    f.controller.selectItem(f.props.items[0], 0);
    assert.deepEqual(f.events, [
      ['select', f.props.items[0], 0],
      ['update', false, false],
      ['close'],
    ]);
    assert.equal(b.button.focuses, 0);
    const current = new ElementStub();
    f.env.button = current as unknown as HTMLElement;
    f.flush();
    assert.equal(current.focuses, 1);
    assert.equal(b.button.focuses, 0);
  }));
test('header close always queues focus restoration and normal close can leave focus unchanged', () =>
  browser((b) => {
    const f = fixture(undefined, true);
    connect(f, b);
    f.controller.close();
    assert.equal(f.render.length, 0);
    f.state.internalOpen = true;
    f.controller.closeHeaderSlot();
    assert.equal(f.render.length, 1);
    f.flush();
    assert.equal(b.button.focuses, 1);
  }));
test('closing morph delay is 450ms or 150ms and never hides a reopened popup', () =>
  browser((b) => {
    const f = fixture();
    connect(f, b);
    f.state.popupVisible = true;
    f.controller.schedulePopupHide();
    assert.equal([...b.timers.values()][0].delay, 450);
    f.state.internalOpen = true;
    b.execute();
    assert.equal(f.state.popupVisible, true);
    f.state.internalOpen = false;
    f.env.reduced = true;
    f.controller.schedulePopupHide();
    assert.equal([...b.timers.values()][0].delay, 150);
    b.execute();
    assert.equal(f.state.popupVisible, false);
  }));
test('watcher reopen and dispose cancel owned hide timers', () =>
  browser((b) => {
    const f = fixture(true);
    connect(f, b);
    f.controller.schedulePopupHide();
    assert.equal(b.timers.size, 1);
    f.controller.syncOpen(true);
    assert.equal(b.timers.size, 0);
    f.controller.schedulePopupHide();
    f.controller.dispose();
    assert.equal(b.timers.size, 0);
  }));
test('focus retry waits for visible Motion content and stops when the menu closes', () =>
  browser((b) => {
    const f = fixture(undefined, true);
    connect(f, b);
    b.item.visibility = 'hidden';
    f.controller.focusPanel();
    f.flush();
    assert.equal(f.frames.length, 1);
    assert.equal(b.item.focuses, 0);
    b.item.visibility = 'visible';
    f.frames.shift()!();
    f.flush();
    assert.equal(b.item.focuses, 1);
    f.controller.focusPanel();
    f.state.internalOpen = false;
    f.flush();
    assert.equal(b.item.focuses, 1);
  }));
test('focus uses close fallback for all-disabled items and limits missing-content retries to 30 frames', () =>
  browser((b) => {
    const f = fixture(undefined, true);
    connect(f, b);
    b.panel.selected.delete('.sd-bloom-menu-item:not(:disabled)');
    f.controller.focusPanel();
    f.flush();
    assert.equal(b.close.focuses, 1);
    b.panel.selected.clear();
    let frames = 0;
    f.controller.focusPanel();
    f.flush();
    while (f.frames.length) {
      assert.ok(frames < 31);
      frames++;
      f.frames.shift()!();
      f.flush();
    }
    assert.equal(frames, 30);
  }));
test('trigger capture uses custom slot roots except for an explicit event current target', () =>
  browser((b) => {
    const f = fixture();
    connect(f, b);
    const slot = new ElementStub();
    slot.width = 92;
    slot.height = 32;
    slot.style.backgroundColor = 'green';
    f.env.custom = true;
    b.button.selected.set(':scope .sd-bloom-menu-trigger-content > *', slot);
    f.controller.captureTriggerStyle();
    assert.equal(f.state.triggerStyle.width, 92);
    assert.equal(f.state.triggerStyle.backgroundColor, 'green');
    f.controller.captureTriggerStyle({ currentTarget: b.button } as unknown as Event);
    assert.equal(f.state.triggerStyle.width, 144);
    assert.equal(f.state.triggerStyle.height, 44);
    f.env.button = undefined;
    f.controller.captureTriggerStyle();
    assert.equal(f.state.triggerStyle.width, 144);
  }));
test('center middleware captures offset values per computation and consumes native rectangles', () => {
  const f = fixture();
  f.props.offset = { left: 40, top: 20 };
  const first = f.controller.getCenterMiddleware(),
    input = {
      rects: {
        reference: { x: 100, y: 50, width: 80, height: 40 },
        floating: { width: 200, height: 100 },
      },
    };
  assert.deepEqual(first.options, { left: 40, top: 20 });
  assert.deepEqual(first.fn(input), { x: 80, y: 40 });
  f.props.offset = {};
  assert.deepEqual(first.fn(input), { x: 80, y: 40 });
  assert.deepEqual(f.controller.getCenterMiddleware().fn(input), { x: 40, y: 20 });
});
test('grid dimensions and native border flags preserve fractional and zero column rules', () => {
  const f = fixture();
  f.props.items = [
    { value: 1, label: 'One' },
    { value: 2, label: 'Two' },
    { value: 3, label: 'Three', disabled: true },
  ];
  f.props.columns = 2.9;
  assert.equal(f.state.normalizedColumns, 2);
  assert.equal(f.state.rowCount, 2);
  assert.deepEqual(f.controller.getItemLayout(f.props.items[0], 0), {
    borderRight: true,
    borderBottom: true,
    disabled: undefined,
  });
  assert.deepEqual(f.controller.getItemLayout(f.props.items[2], 2), {
    borderRight: true,
    borderBottom: false,
    disabled: true,
  });
  f.props.items = [];
  f.props.columns = 0;
  assert.equal(f.state.normalizedColumns, 1);
  assert.equal(f.state.rowCount, 1);
});
test('shared motion targets retain reduced-motion branches, spring values and distance staggering', () => {
  const f = fixture();
  assert.equal(f.controller.getPanelInitial().opacity, 0.98);
  assert.equal(f.controller.getPanelTarget().width, 'var(--bloom-menu-source-width)');
  assert.deepEqual(f.controller.getMorphTransition(), {
    type: 'spring',
    stiffness: 320,
    damping: 28,
    mass: 0.9,
  });
  f.props.items = Array.from({ length: 9 }, (_, value) => ({ value, label: String(value) }));
  assert.equal(f.controller.getItemTransition(4).delay, 0.1);
  assert.equal(f.controller.getItemTransition(0).delay, 0.1 + Math.SQRT2 * 0.07);
  f.env.reduced = true;
  assert.equal(f.controller.getPanelInitial().opacity, 0);
  assert.equal(f.controller.getPanelTarget().opacity, 0);
  assert.equal(f.controller.getGridInitial(), false);
  assert.deepEqual(f.controller.getItemInitial(), { opacity: 0 });
  assert.deepEqual(f.controller.getMorphTransition(), { duration: 0.15 });
  f.state.internalOpen = true;
  assert.equal(f.controller.getPanelTarget().opacity, 1);
  assert.deepEqual(f.controller.getContentTransition(), { delay: 0, duration: 0.15 });
  assert.deepEqual(f.controller.getGridTransition(), {
    delay: 0,
    duration: 0.15,
    ease: [0.16, 1, 0.3, 1],
  });
});

test('normal popup opening leaves one focus schedule to the open watcher', () =>
  browser((b) => {
    const f = fixture();
    connect(f, b);
    f.controller.handlePopupVisibleChange(true);
    assert.equal(f.render.length, 0);
    f.controller.syncOpen(true);
    assert.equal(f.render.length, 1);
    f.flush();
    assert.equal(b.item.focuses, 1);
  }));
