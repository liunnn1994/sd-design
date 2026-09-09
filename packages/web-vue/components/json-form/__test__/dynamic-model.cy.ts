import JsonForm from '../index';

describe('JsonForm dynamic model and schemas', () => {
  it('edits the replacement model without modifying the previous object', () => {
    const first = { name: 'first' };
    const second = { name: 'second' };
    cy.mount(JsonForm, { props: { model: first, schemas: [{ field: 'name', type: 'input' }] } });
    cy.get('input').should('have.value', 'first');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ model: second }));
    cy.get('input').should('have.value', 'second').type('!');
    cy.then(() => {
      expect(first.name).to.equal('first');
      expect(second.name).to.equal('second!');
    });
  });

  it('replaces a schema field and routes subsequent edits to the new path', () => {
    const model = { first: 'one', nested: { second: 'two' } };
    cy.mount(JsonForm, {
      props: { model, schemas: [{ field: 'first', label: 'First', type: 'input' }] },
    });
    cy.get('input').should('have.value', 'one');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({
        schemas: [{ field: 'nested.second', label: 'Second', type: 'input' }],
      }),
    );
    cy.get('input').should('have.length', 1).and('have.value', 'two');
    cy.get('.sd-form-item-label').should('contain.text', 'Second').and('not.contain.text', 'First');
    cy.get('input').type('!');
    cy.then(() => {
      expect(model.first).to.equal('one');
      expect(model.nested.second).to.equal('two!');
    });
  });
});
