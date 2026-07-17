import { defineComponent } from 'vue';

import ConfigProvider from '../../config-provider';
import Ellipsis from '../../ellipsis';
import Drawer from '../drawer.vue';

const baseSlots = { default: '<div>Drawer Body</div>' };

describe('Drawer', () => {
  it('renders with title, body and an ellipsis tooltip on the title', () => {
    cy.mount(Drawer, {
      props: { title: 'Title', defaultVisible: true, renderToBody: false },
      slots: baseSlots,
    });
    cy.get('.sd-drawer').should('exist');
    cy.contains('Drawer Body').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Ellipsis).props('tooltip')).to.equal(true);
    });
  });

  it('emits cancel then ok on footer button clicks', () => {
    cy.mount(Drawer, {
      props: { title: 'Title', defaultVisible: true, renderToBody: false },
      slots: baseSlots,
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

  it('uses drawer defaults from the config-provider', () => {
    cy.mount(
      defineComponent({
        components: { ConfigProvider, Drawer },
        template: `
          <config-provider
            :drawer="{
              closable: false,
              okText: '全局确认',
              height: 360,
              mask: false,
              hideCancel: true,
              placement: 'bottom',
              escToClose: false,
              titleEllipsisTooltip: false,
            }"
          >
            <drawer title="Title" default-visible :render-to-body="false">
              <div>Drawer Body</div>
            </drawer>
          </config-provider>
        `,
      }),
    );
    cy.get('.sd-drawer-mask').should('not.exist');
    cy.get('.sd-drawer-close-btn').should('not.exist');
    cy.contains('全局确认').should('exist');
    cy.get('.sd-drawer')
      .invoke('attr', 'style')
      .should('contain', 'height: 360px')
      .and('contain', 'bottom: 0px');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Ellipsis).props('tooltip')).to.equal(false);
    });
    cy.document().trigger('keydown', { key: 'Escape' });
    cy.get('.sd-drawer').should('exist');
  });

  it('prefers explicit drawer props over config-provider defaults', () => {
    cy.mount(
      defineComponent({
        components: { ConfigProvider, Drawer },
        template: `
          <config-provider :drawer="{ closable: false, okText: '全局确认', titleEllipsisTooltip: false }">
            <drawer
              title="Title"
              default-visible
              :render-to-body="false"
              closable
              ok-text="本地确认"
              :title-ellipsis-tooltip="true"
            >
              <div>Drawer Body</div>
            </drawer>
          </config-provider>
        `,
      }),
    );
    cy.get('.sd-drawer-close-btn').should('exist');
    cy.contains('本地确认').should('exist');
    cy.contains('全局确认').should('not.exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Ellipsis).props('tooltip')).to.equal(true);
    });
  });

  it('exposes dialog role with aria-labelledby / aria-describedby', () => {
    cy.mount(Drawer, {
      props: { title: 'My Title', defaultVisible: true, renderToBody: false },
      slots: baseSlots,
    });
    cy.get('.sd-drawer').should('have.attr', 'role', 'dialog');
    cy.get('.sd-drawer').should('have.attr', 'aria-modal', 'true');
    cy.get('.sd-drawer-title').then(($title) => {
      cy.get('.sd-drawer').should('have.attr', 'aria-labelledby', $title.attr('id'));
    });
    cy.get('.sd-drawer-body').then(($body) => {
      cy.get('.sd-drawer').should('have.attr', 'aria-describedby', $body.attr('id'));
    });
  });

  it('moves focus into the drawer on open and releases it on ESC close', () => {
    // drawer 的 `visible` 默认 false（非 modal 的 undefined），defaultVisible 无效，
    // 故用受控 visible 起始 true 来让抽屉真正显示，v-model 处理 ESC 关闭。
    const Outer = defineComponent({
      components: { Drawer },
      data: () => ({ visible: true }),
      template: `
        <drawer
          v-model:visible="visible"
          :render-to-body="false"
          title="Title"
        ><div>Drawer Body</div></drawer>
      `,
    });
    cy.mount(Outer);
    // 打开后焦点进入抽屉（焦点陷阱激活）
    cy.wrap(null).should(() => {
      expect(document.activeElement?.closest('.sd-drawer')).to.not.equal(null);
    });
    // ESC 关闭后焦点离开抽屉（陷阱失活）
    cy.get('.sd-drawer').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-drawer').should('not.be.visible');
    cy.wrap(null).should(() => {
      expect(document.activeElement?.closest('.sd-drawer')).to.equal(null);
    });
  });
});
