import InputNumber from '../index';

describe('InputNumber numeric boundaries', () => {
  it('retains scientific-notation step precision when precision is zero', () => {
    cy.mount(InputNumber, { props: { defaultValue: 0, precision: 0, step: 1e-7 } });
    cy.get('input').type('{upArrow}').should('have.value', '0.0000001');
    cy.get('input').type('{upArrow}').should('have.value', '0.0000002');
    cy.get('input').type('{downArrow}').should('have.value', '0.0000001');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.map(([value]) => value)).to.deep.equal([1e-7, 2e-7, 1e-7]);
    });
  });

  for (const boundary of [
    { typed: '0.6', value: '1', button: '增加', back: '{downArrow}', next: '0' },
    { typed: '0.4', value: '0', button: '减少', back: '{upArrow}', next: '1' },
  ]) {
    it(`refreshes step availability after rounding to ${boundary.value}`, () => {
      cy.mount(InputNumber, { props: { min: 0, max: 1, precision: 0 } });
      cy.get('input').type(boundary.typed).blur();
      cy.get('input').should('have.value', boundary.value);
      cy.get(`[aria-label="${boundary.button}"]`).should('be.disabled');
      cy.get('input').type(boundary.back).should('have.value', boundary.next);
      cy.get(`[aria-label="${boundary.button}"]`).should('not.be.disabled');
    });
  }

  it('starts an empty negative-only range at its maximum', () => {
    cy.mount(InputNumber, { props: { max: -5 } });
    cy.get('input').type('{upArrow}').should('have.value', '-5');
    cy.get('[aria-label="增加"]').should('be.disabled');
    cy.get('input').type('{downArrow}').should('have.value', '-6');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.map(([value]) => value)).to.deep.equal([-5, -6]);
    });
  });
});
