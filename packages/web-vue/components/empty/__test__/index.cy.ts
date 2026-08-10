import { h } from 'vue';

import { configProviderInjectionKey } from '../../config-provider/context';
import Empty from '../index';

describe('Empty', () => {
  it('renders the description and forwards attributes', () => {
    cy.mount(Empty, {
      props: {
        description: 'No data',
      },
      attrs: {
        'data-testid': 'empty',
      },
    });

    cy.get('[data-testid="empty"]').should('have.class', 'sd-empty');
    cy.get('.sd-empty-description').should('have.text', 'No data');
  });

  it('uses the ConfigProvider empty slot when no local image or description is set', () => {
    cy.mount(Empty, {
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            slots: {
              empty: ({ component }: { component: string }) =>
                h('div', { 'data-component': component }, 'Custom empty'),
            },
          },
        },
      },
    });

    cy.contains('[data-component="empty"]', 'Custom empty').should('exist');
    cy.get('.sd-empty').should('not.exist');
  });
});
