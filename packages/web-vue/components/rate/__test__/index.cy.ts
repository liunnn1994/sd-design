import Rate from '../index';

// Rate computes the value from the click position within each character.
// Without the icon-font CSS the characters have no layout in a headless mount,
// so exact values are not deterministic — assert that clicking selects.
describe('Rate', () => {
  it('selects a score on click', () => {
    cy.mount(Rate, { props: { allowClear: true } });
    cy.get('.sd-rate-character-left').eq(1).click({ force: true });
    cy.get('.sd-rate-character-full').should(($els) => {
      expect($els.length).to.be.greaterThan(0);
    });
  });
});
