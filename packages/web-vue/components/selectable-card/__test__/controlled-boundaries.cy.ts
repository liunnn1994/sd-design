import { defineComponent, h, ref } from 'vue';

import SelectableCard from '../index';

describe('SelectableCard controlled boundaries', () => {
  it('renders a numeric zero value', () => {
    cy.mount(SelectableCard, { props: { label: 'Count', isSelected: false, value: 0 } });
    cy.get('.sd-selectable-card-value').should('have.text', '0');
  });

  it('keeps the native checkbox consistent when a parent rejects a change', () => {
    const onChange = cy.spy().as('onChange');
    cy.mount(SelectableCard, { props: { label: 'Plan', isSelected: false, onChange } });
    cy.get('input[type="checkbox"]').focus().type(' ').should('not.be.checked');
    cy.get('@onChange').should('have.been.calledOnceWith', true);
    cy.get('.sd-selectable-card').should('not.have.class', 'sd-selectable-card--selected');
  });

  it('reflects accepted keyboard changes through the controlled prop', () => {
    cy.mount(
      defineComponent({
        setup() {
          const selected = ref(false);
          return () =>
            h(SelectableCard, {
              label: 'Plan',
              isSelected: selected.value,
              onChange: (value: boolean) => {
                selected.value = value;
              },
            });
        },
      }),
    );
    cy.get('input[type="checkbox"]').focus().type(' ').should('be.checked');
    cy.get('.sd-selectable-card').should('have.class', 'sd-selectable-card--selected');
    cy.get('input[type="checkbox"]').type(' ').should('not.be.checked');
    cy.get('.sd-selectable-card').should('not.have.class', 'sd-selectable-card--selected');
  });
});
