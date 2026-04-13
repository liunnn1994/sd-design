import { mount } from '@vue/test-utils';

import Alert from '../index';

describe('Alert', () => {
  test('should emit event', async () => {
    const wrapper = mount(Alert, {
      props: {
        closable: true,
      },
    });

    const closeBtn = wrapper.find('.sd-alert-close-btn');
    await closeBtn.trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  test('should type props', async () => {
    const wrapper = mount(Alert);

    await wrapper.setProps({ type: 'info' });
    expect(wrapper.find('.sd-alert-info').exists()).not.toBe(null);

    await wrapper.setProps({ type: 'success' });
    expect(wrapper.find('.sd-alert-success').exists()).not.toBe(null);

    await wrapper.setProps({ type: 'warning' });
    expect(wrapper.find('.sd-alert-warning').exists()).not.toBe(null);

    await wrapper.setProps({ type: 'error' });
    expect(wrapper.find('.sd-alert-error').exists()).not.toBe(null);
  });
});
