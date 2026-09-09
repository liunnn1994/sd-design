import InputNumber, { type InputNumberValue } from '../index';

describe('InputNumber formatted values', () => {
  it('preserves the number when replacing and removing a formatter/parser pair', () => {
    cy.mount(InputNumber, {
      props: {
        defaultValue: 5,
        formatter: (value: InputNumberValue) => `${value} kg`,
        parser: (value: string) => value.replace(/ kg$/, ''),
      },
    });
    cy.get('input').should('have.value', '5 kg');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({
        formatter: (value: InputNumberValue) => `${value} lb`,
        parser: (value: string) => value.replace(/ lb$/, ''),
      }),
    );
    cy.get('input').should('have.value', '5 lb');
    cy.get('input').type('{upArrow}').should('have.value', '6 lb');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ formatter: undefined, parser: undefined }),
    );
    cy.get('input').should('have.value', '6');
    cy.get('input').type('{downArrow}').should('have.value', '5');
  });

  it('exposes the numeric value separately from its formatted display', () => {
    cy.mount(InputNumber, {
      props: {
        defaultValue: 5,
        formatter: (value: InputNumberValue) =>
          value === '' || value == null ? '' : `${value} kg`,
        parser: (value: string) => value.replace(/ kg$/, ''),
      },
    });
    cy.get('input').should('have.value', '5 kg');
    cy.get('input').should('have.attr', 'aria-valuenow', '5');
    cy.get('input').should('have.attr', 'aria-valuetext', '5 kg');
    cy.get('input').type('{upArrow}').should('have.value', '6 kg');
    cy.get('input').should('have.attr', 'aria-valuenow', '6');
    cy.get('input').clear().blur();
    cy.get('input').should('not.have.attr', 'aria-valuenow');
    cy.get('input').should('not.have.attr', 'aria-valuetext');
  });
});
