import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import Trigger from '../index';

describe('Trigger', () => {
  test('trigger correctly', async () => {
    const wrapper = mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: {
        trigger: 'click',
      },
    });

    await wrapper.find('button').trigger('click');

    expect(document.body.innerHTML).toContain('<div id="popup-content">Popup Content</div>');
  });

  test('default visible correctly', async () => {
    mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: {
        defaultPopupVisible: true,
      },
    });

    await nextTick();
    await nextTick();

    expect(document.body.innerHTML).toContain('<div id="popup-content">Popup Content</div>');
  });
});
