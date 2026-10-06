import JsonForm from '../index';

describe('JsonForm zero column span', () => {
  it('preserves zero span and reacts when the column becomes visible', () => {
    const schemas = (span: number) => [
      {
        field: 'row',
        type: 'row',
        children: [{ field: 'name', type: 'input', span }],
      },
    ];
    cy.mount(JsonForm, { props: { schemas: schemas(0) } });
    cy.get('input').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ schemas: schemas(12) }));
    cy.get('input').should('be.visible');
    cy.get('.sd-col').should('have.class', 'sd-col-12');
  });
});
