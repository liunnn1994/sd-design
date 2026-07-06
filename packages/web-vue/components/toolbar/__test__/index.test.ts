import { mount } from '@vue/test-utils';

import Toolbar, { type ToolbarInstance } from '../index';

const SEARCH_TEXT = '查询';
const RESET_TEXT = '重置';

function findButtonByText(wrapper: ReturnType<typeof mount>, text: string) {
  return wrapper.findAll('button').find((btn) => btn.text().includes(text));
}

describe('Toolbar', () => {
  test('renders schema-driven filter items and default action buttons', () => {
    const wrapper = mount(Toolbar, {
      props: {
        schemas: [{ field: 'name', label: '名称', type: 'input' }],
      },
    });

    expect(wrapper.find('.sd-toolbar').exists()).toBe(true);
    expect(wrapper.find('input').exists()).toBe(true);
    expect(findButtonByText(wrapper, SEARCH_TEXT)?.exists()).toBe(true);
    expect(findButtonByText(wrapper, RESET_TEXT)?.exists()).toBe(true);
  });

  test('emits search with current params when the search button is clicked', async () => {
    const wrapper = mount(Toolbar, {
      props: {
        modelValue: { name: 'foo' },
        schemas: [{ field: 'name', type: 'input' }],
      },
    });

    const searchBtn = findButtonByText(wrapper, SEARCH_TEXT);
    await searchBtn?.trigger('click');

    const events = wrapper.emitted('search');
    expect(events).toBeTruthy();
    expect(events?.[0]?.[0]).toEqual({ name: 'foo' });
  });

  test('emits search when Enter is pressed inside the toolbar', async () => {
    const wrapper = mount(Toolbar, {
      props: {
        modelValue: { name: 'bar' },
        schemas: [{ field: 'name', type: 'input' }],
      },
    });

    await wrapper.find('input').trigger('keydown.enter');

    expect(wrapper.emitted('search')).toBeTruthy();
    expect(wrapper.emitted('search')?.[0]?.[0]).toEqual({ name: 'bar' });
  });

  test('show-search / show-reset toggle the action buttons', () => {
    const wrapper = mount(Toolbar, {
      props: {
        showSearch: false,
        showReset: false,
        schemas: [{ field: 'name', type: 'input' }],
      },
    });

    expect(findButtonByText(wrapper, SEARCH_TEXT)).toBeUndefined();
    expect(findButtonByText(wrapper, RESET_TEXT)).toBeUndefined();
  });

  test('renders the default slot and skips the schema form', () => {
    const wrapper = mount(Toolbar, {
      props: { schemas: [{ field: 'name', type: 'input' }] },
      slots: {
        default: '<div class="custom-filter">自定义筛选项</div>',
      },
    });

    expect(wrapper.find('.custom-filter').exists()).toBe(true);
    expect(wrapper.find('input').exists()).toBe(false);
  });

  test('forwards a named schema slot into the form item', () => {
    const wrapper = mount(Toolbar, {
      props: {
        modelValue: {},
        schemas: [{ field: 'keyword', slotName: 'keyword' }],
      },
      slots: {
        keyword: '<span class="keyword-slot">关键字自定义</span>',
      },
    });

    expect(wrapper.find('.keyword-slot').exists()).toBe(true);
  });

  test('exposed search() and reset() drive events', () => {
    const wrapper = mount(Toolbar, {
      props: { modelValue: { name: 'baz' } },
    });
    const vm = wrapper.vm as unknown as ToolbarInstance;

    vm.search();
    expect(wrapper.emitted('search')?.[0]?.[0]).toEqual({ name: 'baz' });

    vm.reset();
    expect(wrapper.emitted('reset')).toHaveLength(1);
  });

  test('reset restores the initial model and preserves skipped keys', async () => {
    const wrapper = mount(Toolbar, {
      props: {
        modelValue: { name: 'init', page: 1 },
        resetSkipKeys: ['page'],
        schemas: [{ field: 'name', type: 'input' }],
      },
    });
    const vm = wrapper.vm as unknown as ToolbarInstance;

    // Simulate the user editing/adding fields after mount.
    await wrapper.setProps({ modelValue: { name: 'changed', page: 3, extra: 'x' } });

    vm.reset();

    const updateEvents = wrapper.emitted('update:modelValue');
    expect(updateEvents).toBeTruthy();
    expect(updateEvents?.at(-1)?.[0]).toEqual({ name: 'init', page: 3 });
  });

  test('does not render the expand toggle when allow-expand is disabled', () => {
    const wrapper = mount(Toolbar, {
      props: {
        allowExpand: false,
        schemas: [{ field: 'name', type: 'input' }],
      },
    });

    expect(wrapper.find('.sd-toolbar-expand').exists()).toBe(false);
  });
});
