import { h } from 'vue';

import JsonForm from '../index';

describe('JsonForm component slot forwarding', () => {
  it('binds a native form-item event from the schema event object', () => {
    const onClick = cy.stub().as('itemClick');
    cy.mount(JsonForm, {
      props: { schemas: [{ field: 'name', formItemEvents: { click: onClick } }] },
    });
    cy.get('.sd-form-item').trigger('click');
    cy.get('@itemClick').should('have.been.calledOnce');
  });

  for (const name of ['prefix', 'suffix']) {
    it(`forwards the ${name} slot with the current field value`, () => {
      cy.mount(JsonForm, {
        props: { model: { name: 'initial' }, schemas: [{ field: 'name', type: 'input' }] },
        slots: {
          [name]: ({ value }: { value: unknown }) =>
            h('span', { 'data-test': 'field-slot' }, String(value)),
        },
      });
      cy.get(`.sd-input-${name} [data-test="field-slot"]`).should('have.text', 'initial');
      cy.get('input').type('!');
      cy.get(`.sd-input-${name} [data-test="field-slot"]`).should('have.text', 'initial!');
    });
  }
});
