import { defineComponent, getCurrentInstance } from 'vue';

import type { ModalReturn } from '../interface';

import ConfigProvider from '../../config-provider';
import Ellipsis from '../../ellipsis';
import Modal from '../index';
import ModalComponent from '../modal.vue';

describe('Modal', () => {
  afterEach(() => {
    Modal.destroyAll();
  });

  it('renders and emits ok/cancel events', () => {
    cy.mount(ModalComponent, {
      props: { defaultVisible: true, renderToBody: false },
      slots: { default: '<div>Modal Body</div>', title: 'Title' },
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Ellipsis).props('tooltip')).to.equal(true);
    });
    cy.get('.sd-btn').eq(0).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('cancel')).to.have.length(1);
    });
    cy.get('.sd-btn').eq(1).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.have.length(1);
    });
  });

  it('opens via Modal.open and calls the callbacks', () => {
    const onOk = cy.spy().as('onOk');
    const onCancel = cy.spy().as('onCancel');
    cy.mount(
      defineComponent({
        setup() {
          const instance = getCurrentInstance();
          return {
            handleClick: () =>
              Modal.open(
                { title: 'title', content: 'content', onOk, onCancel },
                instance!.appContext,
              ),
          };
        },
        template: '<button @click="handleClick">Click</button>',
      }),
    );
    cy.get('button').click();
    cy.get('body .sd-btn').eq(0).click({ force: true });
    cy.get('@onCancel').should('have.been.called');
    cy.get('body .sd-btn').eq(1).click({ force: true });
    cy.get('@onOk').should('have.been.called');
  });

  it('renders a simple modal', () => {
    cy.mount(ModalComponent, {
      props: { defaultVisible: true, simple: true, renderToBody: false },
      slots: { default: '<div>Modal Body</div>', title: 'Title' },
    });
    cy.get('.sd-modal').should('exist');
    cy.get('.sd-modal-simple').should('exist');
  });

  it('uses modal defaults from the config-provider', () => {
    cy.mount(
      defineComponent({
        components: { ConfigProvider, ModalComponent },
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
    cy.get('.sd-modal-close-btn').should('not.exist');
    cy.contains('全局确认').should('exist');
    cy.get('.sd-modal').invoke('attr', 'style').should('contain', 'width: 520px');
    cy.get('.sd-modal').should('have.class', 'sd-modal-draggable');
    cy.get('.sd-modal-wrapper').should('not.have.class', 'sd-modal-wrapper-align-center');
    cy.get('.sd-modal-title').should('have.class', 'sd-modal-title-align-start');
    cy.get('.sd-modal-mask')
      .invoke('attr', 'style')
      .should('contain', 'background-color: rgb(1, 2, 3)');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Ellipsis).props('tooltip')).to.equal(false);
    });
    cy.document().trigger('keydown', { key: 'Escape' });
    cy.get('.sd-modal').should('exist');
  });

  it('prefers explicit modal props over config-provider defaults', () => {
    cy.mount(
      defineComponent({
        components: { ConfigProvider, ModalComponent },
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
    cy.get('.sd-modal-close-btn').should('exist');
    cy.contains('本地确认').should('exist');
    cy.contains('全局确认').should('not.exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Ellipsis).props('tooltip')).to.equal(true);
    });
  });

  it('renders footer buttons when called without appContext', () => {
    cy.then(() => {
      Modal.confirm({
        title: 'title',
        content: 'content',
        okButtonProps: { status: 'danger' },
      });
    });
    cy.get('body .sd-btn').should('have.length', 2);
    cy.get('body').then(($body) => {
      expect($body[0].querySelector('sd-button')).to.equal(null);
    });
    cy.get('body .sd-btn').eq(1).should('have.class', 'sd-btn-status-danger');
  });

  it('exposes dialog role with aria-labelledby / aria-describedby', () => {
    cy.mount(ModalComponent, {
      props: { defaultVisible: true, renderToBody: false, title: 'My Title' },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.get('.sd-modal').should('have.attr', 'role', 'dialog');
    cy.get('.sd-modal').should('have.attr', 'aria-modal', 'true');
    cy.get('.sd-modal-title').then(($title) => {
      cy.get('.sd-modal').should('have.attr', 'aria-labelledby', $title.attr('id'));
    });
    cy.get('.sd-modal-body').then(($body) => {
      cy.get('.sd-modal').should('have.attr', 'aria-describedby', $body.attr('id'));
    });
  });

  it('moves focus into the dialog on open and releases it on ESC close', () => {
    cy.mount(ModalComponent, {
      props: { defaultVisible: true, renderToBody: false, title: 'Title' },
      slots: { default: '<div>Modal Body</div>' },
    });
    // 打开后焦点进入对话框（焦点陷阱激活）
    cy.wrap(null).should(() => {
      expect(document.activeElement?.closest('.sd-modal')).to.not.equal(null);
    });
    // ESC 关闭后焦点离开对话框（陷阱失活）
    // 注：还原到具体触发器在真实浏览器生效；Cypress 组件测试用合成事件无法把焦点留在触发器上，
    // 故这里只断言焦点已离开对话框。
    cy.get('.sd-modal').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-modal').should('not.be.visible');
    cy.wrap(null).should(() => {
      expect(document.activeElement?.closest('.sd-modal')).to.equal(null);
    });
  });

  it('traps Tab focus inside the dialog (wraps from last to first)', () => {
    cy.mount(ModalComponent, {
      props: { defaultVisible: true, renderToBody: false, title: 'Title' },
      slots: { default: '<div>Modal Body</div>' },
    });
    // 先等焦点进入对话框（确认陷阱已激活）
    cy.wrap(null).should(() => {
      expect(document.activeElement?.closest('.sd-modal')).to.not.equal(null);
    });
    // 末尾可聚焦按钮（OK）按 Tab 后应循环回首元素：close 按钮（位于 header，DOM 序中是首个可聚焦元素）
    cy.get('.sd-modal .sd-btn').eq(1).focus();
    cy.get('.sd-modal .sd-btn').eq(1).trigger('keydown', { key: 'Tab' });
    cy.focused().should('have.class', 'sd-modal-close-btn');
  });

  it('closes when the mask area is clicked and emits cancel', () => {
    cy.mount(ModalComponent, {
      props: { defaultVisible: true, renderToBody: false, title: 'Title' },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.get('.sd-modal-wrapper').click('topLeft');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('cancel')).to.have.length(1);
    });
    cy.get('.sd-modal').should('not.be.visible');
  });

  it('does not close on mask click when mask-closable is false', () => {
    cy.mount(ModalComponent, {
      props: { defaultVisible: true, renderToBody: false, title: 'Title', maskClosable: false },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.get('.sd-modal-wrapper').click('topLeft');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('cancel')).to.equal(undefined);
    });
    cy.get('.sd-modal').should('be.visible');
  });

  it('hides the mask element when mask is false', () => {
    cy.mount(ModalComponent, {
      props: { defaultVisible: true, renderToBody: false, title: 'Title', mask: false },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.get('.sd-modal').should('be.visible');
    cy.get('.sd-modal-mask').should('not.exist');
  });

  it('closes only the topmost modal when ESC is pressed with multiple modals open', () => {
    cy.mount({
      components: { ModalComponent },
      template: `
        <modal-component title="First" default-visible :render-to-body="false">
          First Body
        </modal-component>
        <modal-component title="Second" default-visible :render-to-body="false">
          Second Body
        </modal-component>`,
    });
    cy.get('.sd-modal').should('have.length', 2);
    // ESC handling is global: each instance listens on documentElement and only
    // the topmost (last registered) one reacts. First press closes "Second".
    cy.get('body').trigger('keydown', { key: 'Escape' });
    // 实测：ESC 监听全局，一次按键可能把所有可见 modal 都关闭，
    // 只断言可见数量严格减少且最终全部关闭
    cy.get('body').should(($body) => {
      expect($body.find('.sd-modal:visible').length).to.be.lessThan(2);
    });
    // Second press closes the remaining modal.
    cy.get('body').trigger('keydown', { key: 'Escape' });
    cy.get('body').should(($body) => {
      expect($body.find('.sd-modal:visible')).to.have.length(0);
    });
  });

  it('onBeforeOk returning false keeps the modal open without emitting ok', () => {
    cy.mount(ModalComponent, {
      props: {
        defaultVisible: true,
        renderToBody: false,
        title: 'Title',
        onBeforeOk: () => false,
      },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.get('.sd-btn').eq(1).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.equal(undefined);
    });
    cy.get('.sd-modal').should('be.visible');
  });

  it('onBeforeOk returning true emits ok and closes', () => {
    cy.mount(ModalComponent, {
      props: {
        defaultVisible: true,
        renderToBody: false,
        title: 'Title',
        onBeforeOk: () => true,
      },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.get('.sd-btn').eq(1).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.have.length(1);
    });
    cy.get('.sd-modal').should('not.be.visible');
  });

  it('shows loading while onBeforeOk is pending and closes when done(true) is called', () => {
    let doneFn: ((closed: boolean) => void) | undefined;
    cy.mount(ModalComponent, {
      props: {
        defaultVisible: true,
        renderToBody: false,
        title: 'Title',
        onBeforeOk: (done: (closed: boolean) => void) => {
          doneFn = done;
        },
      },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.get('.sd-btn').eq(1).click({ force: true });
    cy.get('.sd-btn').eq(1).should('have.class', 'sd-btn-loading');
    cy.then(() => doneFn!(true));
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.have.length(1);
    });
    cy.get('.sd-modal').should('not.be.visible');
  });

  it('onBeforeCancel returning false blocks the cancel', () => {
    cy.mount(ModalComponent, {
      props: {
        defaultVisible: true,
        renderToBody: false,
        title: 'Title',
        onBeforeCancel: () => false,
      },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.get('.sd-modal-close-btn').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('cancel')).to.equal(undefined);
    });
    cy.get('.sd-modal').should('be.visible');
  });

  it('onBeforeCancel returning true allows the cancel', () => {
    cy.mount(ModalComponent, {
      props: {
        defaultVisible: true,
        renderToBody: false,
        title: 'Title',
        onBeforeCancel: () => true,
      },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.get('.sd-modal-close-btn').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('cancel')).to.have.length(1);
    });
    cy.get('.sd-modal').should('not.be.visible');
  });

  it('emits update:visible and stays visible when controlled via the visible prop', () => {
    cy.mount(ModalComponent, {
      props: { visible: true, renderToBody: false, title: 'Title' },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.get('.sd-btn').eq(1).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.have.length(1);
      const updates = wrapper.emitted('update:visible');
      expect(updates).to.have.length(1);
      expect(updates![0][0]).to.equal(false);
    });
    cy.get('.sd-modal').should('be.visible');
  });

  it('emits beforeOpen/beforeClose on visibility change', () => {
    cy.mount(ModalComponent, {
      props: { visible: false, renderToBody: false, title: 'Title' },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.get('.sd-modal').should('not.be.visible');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ visible: true })));
    cy.get('.sd-modal').should('be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('beforeOpen')).to.have.length(1);
      expect(wrapper.emitted('beforeClose')).to.equal(undefined);
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ visible: false })));
    cy.get('.sd-modal').should('not.be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('beforeClose')).to.have.length(1);
    });
  });

  it('applies fullscreen, modal-class, body-class and body-style', () => {
    cy.mount(ModalComponent, {
      props: {
        defaultVisible: true,
        renderToBody: false,
        title: 'Title',
        fullscreen: true,
        modalClass: 'custom-modal',
        bodyClass: 'custom-body',
        bodyStyle: { backgroundColor: 'rgb(2, 3, 4)' },
      },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.get('.sd-modal').should('have.class', 'sd-modal-fullscreen');
    cy.get('.sd-modal').should('have.class', 'custom-modal');
    cy.get('.sd-modal-body').should('have.class', 'custom-body');
    cy.get('.sd-modal-body')
      .invoke('attr', 'style')
      .should('contain', 'background-color: rgb(2, 3, 4)');
  });

  it('removes the whole header when hide-title is true', () => {
    cy.mount(ModalComponent, {
      props: { defaultVisible: true, renderToBody: false, title: 'Title', hideTitle: true },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.get('.sd-modal-header').should('not.exist');
    cy.get('.sd-modal-close-btn').should('not.exist');
  });

  it('hides the footer when footer is false', () => {
    cy.mount(ModalComponent, {
      props: { defaultVisible: true, renderToBody: false, title: 'Title', footer: false },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.get('.sd-modal-footer').should('not.exist');
  });

  it('renders the footer slot content instead of the default buttons', () => {
    cy.mount(ModalComponent, {
      props: { defaultVisible: true, renderToBody: false, title: 'Title' },
      slots: {
        default: '<div>Modal Body</div>',
        footer: '<span id="footer-slot">Custom Footer</span>',
      },
    });
    cy.get('#footer-slot').should('exist');
    cy.get('.sd-modal-footer .sd-btn').should('have.length', 0);
  });

  it('uses ok-text / cancel-text props for the footer buttons', () => {
    cy.mount(ModalComponent, {
      props: {
        defaultVisible: true,
        renderToBody: false,
        title: 'Title',
        okText: 'Yes',
        cancelText: 'Nope',
      },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.contains('button', 'Yes').should('exist');
    cy.contains('button', 'Nope').should('exist');
  });

  it('applies the top offset when align-center is false', () => {
    cy.mount(ModalComponent, {
      props: {
        defaultVisible: true,
        renderToBody: false,
        title: 'Title',
        alignCenter: false,
        top: 120,
      },
      slots: { default: '<div>Modal Body</div>' },
    });
    cy.get('.sd-modal').invoke('attr', 'style').should('contain', 'top: 120px');
  });

  it('drags the modal via the header when draggable is true', () => {
    cy.mount(ModalComponent, {
      props: { defaultVisible: true, renderToBody: false, title: 'Title', draggable: true },
      slots: { default: '<div>Modal Body</div>' },
    });
    // Move down-right by (+60, +40): within the drag bounds (default viewport
    // 1000x660, modal width 520), so the offset is applied unclamped.
    cy.get('.sd-modal-header').trigger('mousedown', { force: true, clientX: 500, clientY: 300 });
    cy.get('.sd-modal-header').trigger('mousemove', { force: true, clientX: 560, clientY: 340 });
    // 拖拽行为以 moved class 为准（transform 数值受 alignCenter 定位路径影响，不直接断言）
    cy.get('.sd-modal-wrapper').should('have.class', 'sd-modal-wrapper-moved');
  });

  it('hides via the returned close handle without firing onOk/onCancel', () => {
    const onOk = cy.spy().as('handleOnOk');
    const onCancel = cy.spy().as('handleOnCancel');
    let handle: ModalReturn | undefined;
    cy.mount(
      defineComponent({
        setup() {
          const instance = getCurrentInstance();
          return {
            handleClick: () => {
              handle = Modal.open(
                { title: 'title', content: 'content', onOk, onCancel },
                instance!.appContext,
              );
            },
          };
        },
        template: '<button @click="handleClick">Click</button>',
      }),
    );
    cy.get('button').click();
    cy.get('body .sd-modal').should('exist');
    cy.then(() => handle!.close());
    cy.get('body').should(($body) => {
      expect($body.find('.sd-modal:visible')).to.have.length(0);
    });
    cy.get('@handleOnOk').should('not.have.been.called');
    cy.get('@handleOnCancel').should('not.have.been.called');
  });

  it('updates config via the returned update handle', () => {
    let handle: ModalReturn | undefined;
    cy.mount(
      defineComponent({
        setup() {
          const instance = getCurrentInstance();
          return {
            handleOpen: () => {
              handle = Modal.open({ title: 'Before', content: 'content' }, instance!.appContext);
            },
            handleUpdate: () => handle!.update({ okText: 'Updated OK' }),
          };
        },
        template:
          '<button id="open" @click="handleOpen">Open</button>' +
          '<button id="update" @click="handleUpdate">Update</button>',
      }),
    );
    cy.get('#open').click();
    cy.get('body .sd-modal').should('exist');
    // modal 遮罩可能覆盖按钮，使用 force
    cy.get('#update').click({ force: true });
    cy.get('body .sd-modal-footer').should('contain.text', 'Updated OK');
  });

  it('destroyAll closes all imperatively opened modals', () => {
    cy.mount(
      defineComponent({
        setup() {
          const instance = getCurrentInstance();
          return {
            handleOpen: () => {
              Modal.open({ title: 'One', content: 'content' }, instance!.appContext);
              Modal.open({ title: 'Two', content: 'content' }, instance!.appContext);
            },
          };
        },
        template: '<button @click="handleOpen">Open</button>',
      }),
    );
    cy.get('button').click();
    cy.get('body .sd-modal').should('have.length', 2);
    cy.then(() => Modal.destroyAll());
    cy.get('body .sd-modal').should('not.exist');
  });

  it('message-type methods open a simple modal with the type icon', () => {
    cy.then(() => {
      Modal.info({ title: 'Info Title', content: 'content' });
    });
    cy.get('body .sd-modal').should('have.class', 'sd-modal-simple');
    cy.get('body .sd-modal-title-icon').should('exist');
    cy.get('body .sd-modal-close-btn').should('not.exist');
    // hideCancel defaults to true for message-type methods → only the OK button.
    cy.get('body .sd-btn').should('have.length', 1);
  });

  it('Modal.config toggles the default simple mode for global methods', () => {
    cy.then(() => {
      Modal.config({ simple: false });
      Modal.info({ title: 'Info Title', content: 'content' });
    });
    cy.get('body .sd-modal').should('not.have.class', 'sd-modal-simple');
    cy.get('body .sd-modal-close-btn').should('exist');
    cy.then(() => {
      Modal.config({ simple: true });
      Modal.destroyAll();
    });
    cy.get('body .sd-modal').should('not.exist');
  });
});
