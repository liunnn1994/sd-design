import { mount } from '@vue/test-utils';

import DropdownPanel from '../dropdown-panel.vue';

describe('DropdownPanel', () => {
  test('should disable horizontal scrollbar', () => {
    const wrapper = mount(DropdownPanel, {
      slots: {
        default: '<li class="sd-dropdown-option">Option</li>',
      },
    });

    expect(wrapper.findComponent({ name: 'Scrollbar' }).props('disableHorizontal')).toBe(true);
  });
});
