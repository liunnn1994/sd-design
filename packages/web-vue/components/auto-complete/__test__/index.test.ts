import { mount } from '@vue/test-utils';
import { h } from 'vue';

import AutoComplete from '../index';

describe('AutoComplete', () => {
  test('auto-complete correctly', async () => {
    const wrapper = mount(AutoComplete, {
      props: {
        data: ['Beijing', 'Shanghai', 'Chengdu', 'WuHan'],
      },
    });
    const input = wrapper.find('input');
    await input.trigger('focusin');
    await input.setValue('e');
    await input.trigger('keydown', { key: 'ArrowDown' });
    await input.trigger('keydown', { key: 'Enter' });

    expect(input.element.value).toBe('Chengdu');
  });

  test('should render default option with performant ellipsis', async () => {
    const wrapper = mount(AutoComplete, {
      props: {
        data: ['Beijing long long long', 'Shanghai'],
      },
    });

    await wrapper.find('input').trigger('focusin');

    expect(document.body.querySelector('.sd-select-option .sd-ellipsis')).not.toBeNull();
  });

  test('should not wrap custom option slot with performant ellipsis', async () => {
    const wrapper = mount(AutoComplete, {
      props: {
        data: [
          { value: 'beijing', label: 'Beijing' },
          { value: 'shanghai', label: 'Shanghai' },
        ],
      },
      slots: {
        option: ({ data }) => h('span', { class: 'custom-option' }, data.label),
      },
    });

    const input = wrapper.find('input');
    await input.trigger('focusin');
    await input.setValue('Bei');
    const option = document.body.querySelector('.sd-select-option');

    expect(option?.querySelector('.custom-option')).not.toBeNull();
    expect(option?.querySelector('.sd-ellipsis')).toBeNull();
  });
});
