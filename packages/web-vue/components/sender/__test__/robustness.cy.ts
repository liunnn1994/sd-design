import { h, ref } from 'vue';

import Sender, { SenderHeader, SenderSwitch, type SenderSlotConfig } from '../index';

describe('Sender robustness', () => {
  it('switches to controlled text when modelValue is added', () => {
    cy.mount(Sender, { props: { defaultValue: 'Old' } });
    cy.get('textarea').should('have.value', 'Old');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: 'New' }));
    cy.get('textarea').should('have.value', 'New');
  });

  it('accepts text edits after the modelValue prop is removed', () => {
    const controlled = ref(true);
    cy.mount({
      setup: () => () =>
        h(Sender, { defaultValue: 'Old', ...(controlled.value ? { modelValue: 'Bound' } : {}) }),
    });
    cy.get('textarea').should('have.value', 'Bound');
    cy.then(() => {
      controlled.value = false;
    });
    cy.get('textarea').clear().type('New');
    cy.get('textarea').should('have.value', 'New');
  });

  it('switches to controlled state when modelValue is added to SenderSwitch', () => {
    cy.mount(SenderSwitch, { props: { defaultValue: false } });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: true }));
    cy.get('.sd-sender-switch').should('have.class', 'sd-sender-switch-checked');
  });

  it('renders a closed header when forceRender becomes true', () => {
    cy.mount(SenderHeader, { slots: { default: '<span class="header-child">Content</span>' } });
    cy.get('.header-child').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ forceRender: true }));
    cy.get('.header-child').should('exist');
    cy.get('.sd-sender-header').should('not.be.visible');
  });

  it('preserves a cleared custom slot when its configuration changes', () => {
    const config: SenderSlotConfig = {
      type: 'custom',
      key: 'custom',
      props: { defaultValue: 'Old' },
      customRender: (value, change) =>
        h('button', { class: 'custom-value', onClick: () => change(null) }, String(value)),
    };
    cy.mount(Sender, { props: { slotConfig: [config] } });
    cy.get('.custom-value').should('have.text', 'Old').click();
    cy.get('.custom-value').should('have.text', 'null');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({
        slotConfig: [{ ...config, props: { defaultValue: 'Old', placeholder: 'Updated' } }],
      }),
    );
    cy.get('.custom-value').should('have.text', 'null');
  });
});
