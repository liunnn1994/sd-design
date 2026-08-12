import type { Component } from 'vue';

import BasicDemo from '../../../../sd-vue-docs/src/components/generated/radio/basic.vue';
import ButtonDemo from '../../../../sd-vue-docs/src/components/generated/radio/button.vue';
import ControlDemo from '../../../../sd-vue-docs/src/components/generated/radio/control.vue';
import GroupDemo from '../../../../sd-vue-docs/src/components/generated/radio/group.vue';
import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/radio/*.vue',
);

runDemoTests('radio', demos, () => {
  cy.get('.sd-radio, [class*="sd-"]').should('exist');
});

describe('<radio> interactive demos', () => {
  it('checks a standalone radio', () => {
    cy.mount(BasicDemo);
    cy.contains('.sd-radio', 'Radio').click();
    cy.contains('.sd-radio', 'Radio').find('input').should('be.checked');
  });

  it('keeps a controlled radio checked', () => {
    cy.mount(ControlDemo);
    cy.contains('.sd-radio', 'v-model').click();
    cy.contains('.sd-radio', 'v-model').find('input').should('be.checked');
  });

  it('selects a button radio option', () => {
    cy.mount(ButtonDemo);
    cy.contains('.sd-radio-button', 'Shanghai').click();
    cy.contains('.sd-radio-button', 'Shanghai').find('input').should('be.checked');
  });

  it('selects a radio group option', () => {
    cy.mount(GroupDemo);
    cy.get('.sd-radio-group').first().contains('.sd-radio', 'B').click();
    cy.get('.sd-radio-group').first().contains('.sd-radio', 'B').find('input').should('be.checked');
  });
});
