import ColorPicker from '../index';

describe('ColorPicker controlled value', () => {
  it('waits for parent acceptance before retaining a new gradient stop', () => {
    cy.mount(ColorPicker, {
      props: {
        hideTrigger: true,
        colorModes: ['linear-gradient'],
        modelValue: 'linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(0, 0, 255) 100%)',
      },
    });
    cy.get('.sd-color-picker-gradient-bar').click('center');
    cy.then(() => Cypress.Promise.delay(0));
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 2);
    cy.get('@vue').then(({ wrapper }) => {
      const requested = wrapper.emitted('update:modelValue')?.at(-1)?.[0];
      expect(requested).to.contain('50%');
      return wrapper.setProps({ modelValue: requested });
    });
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 3);
  });

  it('keeps the trigger value until the parent accepts an edited color', () => {
    cy.mount(ColorPicker, { props: { modelValue: '#ff0000', format: 'HEX' } });
    cy.get('.sd-color-picker-trigger-input input').clear().type('#0000ff{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('#0000FF');
    });
    cy.get('.sd-color-picker-trigger-input input').should('have.value', '#FF0000');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: '#0000ff' }));
    cy.get('.sd-color-picker-trigger-input input').should('have.value', '#0000FF');
  });

  it('keeps the panel value until the parent accepts a swatch', () => {
    cy.mount(ColorPicker, {
      props: { hideTrigger: true, modelValue: '#ff0000', swatchColors: ['#0000ff'] },
    });
    cy.get('.sd-color-picker-color-block').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('rgb(0, 0, 255)');
    });
    cy.get('.sd-color-picker-format-input input').first().should('have.value', '255');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: '#0000ff' }));
    cy.get('.sd-color-picker-format-input input').first().should('have.value', '0');
    cy.get('.sd-color-picker-format-input input').last().should('have.value', '255');
  });
});
