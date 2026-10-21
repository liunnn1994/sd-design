import { h, type Component } from 'vue';

import Popover from '../../popover';
import Trigger from '../../trigger';
import Tooltip from '../index';

for (const [name, component] of [
  ['Tooltip', Tooltip],
  ['Popover', Popover],
] as const) {
  describe(`${name} popup wrapper foundation`, () => {
    it('forwards repeated requests in order and retains the last request after controlled changes/release', () => {
      const events: unknown[] = [];
      cy.mount(component as Component, {
        props: {
          'popupVisible': false,
          'defaultPopupVisible': false,
          'content': `${name} content`,
          'onUpdate:popupVisible': (value: boolean) => events.push(['model', value]),
          'onPopupVisibleChange': (value: boolean) => events.push(['change', value]),
        },
        slots: { default: () => h('button', 'Trigger') },
      });
      cy.get('@vue').then(({ wrapper }) => {
        const trigger = wrapper.findComponent(Trigger);
        trigger.vm.$emit('popupVisibleChange', true);
        trigger.vm.$emit('popupVisibleChange', true);
      });
      cy.then(() =>
        expect(events).to.deep.equal([
          ['model', true],
          ['change', true],
          ['model', true],
          ['change', true],
        ]),
      );
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ popupVisible: true }));
      cy.get('@vue').should(({ wrapper }) =>
        expect(wrapper.findComponent(Trigger).props('popupVisible')).to.equal(true),
      );
      cy.get('@vue').then(({ wrapper }) =>
        wrapper.setProps({ popupVisible: false, defaultPopupVisible: false }),
      );
      cy.get('@vue').should(({ wrapper }) =>
        expect(wrapper.findComponent(Trigger).props('popupVisible')).to.equal(false),
      );
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ popupVisible: undefined }));
      cy.get('@vue').should(({ wrapper }) =>
        expect(wrapper.findComponent(Trigger).props('popupVisible')).to.equal(true),
      );
      cy.get('.sd-trigger-popup').should('be.visible');
    });
    it('captures the default once and does not synchronize unrequested controlled values into the fallback', () => {
      const change = cy.spy().as('change');
      cy.mount(component as Component, {
        props: {
          popupVisible: false,
          defaultPopupVisible: false,
          content: `${name} default`,
          onPopupVisibleChange: change,
        },
        slots: { default: () => h('button', 'Trigger') },
      });
      cy.get('@vue').then(({ wrapper }) =>
        wrapper.setProps({ defaultPopupVisible: true, popupVisible: true }),
      );
      cy.get('@vue').should(({ wrapper }) =>
        expect(wrapper.findComponent(Trigger).props('popupVisible')).to.equal(true),
      );
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ popupVisible: undefined }));
      cy.get('@vue').should(({ wrapper }) =>
        expect(wrapper.findComponent(Trigger).props('popupVisible')).to.equal(false),
      );
      cy.get('@change').should('not.have.been.called');
    });
  });
}
