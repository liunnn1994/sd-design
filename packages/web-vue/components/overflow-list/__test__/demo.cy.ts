import type { Component } from 'vue';

import BasicDemo from '../../../../sd-vue-docs/src/components/generated/overflow-list/basic.vue';
import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/overflow-list/*.vue',
);

runDemoTests('overflow-list', demos, () => {
  cy.get('.sd-overflow-list').should('exist');
});

describe('<overflow-list> basic demo', () => {
  it('updates the list width when the slider value changes', () => {
    cy.mount(BasicDemo);
    cy.get('.overflow-host').should('have.css', 'width', '500px');
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.findComponent({ name: 'Slider' }).vm.$emit('update:modelValue', 240);
    });
    cy.get('.overflow-host').should('have.css', 'width', '240px');
  });
});
