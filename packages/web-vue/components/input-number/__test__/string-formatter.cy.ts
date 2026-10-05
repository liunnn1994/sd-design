import InputNumber, { type InputNumberValue } from '../index';

describe('InputNumber formatted high-precision strings', () => {
  it('formats initial and controlled strings without losing their stepping precision', () => {
    cy.mount(InputNumber, {
      props: {
        stringMode: true,
        modelValue: '9007199254740993',
        formatter: (value: InputNumberValue) => `${value} kg`,
        parser: (value: string) => value.replace(/ kg$/, ''),
      },
    });
    cy.get('input').should('have.value', '9007199254740993 kg');
    cy.get('input').type('{upArrow}').should('have.value', '9007199254740994 kg');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal(['9007199254740994']);
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: '9007199254740995' }));
    cy.get('input').should('have.value', '9007199254740995 kg');
    cy.get('input').type('{downArrow}').should('have.value', '9007199254740994 kg');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal(['9007199254740994']);
    });
  });
});
