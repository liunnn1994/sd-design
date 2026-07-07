import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import { vi } from 'vitest';

import Tree from '../index';

// virtua positions each item with `position: absolute; top: Npx` inside a
// relative `.sd-virtual-list-content` container (vue-virtual-scroller used
// `.vue-recycle-scroller__item-view` with `transform: translateY(Npx)`).
const getItemTop = (element: Element): number =>
  Number.parseFloat((element as HTMLElement).style.top) || 0;

// virtua renders asynchronously (its onMounted ResizeObserver schedule plus a
// measure→re-render chain), so flush both microtasks and the rAF/macrotask queue
// over a few cycles before reading the rendered items.
const flush = async () => {
  for (let i = 0; i < 4; i++) {
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  await nextTick();
};

const options = Array.from({ length: 10 }, (_, index) => ({
  label: `Option ${index}`,
  key: `option-0-${index}`,
  value: `option-0-${index}`,
}));

const treeOptions = Array.from({ length: 10 }, (_, index) => ({
  label: `parent-${index}`,
  key: `parent-${index}`,
  value: `parent-${index}`,
  children: options.map((option) => ({
    ...option,
    key: option.key.replace('0', String(index)),
    value: option.value.replace('0', String(index)),
  })),
}));

// Reads the rendered virtual items (direct children of the virtua content
// container) as { label, top }, sorted by vertical position.
const visibleTitles = () =>
  Array.from(document.body.querySelectorAll('.sd-virtual-list-content > *'))
    .map((element) => {
      const node = element.querySelector('.sd-tree-node');

      return {
        label: node?.getAttribute('label'),
        top: getItemTop(element),
      };
    })
    .filter((item): item is { label: string; top: number } => Boolean(item.label))
    .sort((left, right) => left.top - right.top)
    .map((item) => item.label);

describe('Tree virtual list', () => {
  test('should keep dynamic virtual tree scrollable without scroller warnings', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: {
        data: treeOptions,
        virtualListProps: {
          height: 240,
          minItemSize: 32,
        },
      },
      slots: {
        title: ({ title, key }: { title: string; key: string }) => {
          if (!String(key).startsWith('option-')) {
            return title;
          }

          return `${title} - dynamic node content used to verify the scroller stays virtualized.`;
        },
      },
    });

    await flush();

    await wrapper.find('.sd-tree-node-switcher').trigger('click');
    await flush();

    expect(wrapper.find('.sd-virtual-list-content').exists()).toBe(true);
    expect(wrapper.findAll('.sd-tree-node').length).toBeGreaterThan(0);
    expect(consoleWarn).not.toHaveBeenCalledWith(expect.stringContaining("isn't scrolling"));

    consoleWarn.mockRestore();
  });

  test('should keep leading child options contiguous for small virtual data', async () => {
    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: {
        data: treeOptions,
        virtualListProps: {},
      },
    });

    await flush();

    await wrapper.find('.sd-tree-node-switcher').trigger('click');
    await flush();

    expect(visibleTitles().slice(0, 5)).toEqual([
      'parent-0',
      'Option 0',
      'Option 1',
      'Option 2',
      'Option 3',
    ]);
  });

  test('should keep dynamic rows contiguous after collapsing and expanding again', async () => {
    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: {
        data: treeOptions,
        virtualListProps: {
          height: 240,
          minItemSize: 32,
        },
      },
      slots: {
        title: ({ title, key }: { title: string; key: string }) => {
          if (!String(key).startsWith('option-')) {
            return title;
          }

          return `${title} - dynamic node content used to verify relayout after toggling.`;
        },
      },
    });

    await flush();

    const switchers = wrapper.findAll('.sd-tree-node-switcher');
    await switchers[0].trigger('click');
    await flush();

    await switchers[0].trigger('click');
    await flush();

    await switchers[0].trigger('click');
    await flush();

    expect(visibleTitles().slice(0, 5)).toEqual([
      'parent-0',
      'Option 0',
      'Option 1',
      'Option 2',
      'Option 3',
    ]);
  });
});
