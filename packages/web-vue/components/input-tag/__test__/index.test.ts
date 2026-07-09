import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import InputTag from '../index';

describe('InputTag', () => {
  test('should emit change event', () => {
    const wrapper = mount(InputTag);
    const input = wrapper.find('input');

    input.setValue('test');
    input.trigger('keydown', { key: 'Enter' });
    const emits = wrapper.emitted('change');
    expect(emits).toHaveLength(1);

    const emit = (emits as Array<Array<unknown[]>>)?.[0]?.[0];
    expect(emit?.[0]).toEqual('test');
  });

  test('should clear content', async () => {
    const wrapper = mount(InputTag, {
      props: {
        defaultValue: ['test', 'test-2', 'test-3'],
        allowClear: true,
      },
    });
    const tags = wrapper.findAllComponents({ name: 'Tag' });
    expect(tags).toHaveLength(3);
    await tags[1].find('.sd-tag-close-btn').trigger('click');
    expect(wrapper.emitted('remove')).toHaveLength(1);
    await wrapper.find('.sd-input-tag-clear-btn').trigger('click');
    expect(wrapper.emitted('clear')).toHaveLength(1);
  });
  test('should collapse tags when responsive max tag count overflows', async () => {
    const wrapper = mount(InputTag, {
      props: {
        modelValue: ['one', 'two', 'three', 'four'],
        maxTagCount: 'responsive',
      },
    });

    const setElementWidth = (element: Element, width: number, property = 'offsetWidth') => {
      Object.defineProperty(element, property, {
        configurable: true,
        get: () => width,
      });
    };

    setElementWidth(wrapper.find('.sd-input-tag-inner').element, 120, 'clientWidth');
    setElementWidth(wrapper.find('input').element, 12);

    const measureTags = wrapper.find('.sd-input-tag-measure').findAll('.sd-input-tag-tag');
    measureTags.forEach((tag, index) => {
      setElementWidth(tag.element, index < 4 ? 30 : 24);
    });

    wrapper.findAllComponents({ name: 'ResizeObserver' })[0].vm.$emit('resize');
    await nextTick();
    await nextTick();

    const visibleTags = wrapper.find('.sd-input-tag-inner').findAll('.sd-input-tag-tag');
    expect(visibleTags.map((tag) => tag.text())).toEqual(['one', 'two', '+2']);
  });
});
