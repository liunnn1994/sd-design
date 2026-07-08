import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';

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

  test('nested contextMenu trigger closes when clicking back on the trigger area', async () => {
    const outerVisibleChanges: boolean[] = [];
    const innerVisibleChanges: boolean[] = [];

    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Trigger,
              {
                trigger: 'contextMenu',
                position: 'bl',
                onPopupVisibleChange: (visible: boolean) => outerVisibleChanges.push(visible),
              },
              {
                default: () =>
                  h('div', { class: 'tree' }, [
                    h('span', { class: 'blank' }, 'Blank'),
                    h(
                      Trigger,
                      {
                        trigger: 'contextMenu',
                        position: 'bl',
                        onPopupVisibleChange: (visible: boolean) =>
                          innerVisibleChanges.push(visible),
                      },
                      {
                        default: () =>
                          h(
                            'span',
                            {
                              class: 'node',
                              onContextmenu: (event: MouseEvent) => event.stopPropagation(),
                            },
                            'Node',
                          ),
                        content: () => h('div', { id: 'inner-menu' }, 'Inner'),
                      },
                    ),
                  ]),
                content: () => h('div', { id: 'outer-menu' }, 'Outer'),
              },
            );
        },
      }),
      { attachTo: document.body },
    );

    wrapper
      .find('.tree')
      .element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    await nextTick();
    expect(outerVisibleChanges.at(-1)).toBe(true);

    wrapper
      .find('.node')
      .element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
    wrapper
      .find('.node')
      .element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    await nextTick();
    expect(outerVisibleChanges.at(-1)).toBe(false);
    expect(innerVisibleChanges.at(-1)).toBe(true);

    await wrapper.find('.blank').trigger('pointerdown');
    await wrapper.find('.blank').trigger('click');
    await nextTick();
    expect(innerVisibleChanges.at(-1)).toBe(false);

    wrapper.unmount();
  });
});
