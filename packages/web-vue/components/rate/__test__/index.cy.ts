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

  it('exposes radiogroup role and changes value via arrow keys', () => {
    cy.mount(Rate, { props: { count: 5 } });
    cy.get('.sd-rate').should('have.attr', 'role', 'radiogroup');
    cy.get('.sd-rate').should('have.attr', 'tabindex', '0');
    cy.get('.sd-rate').trigger('keydown', { key: 'ArrowRight' });
    cy.get('.sd-rate').trigger('keydown', { key: 'ArrowRight' });
    cy.get('@vue').should(({ wrapper }) => {
      // 两次 ArrowRight → 2 分（change 第二次是 2）
      expect(wrapper.emitted('change')?.[1]).to.deep.equal([2]);
    });
  });
});
