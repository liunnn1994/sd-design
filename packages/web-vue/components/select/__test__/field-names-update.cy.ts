import Select from '../index';

describe('Select field names updates', () => {
  it('updates selected labels when the label mapping changes', () => {
    cy.mount(Select, {
      props: {
        modelValue: 'a',
        options: [{ value: 'a', label: 'Old label', title: 'New label' }],
      },
    });
    cy.get('.sd-select-view').should('contain.text', 'Old label');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ fieldNames: { label: 'title' } }));
    cy.get('.sd-select-view')
      .should('contain.text', 'New label')
      .and('not.contain.text', 'Old label');
  });

  it('uses the updated value mapping when an option is clicked', () => {
    const onChange = cy.spy().as('onChange');
    cy.mount(Select, {
      props: {
        options: [{ value: 'old', id: 'new', label: 'Option' }],
        fallbackOption: false,
        onChange,
      },
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ fieldNames: { value: 'id' } }));
    cy.get('.sd-select-view').click();
    cy.contains('.sd-select-option', 'Option').click();
    cy.get('@onChange').should('have.been.calledOnceWith', 'new');
  });
});
