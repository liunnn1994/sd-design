import { h } from 'vue';

import ConfigProvider from '../../config-provider';
import Switch from '../index';

describe('Switch inherited small size', () => {
  for (const size of ['small', 'mini'] as const) {
    it(`hides text when the provider selects ${size}`, () => {
      cy.mount(ConfigProvider, {
        props: { size },
        slots: {
          default: () => h(Switch, { checkedText: 'On', uncheckedText: 'Off' }),
        },
      });

      cy.get('[role="switch"]').should('have.class', 'sd-switch-small');
      cy.get('.sd-switch-text, .sd-switch-text-holder').should('not.exist');
    });
  }
});
