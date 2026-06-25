import { mount } from '@vue/test-utils';
import { defineComponent, getCurrentInstance, nextTick } from 'vue';

import ConfigProvider from '../../config-provider';
import Ellipsis from '../../ellipsis';
import Modal from '../index';
import ModalComponent from '../modal.vue';

describe('Modal', () => {
  test('should render modal and emit ok/cancel event', async () => {
    const wrapper = mount(ModalComponent, {
      props: {
        defaultVisible: true,
        renderToBody: false,
      },
      slots: {
        default: `<div>Modal Body</div>`,
        title: 'Title',
      },
    });

    await nextTick();
    expect(wrapper.html()).toMatchSnapshot();
    expect(wrapper.findComponent(Ellipsis).props('tooltip')).toBe(true);
    const buttons = wrapper.findAll('.sd-btn');
    await buttons[0].trigger('click');
    expect(wrapper.emitted('cancel')).toHaveLength(1);
    await buttons[1].trigger('click');
    expect(wrapper.emitted('ok')).toHaveLength(1);
  });

  test('should show modal and call cb', async () => {
    const onOk = vi.fn();
    const onCancel = vi.fn();

    const wrapper = mount(
      defineComponent({
        setup() {
          const instance = getCurrentInstance();

          const handleClick = () => {
            if (!instance) {
              throw new Error('Missing component instance');
            }

            Modal.open(
              {
                title: 'title',
                content: 'content',
                onOk,
                onCancel,
              },
              instance.appContext,
            );
          };

          return {
            handleClick,
          };
        },
        template: `
          <button @click="handleClick">Click</button>`,
      }),
    );

    await wrapper.find('button').trigger('click');
    expect(document.body.outerHTML).toMatchSnapshot();
    const buttons = document.body.querySelectorAll('.sd-btn');
    (buttons[0] as HTMLButtonElement | undefined)?.click();
    await nextTick();
    expect(onCancel).toHaveBeenCalled();
    (buttons[1] as HTMLButtonElement | undefined)?.click();
    await nextTick();
    expect(onOk).toHaveBeenCalled();
  });

  test('should render simple modal', async () => {
    const wrapper = mount(ModalComponent, {
      props: {
        defaultVisible: true,
        simple: true,
        renderToBody: false,
      },
      slots: {
        default: `<div>Modal Body</div>`,
        title: 'Title',
      },
    });

    await nextTick();
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('should use modal defaults from config-provider', async () => {
    const wrapper = mount(
      defineComponent({
        components: {
          ConfigProvider,
          ModalComponent,
        },
        template: `
          <config-provider
            :modal="{
              closable: false,
              okText: '全局确认',
              cancelText: '全局取消',
              width: 520,
              hideCancel: true,
              alignCenter: false,
              titleAlign: 'start',
              maskStyle: { backgroundColor: 'rgb(1, 2, 3)' },
              draggable: true,
              escToClose: false,
              top: '10vh',
              titleEllipsisTooltip: false,
            }"
          >
            <modal-component title="Title" default-visible :render-to-body="false">
              Modal Body
            </modal-component>
          </config-provider>
        `,
      }),
    );

    await nextTick();
    expect(wrapper.find('.sd-modal-close-btn').exists()).toBe(false);
    expect(wrapper.text()).toContain('全局确认');
    expect(wrapper.text()).not.toContain('全局取消');
    expect(wrapper.find('.sd-modal').attributes('style')).toContain('width: 520px');
    expect(wrapper.find('.sd-modal').classes()).toContain('sd-modal-draggable');
    expect(wrapper.find('.sd-modal-wrapper').classes()).not.toContain(
      'sd-modal-wrapper-align-center',
    );
    expect(wrapper.find('.sd-modal-title').classes()).toContain('sd-modal-title-align-start');
    expect(wrapper.find('.sd-modal-mask').attributes('style')).toContain(
      'background-color: rgb(1, 2, 3);',
    );
    expect(wrapper.findComponent(Ellipsis).props('tooltip')).toBe(false);

    document.documentElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();
    expect(wrapper.find('.sd-modal').exists()).toBe(true);
  });

  test('should prefer explicit modal props over config-provider defaults', async () => {
    const wrapper = mount(
      defineComponent({
        components: {
          ConfigProvider,
          ModalComponent,
        },
        template: `
          <config-provider :modal="{ closable: false, okText: '全局确认', titleEllipsisTooltip: false }">
            <modal-component
              title="Title"
              default-visible
              :render-to-body="false"
              closable
              ok-text="本地确认"
              :title-ellipsis-tooltip="true"
            >
              Modal Body
            </modal-component>
          </config-provider>
        `,
      }),
    );

    await nextTick();
    expect(wrapper.find('.sd-modal-close-btn').exists()).toBe(true);
    expect(wrapper.text()).toContain('本地确认');
    expect(wrapper.text()).not.toContain('全局确认');
    expect(wrapper.findComponent(Ellipsis).props('tooltip')).toBe(true);
  });

  test('should render footer buttons when called without appContext', async () => {
    // Regression: invoking via the static `Modal.confirm(config)` import (no
    // appContext) used to render unresolved `<sd-button>` custom elements in the
    // footer, because the template relied on runtime global resolution which
    // fails when appContext is not propagated.
    Modal.confirm({
      title: 'title',
      content: 'content',
      okButtonProps: { status: 'danger' },
    });

    await nextTick();

    const buttons = document.body.querySelectorAll('.sd-btn');
    expect(buttons).toHaveLength(2);
    // No unresolved `<sd-button>` custom element should leak into the DOM
    expect(document.body.querySelector('sd-button')).toBeNull();
    // okButtonProps are applied to the OK button (the second footer button)
    expect(buttons[1].classList.contains('sd-btn-status-danger')).toBe(true);

    Modal.destroyAll();
    await nextTick();
  });
});
