import InputNumber from '../index';

describe('InputNumber string stepping', () => {
  for (const example of [
    { value: '9007199254740993', step: 1, next: '9007199254740994' },
    { value: '0.123456789012345678', step: 0.1, next: '0.223456789012345678' },
    { value: '-0.05', step: 0.1, next: '0.05' },
    { value: '0.00000001', step: 1e-7, next: '0.00000011' },
  ]) {
    it(`steps ${example.value} without losing digits`, () => {
      cy.mount(InputNumber, {
        props: { stringMode: true, defaultValue: example.value, step: example.step },
      });
      cy.get('input').type('{upArrow}').should('have.value', example.next);
      cy.get('input').type('{downArrow}').should('have.value', example.value);
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('change')?.map(([value]) => value)).to.deep.equal([
          example.next,
          example.value,
        ]);
      });
    });
  }
});
