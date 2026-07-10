import InputNumber from '../index';

describe('InputNumber', () => {
  it('increments on step button press', () => {
    cy.mount(InputNumber);
    cy.get('button').first().trigger('mousedown').trigger('mouseup');
    cy.get('button').first().trigger('mousedown').trigger('mouseup');
    cy.get('input').should('have.value', '1');
  });

  it('clamps to min/max on blur', () => {
    cy.mount(InputNumber, { props: { min: 0, max: 10 } });
    cy.get('input').clear().type('-2').blur();
    cy.get('input').should('have.value', '0');
    cy.get('input').clear().type('20').blur();
    cy.get('input').should('have.value', '10');
  });

  it('keeps a string model value type on step and clear', () => {
    cy.mount(InputNumber, { props: { modelValue: '2', allowClear: true } });
    cy.get('button').first().trigger('mousedown').trigger('mouseup');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.[0]).to.deep.equal(['3']);
    });
    cy.get('input').clear().blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal(['']);
    });
  });
});
