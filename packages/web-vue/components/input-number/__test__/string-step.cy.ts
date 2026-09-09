import InputNumber from '../index';

describe('InputNumber string stepping', () => {
  for (const example of [
    { value: '9007199254740993.145', expected: '9007199254740993.15' },
    { value: '-9007199254740993.145', expected: '-9007199254740993.15' },
    { value: '9.999', expected: '10.00' },
  ]) {
    it(`rounds ${example.value} to two decimal places without losing precision`, () => {
      cy.mount(InputNumber, { props: { stringMode: true, precision: 2, step: 0.01 } });
      cy.get('input').type(example.value).blur().should('have.value', example.expected);
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([example.expected]);
      });
      cy.get('input').type('{upArrow}{downArrow}').should('have.value', example.expected);
    });
  }

  it('allows an exact step to a maximum even when Number rounds the initial value up', () => {
    cy.mount(InputNumber, {
      props: { stringMode: true, defaultValue: '0.99999999999999999', max: 1, step: 1e-17 },
    });
    cy.get('[aria-label="增加"]').should('not.be.disabled');
    cy.get('input').type('{upArrow}').should('have.value', '1.00000000000000000');
    cy.get('[aria-label="增加"]').should('be.disabled');
    cy.get('input').type('{downArrow}').should('have.value', '0.99999999999999999');
  });

  for (const example of [
    { props: { max: 1 }, value: '1.00000000000000001' },
    { props: { min: 1 }, value: '0.99999999999999999' },
  ]) {
    it(`clamps the exact out-of-range string ${example.value} on blur`, () => {
      cy.mount(InputNumber, { props: { stringMode: true, ...example.props } });
      cy.get('input').type(example.value).blur().should('have.value', '1');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal(['1']);
      });
    });
  }

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
