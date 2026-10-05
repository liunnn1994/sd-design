import { h } from 'vue';

import ColorPicker from '../index';

describe('ColorPicker popup state', () => {
  it('reports an initially open popup to the input', () => {
    cy.mount(ColorPicker, { props: { triggerProps: { defaultPopupVisible: true } } });
    cy.get('.sd-color-picker-panel').should('be.visible');
    cy.get('.sd-color-picker-trigger-input input').should('have.attr', 'aria-expanded', 'true');
  });

  it('reports external visibility changes to the custom trigger', () => {
    cy.mount(ColorPicker, {
      props: { triggerProps: { popupVisible: false } },
      slots: {
        trigger: ({ popupVisible }: { popupVisible: boolean }) =>
          h('button', { 'data-testid': 'trigger' }, String(popupVisible)),
      },
    });
    cy.get('[data-testid="trigger"]').should('have.text', 'false');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ triggerProps: { popupVisible: true } }),
    );
    cy.get('.sd-color-picker-panel').should('be.visible');
    cy.get('[data-testid="trigger"]').should('have.text', 'true');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ triggerProps: { popupVisible: false } }),
    );
    cy.get('[data-testid="trigger"]').should('have.text', 'false');
    cy.get('.sd-color-picker-panel').should('not.be.visible');
  });

  it('keeps the input collapsed until a controlled opening is accepted', () => {
    cy.mount(ColorPicker, { props: { triggerProps: { popupVisible: false } } });
    cy.get('.sd-color-picker-trigger-input input').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popup-visible-change')?.at(-1)?.[0]).to.equal(true);
    });
    cy.get('.sd-color-picker-trigger-input input').should('have.attr', 'aria-expanded', 'false');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ triggerProps: { popupVisible: true } }),
    );
    cy.get('.sd-color-picker-trigger-input input').should('have.attr', 'aria-expanded', 'true');
  });
});
