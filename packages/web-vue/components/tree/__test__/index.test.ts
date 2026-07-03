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
    onLongPress: vi.fn((_target, handler: (event: PointerEvent) => void) => {
      vueUseState.longPressHandlers.push(handler);
      return vi.fn();
    }),
    useSwipe: vi.fn((_target, options = {}) => {
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
    }),
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

    expect(wrapper.emitted('nodeClick')?.[0]?.[0]).toEqual(treeData[0]);
    expect((wrapper.emitted('nodeClick')?.[0]?.[1] as Event).type).toBe('click');
    expect(wrapper.emitted('nodeMouseover')?.[0]?.[0]).toEqual(treeData[0]);
    expect((wrapper.emitted('nodeMouseover')?.[0]?.[1] as Event).type).toBe('mouseover');
  });

  test('should emit node long press with node data and pointer event', async () => {
    const Tree = await loadTree();
    const wrapper = mount(Tree, {
      props: {
        data: treeData,
      },
    });

    const event = new Event('pointerdown') as PointerEvent;
    vueUseState.longPressHandlers[0]?.(event);

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
    vueUseState.swipeOptions[0]?.onSwipeEnd?.(event, 'left');

    expect(wrapper.emitted('nodeSwipeEnd')?.[0]).toEqual([
      treeData[0],
      event,
      { direction: 'left' },
    ]);
  });
});
