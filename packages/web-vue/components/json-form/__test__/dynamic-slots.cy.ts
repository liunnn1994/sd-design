import { h, ref } from 'vue';

import JsonForm from '../index';

describe('JsonForm dynamic slots', () => {
  for (const initial of [false, true]) {
    it(`switches between schemas and a default slot starting ${initial ? 'present' : 'absent'}`, () => {
      const visible = ref(initial);
      const schemas = [{ field: 'name', type: 'input' }];
      cy.mount({
        setup: () => () =>
          h(JsonForm, { schemas }, visible.value ? { default: () => h('b', 'Custom') } : {}),
      });
      cy.get('.sd-json-form b').should(initial ? 'exist' : 'not.exist');
      cy.then(() => {
        visible.value = !initial;
      });
      cy.get('.sd-json-form b').should(initial ? 'not.exist' : 'have.text', 'Custom');
      cy.get('input').should(initial ? 'exist' : 'not.exist');
    });
  }

  for (const row of [false, true]) {
    it(`updates component slots ${row ? 'inside a row' : 'on a direct field'}`, () => {
      const visible = ref(false);
      const field = { field: 'name', type: 'input' };
      const schemas = row ? [{ field: 'row', type: 'row', children: [field] }] : [field];
      cy.mount({
        setup: () => () =>
          h(JsonForm, { schemas }, visible.value ? { prefix: () => 'Dynamic' } : {}),
      });
      cy.get('.sd-input-prefix').should('not.exist');
      cy.then(() => {
        visible.value = true;
      });
      cy.get('.sd-input-prefix').should('have.text', 'Dynamic');
      cy.then(() => {
        visible.value = false;
      });
      cy.get('.sd-input-prefix').should('not.exist');
    });
  }
});
