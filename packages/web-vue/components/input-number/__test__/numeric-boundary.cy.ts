import InputNumber from '../index';

describe('InputNumber numeric boundaries', () => {
  for (const boundary of [
    { props: { max: 1.26 }, typed: '9', expected: '1.26', button: '增加' },
    { props: { min: 1.24 }, typed: '0', expected: '1.24', button: '减少' },
  ]) {
    it(`keeps the explicit boundary ${boundary.expected} when precision is coarser`, () => {
      cy.mount(InputNumber, { props: { ...boundary.props, precision: 1 } });
      cy.get('input').type(boundary.typed).blur();
      cy.get('input').should('have.value', boundary.expected);
      cy.get(`[aria-label="${boundary.button}"]`).should('be.disabled');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([
          Number(boundary.expected),
        ]);
      });
    });
  }

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
});
