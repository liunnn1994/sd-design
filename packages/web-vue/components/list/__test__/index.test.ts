import { mount } from '@vue/test-utils';
import { h } from 'vue';

import List, { ListItemMeta } from '../index';

describe('List', () => {
  test('should render item meta props with performant ellipsis', () => {
    const wrapper = mount(ListItemMeta, {
      props: {
        title: 'Title long long long',
        description: 'Description long long long',
      },
    });

    expect(wrapper.findAllComponents({ name: 'PerformantEllipsis' })).toHaveLength(2);
  });

  test('should not wrap item meta slots with performant ellipsis', () => {
    const wrapper = mount(ListItemMeta, {
      slots: {
        title: () => h('span', { class: 'custom-title' }, 'Title'),
        description: () => h('span', { class: 'custom-description' }, 'Description'),
      },
    });

    expect(wrapper.find('.custom-title').exists()).toBe(true);
    expect(wrapper.find('.custom-description').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'PerformantEllipsis' }).exists()).toBe(false);
  });

  test('should render empty component', () => {
    const wrapper = mount(List, {
      props: {
        data: [],
      },
    });
    const empty = wrapper.find('.sd-empty').exists();
    expect(empty).toBe(true);
  });
});
