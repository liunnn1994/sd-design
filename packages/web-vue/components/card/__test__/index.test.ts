import { mount } from '@vue/test-utils';
import { h } from 'vue';

import Card from '../index';

const { Meta, Grid } = Card;

describe('Card', () => {
  test('Should have prefix', () => {
    const wrapper = mount(Card);
    expect(wrapper.classes()).toContain('sd-card');
  });

  test('Title should work', () => {
    const wrapper = mount(Card, {
      props: {
        title: 'Card title',
      },
    });
    const titleElement = wrapper.find('.sd-card-header-title');
    expect(titleElement.text()).toContain('Card title');
  });

  test('Extra slot should work', () => {
    const wrapper = mount(Card, {
      slots: {
        extra: `<div id='extra-content'>Extra content</div>`,
      },
    });
    const extraElement = wrapper.find('#extra-content');
    expect(extraElement.exists()).toBe(true);
  });

  test('Card meta should work', () => {
    const wrapper = mount(Card, {
      slots: {
        default: () => h(Meta, { title: 'Card meta title' }),
      },
    });
    const titleElement = wrapper.find('.sd-card-meta-title');
    expect(titleElement.text()).toContain('Card meta title');
  });

  test('Card grid should work', () => {
    const wrapper = mount(Card, {
      slots: {
        default: () => [h(Grid), h(Grid), h(Grid)],
      },
    });
    const grids = wrapper.findAll('.sd-card-grid');
    expect(grids.length).toBe(3);
  });
});
