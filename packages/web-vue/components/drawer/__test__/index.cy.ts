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
});
