import { defineComponent, getCurrentInstance } from 'vue';

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
});
