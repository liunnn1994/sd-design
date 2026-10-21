import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { BoundaryPosition } from '../src/anchor/utils.ts';

test('scroll foundations preserve native geometry, state and cleanup contracts', async (t) => {
  const names = [
    'window',
    'document',
    'CSS',
    'requestAnimationFrame',
    'cancelAnimationFrame',
  ] as const;
  const descriptors = names.map(
    (name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const,
  );
  let now = 0;
  let frameId = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const raf = (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback);
    return frameId;
  };
  const caf = (id: number) => {
    frames.delete(id);
  };
  function frame(elapsed = 0) {
    now += elapsed;
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(now));
  }
  class Element extends EventTarget {
    scrollTop = 0;
    offsetTop = 0;
    offsetWidth = 200;
    offsetHeight = 40;
    style = { top: '' };
    id = '';
    rect = { top: 0, bottom: 40, height: 40, left: 0, right: 200, width: 200, x: 0, y: 0 };
    children = new Map<string, Element>();
    querySelector(selector: string) {
      return this.children.get(selector) ?? null;
    }
    getBoundingClientRect() {
      return this.rect;
    }
  }
  const root = new Element();
  const elements = new Map<string, Element>();
  const win = Object.assign(new EventTarget(), {
    innerHeight: 800,
    requestAnimationFrame: raf,
    cancelAnimationFrame: caf,
    location: { hash: '' },
    matchMedia: () => ({ matches: false }),
  });
  Object.defineProperty(win, Symbol.toStringTag, { value: 'Window' });
  const doc = {
    documentElement: root,
    querySelector: (selector: string) => elements.get(selector) ?? null,
  };
  for (const [name, value] of Object.entries({
    window: win,
    document: doc,
    CSS: { escape: (value: string) => value },
    requestAnimationFrame: raf,
    cancelAnimationFrame: caf,
  })) {
    Object.defineProperty(globalThis, name, { configurable: true, value });
  }
  t.mock.method(Date, 'now', () => now);
  t.after(() => {
    for (const [name, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  });
  const { getAffixPosition, createAffix } = await import('../dist/affix/foundation.js');
  const { createAnchor } = await import('../dist/anchor/foundation.js');
  const { createBackTop } = await import('../dist/back-top/foundation.js');
  const { slide } = await import('../dist/anchor/utils.js');
  const { scrollTo } = await import('../dist/_utils/scroll-to.js');
  const dom = await import('../dist/_utils/dom.js');
  const asElement = (element: Element) => element as unknown as HTMLElement;

  await t.test('DOM facade keeps literal ids, scoped lookups and missing targets', () => {
    const node = new Element();
    elements.set('#literal:id', node);
    assert.equal(dom.getElement('#literal:id'), node);
    assert.equal(dom.getElement('#missing'), undefined);
    assert.equal(dom.getElement(asElement(node)), node);
    root.children.set('#scoped', node);
    assert.equal(dom.getElement('#scoped', asElement(root)), node);
  });

  await t.test(
    'Affix top/bottom thresholds and placeholder measurements preserve strict boundaries',
    () => {
      const input = {
        offsetTop: 10,
        offsetBottom: undefined as number | undefined,
        wrapperRect: { top: 110, bottom: 150 },
        targetRect: { top: 100, bottom: 500 },
        wrapperWidth: 200,
        wrapperHeight: 40,
        contentHeight: 80,
        fixed: false,
        viewportHeight: 800,
      };
      assert.equal(getAffixPosition(input).fixed, false);
      input.wrapperRect.top = 109;
      assert.deepEqual(getAffixPosition(input), {
        fixed: true,
        placeholder: { width: '200px', height: '40px' },
        style: { position: 'fixed', top: '110px', width: '200px' },
      });
      input.fixed = true;
      assert.equal(getAffixPosition(input).placeholder.height, '80px');
      input.offsetBottom = 20;
      input.wrapperRect.bottom = 490;
      assert.deepEqual(getAffixPosition(input).style, {
        position: 'fixed',
        bottom: '320px',
        width: '200px',
      });
    },
  );

  await t.test('Affix publishes change before styles and dedupes unchanged fixed state', () => {
    const wrapper = new Element();
    wrapper.rect.top = -1;
    const events: unknown[][] = [];
    const adapter = {
      props: { offsetTop: 0 },
      wrapper: asElement(wrapper),
      content: undefined,
      fixed: false,
      target: undefined as HTMLElement | Window | undefined,
      setFixed(value: boolean) {
        this.fixed = value;
        events.push(['fixed', value]);
      },
      onChange(value: boolean) {
        events.push(['change', value]);
      },
      setPlaceholder(value: unknown) {
        events.push(['placeholder', value]);
      },
      setStyle(value: unknown) {
        events.push(['style', value]);
      },
    };
    const f = createAffix(adapter);
    const cleanup = f.bindTarget();
    f.update();
    frame();
    assert.deepEqual(events.slice(0, 2), [
      ['fixed', true],
      ['change', true],
    ]);
    f.update();
    frame();
    assert.equal(events.filter(([name]) => name === 'change').length, 1);
    cleanup();
    f.dispose();
  });

  await t.test(
    'Affix target/outer listeners detach independently and disposal cancels the pending frame',
    () => {
      const target = new Element(),
        outer = new Element();
      elements.set('#affix-target', target);
      elements.set('#affix-outer', outer);
      const f = createAffix({
        props: { offsetTop: 0, target: '#affix-target', targetContainer: '#affix-outer' },
        wrapper: undefined,
        content: undefined,
        fixed: false,
        target: undefined,
        setFixed() {},
        onChange() {},
        setPlaceholder() {},
        setStyle() {},
      });
      const stopTarget = f.bindTarget(),
        stopOuter = f.bindContainer()!;
      target.dispatchEvent(new Event('scroll'));
      outer.dispatchEvent(new Event('resize'));
      assert.equal(frames.size, 1);
      f.dispose();
      assert.equal(frames.size, 0);
      stopTarget();
      stopOuter();
      target.dispatchEvent(new Event('scroll'));
      outer.dispatchEvent(new Event('scroll'));
      assert.equal(frames.size, 0);
    },
  );

  function anchor() {
    const container = new Element();
    container.rect = { ...container.rect, top: 100, bottom: 300, height: 200 };
    elements.set('#anchor-container', container);
    const deferred: Array<() => void> = [];
    const events: unknown[][] = [];
    const adapter = {
      props: {
        boundary: 0 as BoundaryPosition | number,
        targetOffset: undefined as number | undefined,
        scrollContainer: '#anchor-container',
        smooth: false,
        changeHash: false,
        lineLess: false,
      },
      links: {} as Record<string, HTMLElement>,
      line: asElement(new Element()),
      current: '',
      scrolling: false,
      scrollContainer: undefined as HTMLElement | Window | undefined,
      container: undefined as HTMLElement | undefined,
      afterRender(callback: () => void) {
        deferred.push(callback);
      },
      onChange(hash: string) {
        events.push(['change', hash]);
      },
      onSelect(hash: string | undefined, previous: string) {
        events.push(['select', hash, previous]);
      },
    };
    return {
      adapter,
      f: createAnchor(adapter),
      container,
      events,
      flush() {
        deferred.splice(0).forEach((cb) => cb());
      },
    };
  }

  await t.test('Anchor captures previous hash and defers change until after selection', () => {
    const { adapter, f, events, flush } = anchor();
    let prevented = 0;
    const event = {
      preventDefault() {
        prevented++;
      },
    } as MouseEvent;
    f.click(event, '#unresolved-a');
    assert.equal(adapter.current, '#unresolved-a');
    assert.deepEqual(events, [['select', '#unresolved-a', '']]);
    flush();
    assert.deepEqual(events[1], ['change', '#unresolved-a']);
    f.click(event, '#unresolved-a');
    flush();
    assert.equal(events.length, 3);
    f.click(event);
    assert.deepEqual(events.at(-1), ['select', undefined, '#unresolved-a']);
    assert.equal(prevented, 3);
    f.dispose();
  });

  await t.test(
    'Anchor viewport tracking keeps registration order, numeric boundary and global fallback',
    () => {
      const { adapter, f, container, events, flush } = anchor();
      const first = new Element(),
        second = new Element();
      first.id = 'first-visible';
      second.id = 'second-visible';
      first.rect.top = 160;
      second.rect.top = 120;
      container.children.set('#first-visible', first);
      elements.set('#second-visible', second);
      f.addLink('#first-visible', asElement(first));
      f.addLink('#second-visible', asElement(second));
      f.mount();
      frame();
      flush();
      assert.deepEqual(events, [['change', '#first-visible']]);
      f.removeLink('#first-visible');
      container.dispatchEvent(new Event('scroll'));
      frame();
      flush();
      assert.equal(adapter.current, '#second-visible');
      adapter.props.boundary = 30;
      assert.equal(f.firstInViewport(), undefined);
      f.dispose();
    },
  );

  await t.test(
    'Anchor scrolling guard, window coordinates and line sync retain their distinct rules',
    () => {
      const { adapter, f, container } = anchor();
      const node = new Element();
      node.id = 'guarded';
      node.rect.top = 130;
      node.offsetTop = 42;
      container.children.set('#guarded', node);
      f.addLink('#guarded', asElement(node));
      f.mount();
      adapter.scrolling = true;
      frame();
      assert.equal(adapter.current, '');
      adapter.scrolling = false;
      container.dispatchEvent(new Event('scroll'));
      frame();
      assert.equal(adapter.current, '#guarded');
      f.syncLine();
      assert.equal(adapter.line.style.top, '42px');
      adapter.props.lineLess = true;
      node.offsetTop = 70;
      f.syncLine();
      assert.equal(adapter.line.style.top, '42px');
      adapter.scrollContainer = win as unknown as Window;
      adapter.props.targetOffset = 100;
      assert.equal(f.firstInViewport(), undefined);
      f.dispose();
    },
  );

  await t.test(
    'Anchor initial hash decoding preserves literal percent and URI text even without a target',
    () => {
      for (const [hash, current] of [
        ['#section%', '#section%'],
        ['#%E4%B8%AD%E6%96%87', '#中文'],
      ]) {
        win.location.hash = hash;
        const { f, adapter, flush, events } = anchor();
        f.mount();
        flush();
        assert.equal(adapter.current, current);
        assert.deepEqual(events, [['change', current]]);
        f.dispose();
      }
      win.location.hash = '';
    },
  );

  await t.test(
    'Anchor container changes remove old listeners and disposal drops queued scroll work',
    () => {
      const { f, adapter, container } = anchor();
      const other = new Element();
      elements.set('#anchor-other', other);
      f.mount();
      frame();
      adapter.props.scrollContainer = '#anchor-other';
      f.containerChanged();
      frame();
      container.dispatchEvent(new Event('scroll'));
      assert.equal(frames.size, 0);
      other.dispatchEvent(new Event('scroll'));
      assert.equal(frames.size, 1);
      f.dispose();
      assert.equal(frames.size, 0);
    },
  );

  function back() {
    const node = new Element();
    elements.set('#back-target', node);
    const adapter = {
      props: {
        visibleHeight: 200,
        targetContainer: '#back-target',
        duration: 200,
        easing: 'quartOut',
      },
      target: undefined as HTMLElement | undefined,
      visible: false,
      setVisible(value: boolean) {
        this.visible = value;
      },
    };
    return { f: createBackTop(adapter), adapter, node };
  }

  await t.test(
    'BackTop visibility uses the latest threshold and detaches on target cleanup',
    () => {
      const { f, adapter, node } = back();
      node.scrollTop = 100;
      const cleanup = f.connect()!;
      frame();
      assert.equal(adapter.visible, false);
      adapter.props.visibleHeight = 50;
      f.scroll();
      frame();
      assert.equal(adapter.visible, true);
      cleanup();
      node.dispatchEvent(new Event('scroll'));
      assert.equal(frames.size, 0);
      f.dispose();
    },
  );

  await t.test(
    'BackTop immediate and reduced-motion branches stop animation and jump synchronously',
    () => {
      const { f, adapter, node } = back();
      const cleanup = f.connect()!;
      frame();
      node.scrollTop = 500;
      f.toTop();
      assert.equal(frames.size, 1);
      adapter.props.duration = 0;
      f.toTop();
      assert.equal(node.scrollTop, 0);
      assert.equal(frames.size, 0);
      adapter.props.duration = 200;
      node.scrollTop = 300;
      win.matchMedia = () => ({ matches: true });
      f.toTop();
      assert.equal(node.scrollTop, 0);
      win.matchMedia = () => ({ matches: false });
      cleanup();
      f.dispose();
    },
  );

  await t.test('BackTop native tween advances and cleanup stops further writes', () => {
    const { f, node } = back();
    const cleanup = f.connect()!;
    frame();
    node.scrollTop = 500;
    f.toTop();
    frame(100);
    assert.ok(node.scrollTop > 0 && node.scrollTop < 500);
    const stopped = node.scrollTop;
    cleanup();
    frame(300);
    assert.equal(node.scrollTop, stopped);
    f.dispose();
  });

  await t.test('Anchor slide preserves instant completion and native tween cancellation', () => {
    const node = new Element();
    let finished = 0;
    assert.equal(
      slide(asElement(node), 80, () => finished++, false),
      undefined,
    );
    assert.equal(node.scrollTop, 80);
    assert.equal(finished, 1);
    const cancel = slide(asElement(node), 200, () => finished++)!;
    frame(150);
    assert.ok(node.scrollTop > 80 && node.scrollTop < 200);
    cancel();
    const stopped = node.scrollTop;
    frame(500);
    assert.equal(node.scrollTop, stopped);
    assert.equal(finished, 1);
  });

  await t.test(
    'TimePicker shared scrollTo cancels queued/active work and keeps element identity isolated',
    () => {
      const one = new Element(),
        two = new Element();
      scrollTo(asElement(one), 300, 200);
      scrollTo(asElement(one), 70, 0);
      assert.equal(one.scrollTop, 70);
      assert.equal(frames.size, 0);
      scrollTo(asElement(one), 300, 200);
      scrollTo(asElement(two), 100, 100);
      frame();
      frame(50);
      assert.ok(one.scrollTop > 70 && two.scrollTop > 0);
      scrollTo(asElement(one), 10, 0);
      frame(500);
      frame();
      assert.equal(one.scrollTop, 10);
      assert.equal(two.scrollTop, 100);
      assert.equal(frames.size, 0);
    },
  );
});
