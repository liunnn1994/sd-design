import { h } from 'vue';

import Dropdown from '../index';
import { travelDropDownChildren } from '../utils';

describe('Dropdown VNode children parsing', () => {
  it('handles an empty option without a value', () => {
    expect(travelDropDownChildren([h(Dropdown.Option)])[0]).to.include({ value: '' });
  });

  it('uses option text from array children', () => {
    expect(
      travelDropDownChildren([h(Dropdown.Option, {}, [h('span', 'Array label')])])[0],
    ).to.include({ value: 'Array label' });
  });

  it('handles a submenu without slots', () => {
    expect(travelDropDownChildren([h(Dropdown.Submenu)])[0]).to.include({
      isSubmenu: true,
      value: '',
    });
  });
});
