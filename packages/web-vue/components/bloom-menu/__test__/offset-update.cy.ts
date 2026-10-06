import BloomMenu from '../index';

it('repositions an open BloomMenu when its offset changes without scrolling or resizing', () => {
  cy.viewport(1000, 800);
  cy.mount(BloomMenu, {
    props: {
      items: [{ value: 'first', label: 'First' }],
      defaultOpen: true,
      buttonProps: { style: { marginLeft: '300px', marginTop: '250px' } },
    },
  });
  cy.get('[data-bloom-menu-panel]').should('have.css', 'opacity', '1');
  // Wait for the opening spring to finish so it cannot trigger a resize update.
  cy.wait(1000);
  cy.get('.sd-trigger-popup').then(($popup) => {
    const previous = $popup[0].getBoundingClientRect();
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ offset: { left: 40, top: 20 } }));
    cy.get('.sd-trigger-popup').should(($next) => {
      const next = $next[0].getBoundingClientRect();
      expect(next.left - previous.left).to.be.closeTo(40, 1);
      expect(next.top - previous.top).to.be.closeTo(20, 1);
    });
  });
});
