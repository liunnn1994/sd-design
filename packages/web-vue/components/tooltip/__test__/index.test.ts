import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import Tooltip from '../index';

describe('Tooltip', () => {
  test('should render tooltip', async () => {
    const wrapper = mount(
      {
        template: ['top', 'tl', 'tr', 'bottom', 'bl', 'br', 'left', 'lt', 'lb', 'right', 'rt', 'rb']
          .map(
            (item) =>
              `<sd-tooltip content="content" :default-popup-visible="true" position="${item}" :render-to-body="false"><button>Button</button></sd-tooltip>`,
          )
          .join('/n'),
      },
      {},
    );

    await nextTick();
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('should emit popupVisibleChange event', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        mouseEnterDelay: 0,
        mouseLeaveDelay: 0,
      },
      slots: {
        default: '<button>Button</button>',
        content: 'Content',
      },
    });

    await wrapper.find('button').trigger('mouseenter');
    await wrapper.find('button').trigger('mouseleave');

    expect(wrapper.emitted('popupVisibleChange')).toHaveLength(2);
  });
});
