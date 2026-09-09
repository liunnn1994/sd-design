import InputNumber from '../index';

describe('InputNumber lifecycle', () => {
  it('updates controlled string values even when Number cannot distinguish them', () => {
    cy.mount(InputNumber, { props: { stringMode: true, modelValue: '9007199254740992' } });
    cy.get('input').should('have.value', '9007199254740992');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: '9007199254740993' }));
    cy.get('input').should('have.value', '9007199254740993');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: '5.10' }));
    cy.get('input').should('have.value', '5.10');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: '5.100' }));
    cy.get('input').should('have.value', '5.100');
    cy.get('input').type('2').blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal(['5.1002']);
    });
  });

  it('stops a held step button when the component is removed', () => {
    const onChange = cy.stub().as('change');
    cy.clock();
    cy.mount(InputNumber, { props: { defaultValue: 0, onChange } });
    cy.get('[aria-label="增加"]').trigger('mousedown');
    cy.get('input').should('have.value', '1');
    cy.tick(800);
    cy.get('input').should('have.value', '2');
    cy.get('@change').should('have.been.calledTwice');
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.tick(1000);
    cy.get('@change').should('have.been.calledTwice');
  });

  it('repeats while held and stops on release or leaving the button', () => {
    cy.clock();
    cy.mount(InputNumber, { props: { defaultValue: 0 } });
    cy.get('[aria-label="增加"]').trigger('mousedown');
    cy.tick(800);
    cy.get('input').should('have.value', '2');
    cy.tick(150);
    cy.get('input').should('have.value', '3');
    cy.get('[aria-label="增加"]').trigger('mouseup');
    cy.tick(1000);
    cy.get('input').should('have.value', '3');
    cy.get('[aria-label="减少"]').trigger('mousedown').trigger('mouseleave');
    cy.tick(1000);
    cy.get('input').should('have.value', '2');
  });

  it('stops repeating when the held button is hidden', () => {
    cy.clock();
    cy.mount(InputNumber, { props: { defaultValue: 0 } });
    cy.get('[aria-label="增加"]').trigger('mousedown');
    cy.get('input').should('have.value', '1');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ hideButton: true }));
    cy.get('[aria-label="增加"]').should('not.exist');
    cy.tick(1000);
    cy.get('input').should('have.value', '1');
  });
});
