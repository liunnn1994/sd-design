import Split from '../index';

describe('Split', () => {
  it('exposes the separator and resizes via arrow keys', () => {
    cy.mount(Split, {
      props: { defaultSize: 0.5 },
      slots: { first: () => 'first pane', second: () => 'second pane' },
    });
    cy.get('.sd-split-trigger').as('trigger').focus();
    cy.get('@trigger').should('have.attr', 'role', 'separator');
    cy.get('@trigger').should('have.attr', 'tabindex', '0');
    cy.get('@trigger').should('have.attr', 'aria-orientation', 'vertical');
    cy.get('@trigger').should('have.attr', 'aria-label', 'Resize');
    cy.get('@trigger').trigger('keydown', { key: 'ArrowRight' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:size'), 'update:size emitted on ArrowRight').to.not.equal(
        undefined,
      );
    });
  });
});
