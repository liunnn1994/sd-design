import type { Component } from 'vue';

import BasicDemo from '../../../../sd-vue-docs/src/components/generated/voice-glow/basic.vue';
import InteractiveDemo from '../../../../sd-vue-docs/src/components/generated/voice-glow/interactive.vue';
import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/voice-glow/*.vue',
);

runDemoTests('voice-glow', demos, () => {
  cy.get('.sd-voice-glow').should('exist');
  cy.get('[data-voice-beam-bloom]').should('exist');
});

it('shows the basic glow on dark and light backgrounds', () => {
  cy.mount(BasicDemo);
  cy.get('.voice-glow-stage-dark .sd-voice-glow').should('exist');
  cy.get('.voice-glow-stage-light .sd-voice-glow').should('exist');
});

it('switches level and processing in the interactive demo', () => {
  cy.mount(InteractiveDemo);
  cy.get('.voice-glow-card').should('contain.text', '音量：0.2');
  cy.contains('button', '切换音量').click();
  cy.get('.voice-glow-card').should('contain.text', '音量：0.8');
  cy.contains('button', '切换处理状态').click();
  cy.get('.sd-voice-glow').should('have.attr', 'data-processing');
});
