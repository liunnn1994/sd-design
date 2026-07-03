import { mount } from '@vue/test-utils';

import { vi } from 'vitest';

import type { TreeNodeData } from '../interface';

const vueUseState = vi.hoisted(() => ({
  longPressHandlers: [] as Array<(event: PointerEvent) => void>,
  swipeOptions: [] as Array<{
    onSwipeStart?: (event: TouchEvent) => void;
    onSwipe?: (event: TouchEvent) => void;
    onSwipeEnd?: (event: TouchEvent, direction: 'up' | 'down' | 'left' | 'right' | 'none') => void;
  }>,
}));

vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual<typeof import('@vueuse/core')>('@vueuse/core');
  const vue = await vi.importActual<typeof import('vue')>('vue');

  return {
    ...actual,
    onLongPress: (_target: unknown, handler: (event: PointerEvent) => void) => {
      vueUseState.longPressHandlers.push(handler);
      return () => {};
    },
    useSwipe: (_target: unknown, options: (typeof vueUseState.swipeOptions)[number] = {}) => {
      vueUseState.swipeOptions.push(options);

      return {
        isSwiping: vue.shallowRef(false),
        direction: vue.shallowRef('none'),
        coordsStart: { x: 0, y: 0 },
        coordsEnd: { x: 0, y: 0 },
        lengthX: vue.computed(() => 0),
        lengthY: vue.computed(() => 0),
        stop: vi.fn(),
      };
    },
  };
});

const loadTree = async () => (await import('../index')).default;

describe('Tree', () => {
  const treeData: TreeNodeData[] = [
    {
      title: 'Node 1',
      key: 'node-1',
    },
  ];

  beforeEach(() => {
    vi.resetModules();
    vueUseState.longPressHandlers.length = 0;
    vueUseState.swipeOptions.length = 0;
  });

  test('should emit node dom events with node data and event', async () => {
    const Tree = await loadTree();
    const wrapper = mount(Tree, {
      props: {
        data: treeData,
      },
    });

    const title = wrapper.find('.sd-tree-node-title');

    await title.trigger('click');
    await title.trigger('mouseover');

    const nodeClick = wrapper.emitted('nodeClick')?.[0] as [TreeNodeData, Event] | undefined;
    const nodeMouseover = wrapper.emitted('nodeMouseover')?.[0] as
      | [TreeNodeData, Event]
      | undefined;

    expect(nodeClick).toBeDefined();
    expect(nodeClick?.[0]).toEqual(treeData[0]);
    expect(nodeClick?.[1].type).toBe('click');
    expect(nodeMouseover).toBeDefined();
    expect(nodeMouseover?.[0]).toEqual(treeData[0]);
    expect(nodeMouseover?.[1].type).toBe('mouseover');
  });

  test('should emit node long press with node data and pointer event', async () => {
    const Tree = await loadTree();
    const wrapper = mount(Tree, {
      props: {
        data: treeData,
      },
    });

    const event = new Event('pointerdown') as PointerEvent;
    expect(vueUseState.longPressHandlers).toHaveLength(1);
    vueUseState.longPressHandlers[0](event);

    expect(wrapper.emitted('nodeLongPress')?.[0]).toEqual([treeData[0], event]);
  });

  test('should emit node swipe events with node data, touch event and direction', async () => {
    const Tree = await loadTree();
    const wrapper = mount(Tree, {
      props: {
        data: treeData,
      },
    });

    const event = new Event('touchend') as TouchEvent;
    expect(vueUseState.swipeOptions).toHaveLength(1);
    expect(vueUseState.swipeOptions[0].onSwipeEnd).toBeDefined();
    vueUseState.swipeOptions[0].onSwipeEnd?.(event, 'left');

    expect(wrapper.emitted('nodeSwipeEnd')?.[0]).toEqual([
      treeData[0],
      event,
      { direction: 'left' },
    ]);
  });

  test('should keep plain title rendering when ellipsis is disabled', async () => {
    const Tree = await loadTree();
    const wrapper = mount(Tree, {
      props: {
        data: treeData,
      },
    });

    expect(wrapper.findComponent({ name: 'Ellipsis' }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'PerformantEllipsis' }).exists()).toBe(false);
    expect(wrapper.find('.sd-tree-node-title').text()).toContain('Node 1');
  });

  test('should render node title with Ellipsis when ellipsis is true', async () => {
    const Tree = await loadTree();
    const wrapper = mount(Tree, {
      props: {
        data: treeData,
        ellipsis: true,
      },
    });

    const ellipsis = wrapper.findComponent({ name: 'Ellipsis' });

    expect(ellipsis.exists()).toBe(true);
    expect(wrapper.find('.sd-tree-node-title-with-ellipsis').exists()).toBe(true);
    expect(wrapper.find('.sd-tree-node-title-text-ellipsis').exists()).toBe(true);
    expect(wrapper.find('.sd-tree-node-title-ellipsis').exists()).toBe(true);
    expect(ellipsis.text()).toContain('Node 1');
  });

  test('should render node title with PerformantEllipsis when ellipsis is performant-ellipsis', async () => {
    const Tree = await loadTree();
    const wrapper = mount(Tree, {
      props: {
        data: treeData,
        ellipsis: 'performant-ellipsis',
      },
    });

    const ellipsis = wrapper.findComponent({ name: 'PerformantEllipsis' });

    expect(ellipsis.exists()).toBe(true);
    expect(wrapper.find('.sd-tree-node-title-with-ellipsis').exists()).toBe(true);
    expect(wrapper.find('.sd-tree-node-title-text-ellipsis').exists()).toBe(true);
    expect(wrapper.find('.sd-tree-node-title-ellipsis').exists()).toBe(true);
    expect(ellipsis.text()).toContain('Node 1');
  });
});
