import { mount } from '@vue/test-utils';
import List from '../index';

describe('List', () => {
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
