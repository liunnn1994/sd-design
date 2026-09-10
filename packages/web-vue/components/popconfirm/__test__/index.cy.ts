import { h, ref } from 'vue';

import Popconfirm from '../index';

describe('Popconfirm', () => {
  it('emits ok/cancel events', () => {
    cy.mount(Popconfirm, {
      props: { content: 'Content', defaultPopupVisible: true, renderToBody: false },
      slots: { default: '<button>Button</button>' },
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

  it('wires aria-haspopup=dialog and aria-expanded on the trigger', () => {
    cy.mount(Popconfirm, {
      props: { content: 'Content', defaultPopupVisible: true, renderToBody: false },
      slots: { default: '<button>Button</button>' },
    });
    cy.get('button').should('have.attr', 'aria-haspopup', 'dialog');
    cy.get('button').should('have.attr', 'aria-expanded', 'true');
  });

  it('renders custom okText and cancelText', () => {
    cy.mount(Popconfirm, {
      props: {
        content: 'Content',
        okText: 'Confirm',
        cancelText: 'Think Again',
        defaultPopupVisible: true,
        renderToBody: false,
      },
      slots: { default: '<button>Button</button>' },
    });
    cy.get('.sd-popconfirm-footer .sd-btn').eq(0).should('have.text', 'Think Again');
    cy.get('.sd-popconfirm-footer .sd-btn').eq(1).should('have.text', 'Confirm');
  });

  it('renders the type icon and honors the icon slot', () => {
    cy.mount(Popconfirm, {
      props: {
        content: 'Content',
        type: 'success',
        defaultPopupVisible: true,
        renderToBody: false,
      },
      slots: { default: '<button>Button</button>' },
    });
    cy.get('.sd-popconfirm-icon svg').should('exist');

    cy.mount(Popconfirm, {
      props: { content: 'Content', defaultPopupVisible: true, renderToBody: false },
      slots: {
        default: '<button>Button</button>',
        icon: '<span class="custom-icon">!</span>',
      },
    });
    cy.get('.sd-popconfirm-icon .custom-icon').should('exist');
  });

  it('renders the content slot instead of the content prop', () => {
    cy.mount(Popconfirm, {
      props: { content: 'Prop content', defaultPopupVisible: true, renderToBody: false },
      slots: {
        default: '<button>Button</button>',
        content: '<em class="custom-content">Slot content</em>',
      },
    });
    cy.get('.sd-popconfirm-content .custom-content').should('have.text', 'Slot content');
  });

  it('onBeforeOk returning false blocks the ok event and keeps the popup open', () => {
    cy.mount(Popconfirm, {
      props: {
        content: 'Content',
        defaultPopupVisible: true,
        renderToBody: false,
        onBeforeOk: () => false,
      },
      slots: { default: '<button>Button</button>' },
    });
    cy.get('.sd-popconfirm-footer .sd-btn').eq(1).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.equal(undefined);
    });
    cy.get('.sd-popconfirm-popup-content').should('be.visible');
  });

  it('shows ok loading while the onBeforeOk promise is pending, then closes on resolve(true)', () => {
    cy.clock();

    cy.mount(Popconfirm, {
      props: {
        content: 'Content',
        defaultPopupVisible: true,
        renderToBody: false,
        onBeforeOk: () =>
          new Promise<boolean>((resolve) => {
            setTimeout(() => resolve(true), 500);
          }),
      },
      slots: { default: '<button>Enter</button>' },
    });
    cy.get('.sd-popconfirm-footer .sd-btn').eq(1).click({ force: true });
    cy.get('.sd-popconfirm-popup-content .sd-btn-loading').should('exist');
    cy.tick(600);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.have.length(1);
      expect(wrapper.emitted('update:popupVisible')?.[0]).to.deep.equal([false]);
    });
    cy.get('.sd-popconfirm-popup-content').should('not.be.visible');
  });

  it('onBeforeOk resolving false clears loading, blocks ok and keeps the popup open', () => {
    cy.clock();

    cy.mount(Popconfirm, {
      props: {
        content: 'Content',
        defaultPopupVisible: true,
        renderToBody: false,
        onBeforeOk: () =>
          new Promise<boolean>((resolve) => {
            setTimeout(() => resolve(false), 500);
          }),
      },
      slots: { default: '<button>Enter</button>' },
    });
    cy.get('.sd-popconfirm-footer .sd-btn').first().should('exist');
    cy.get('.sd-popconfirm-footer .sd-btn').eq(1).click({ force: true });
    cy.get('.sd-popconfirm-popup-content .sd-btn-loading').should('exist');
    cy.tick(600);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.equal(undefined);
    });
    cy.get('.sd-popconfirm-popup-content').should('be.visible');
    cy.get('.sd-popconfirm-popup-content .sd-btn-loading').should('not.exist');
  });

  it('onBeforeCancel returning false blocks the cancel event', () => {
    cy.mount(Popconfirm, {
      props: {
        content: 'Content',
        defaultPopupVisible: true,
        renderToBody: false,
        onBeforeCancel: () => false,
      },
      slots: { default: '<button>Button</button>' },
    });
    cy.get('.sd-popconfirm-footer .sd-btn').eq(0).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('cancel')).to.equal(undefined);
    });
    cy.get('.sd-popconfirm-popup-content').should('be.visible');
  });

  it('onBeforeCancel returning void proceeds with the cancel event', () => {
    cy.mount(Popconfirm, {
      props: {
        content: 'Content',
        defaultPopupVisible: true,
        renderToBody: false,
        onBeforeCancel: () => undefined,
      },
      slots: { default: '<button>Button</button>' },
    });
    cy.get('.sd-popconfirm-footer .sd-btn').eq(0).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('cancel')).to.have.length(1);
      expect(wrapper.emitted('update:popupVisible')?.[0]).to.deep.equal([false]);
    });
    cy.get('.sd-popconfirm-popup-content').should('not.be.visible');
  });

  it('onBeforeOk rejecting clears loading, blocks ok and keeps the popup open', () => {
    // 延迟拒绝：立即 reject 的 promise 会在同一批微任务内完成 loading 设置与清除，
    // Cypress 无法观察到 loading 中间态
    cy.clock();
    cy.mount(Popconfirm, {
      props: {
        content: 'Content',
        defaultPopupVisible: true,
        renderToBody: false,
        onBeforeOk: () =>
          new Promise<boolean>((_resolve, reject) => {
            setTimeout(() => reject(new Error('rejected')), 500);
          }),
      },
      slots: { default: '<button>Button</button>' },
    });
    cy.get('.sd-popconfirm-footer .sd-btn').first().should('exist');
    cy.get('.sd-popconfirm-footer .sd-btn').eq(1).click({ force: true });
    cy.get('.sd-popconfirm-popup-content .sd-btn-loading').should('exist');
    cy.tick(600);
    // 拒绝视同阻止关闭，loading 必须清除且 await 落定
    cy.get('.sd-popconfirm-popup-content .sd-btn-loading').should('not.exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.equal(undefined);
    });
    cy.get('.sd-popconfirm-popup-content').should('be.visible');
  });

  it('ignores a pending confirmation after controlled visibility closes', () => {
    const visible = ref(true);
    let resolveConfirmation!: (confirmed: boolean) => void;
    const onOk = cy.spy().as('onOk');

    cy.mount(() =>
      h(
        Popconfirm,
        {
          content: 'Content',
          popupVisible: visible.value,
          renderToBody: false,
          onBeforeOk: () =>
            new Promise<boolean>((resolve) => {
              resolveConfirmation = resolve;
            }),
          onOk,
        },
        { default: () => h('button', 'Button') },
      ),
    );
    cy.get('.sd-popconfirm-footer .sd-btn').eq(1).click({ force: true });
    cy.get('.sd-popconfirm-popup-content .sd-btn-loading').should('exist');
    cy.then(() => {
      visible.value = false;
    });
    cy.get('.sd-popconfirm-popup-content').should('not.be.visible');
    cy.then(() => resolveConfirmation(true));
    cy.get('@onOk').should('not.have.been.called');
  });

  it('closes on ESC and emits the visibility events', () => {
    cy.mount(Popconfirm, {
      props: { content: 'Content', defaultPopupVisible: true, renderToBody: false },
      slots: { default: '<button>Button</button>' },
    });
    cy.document().trigger('keydown', { key: 'Escape' });
    cy.get('button').should('have.attr', 'aria-expanded', 'false');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:popupVisible')?.[0]).to.deep.equal([false]);
      expect(wrapper.emitted('popupVisibleChange')?.[0]).to.deep.equal([false]);
    });
    cy.get('.sd-popconfirm-popup-content').should('not.be.visible');
  });

  it('controlled popupVisible stays open while emitting update events', () => {
    cy.mount(Popconfirm, {
      props: { content: 'Content', popupVisible: true, renderToBody: false },
      slots: { default: '<button>Button</button>' },
    });
    cy.get('.sd-popconfirm-footer .sd-btn').eq(0).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:popupVisible')?.[0]).to.deep.equal([false]);
      expect(wrapper.emitted('popupVisibleChange')?.[0]).to.deep.equal([false]);
      expect(wrapper.emitted('cancel')).to.have.length(1);
    });
    cy.get('.sd-popconfirm-popup-content').should('be.visible');
  });

  it('applies position and content/arrow classes to the popup', () => {
    cy.mount(Popconfirm, {
      props: {
        content: 'Content',
        position: 'br',
        contentClass: 'custom-content-class',
        arrowClass: 'custom-arrow-class',
        defaultPopupVisible: true,
        renderToBody: false,
        // 关闭自动适配，确保最终 placement 保持请求的 'br'（与 trigger 测试的做法一致）
        autoFitPosition: false,
      },
      slots: { default: '<button>Button</button>' },
    });
    cy.get('.sd-trigger-popup.sd-trigger-position-br').should('be.visible');
    cy.get('.sd-popconfirm-popup-content.custom-content-class').should('be.visible');
    cy.get('.sd-popconfirm-popup-arrow.custom-arrow-class').should('exist');
  });
});
