import { h } from 'vue';

import ConfigProvider from '../../config-provider';
import Avatar from '../index';

describe('Avatar trigger position', () => {
  for (const rtl of [false, true]) {
    it(`keeps the default trigger offset in ${rtl ? 'RTL' : 'LTR'}`, () => {
      cy.mount({
        render: () =>
          h(ConfigProvider, { rtl }, () => h(Avatar, {}, { 'trigger-icon': () => 'Edit' })),
      });
      cy.get('.sd-avatar-trigger-icon-button').should('have.css', rtl ? 'left' : 'right', '-4px');
      cy.get('.sd-avatar-trigger-icon-button').should('have.css', 'bottom', '-4px');
    });

    it(`applies custom trigger offsets in ${rtl ? 'RTL' : 'LTR'}`, () => {
      cy.mount({
        render: () =>
          h(ConfigProvider, { rtl }, () =>
            h(
              Avatar,
              {
                style: {
                  '--component-avatar-spacing-trigger-button-right': '9px',
                  '--component-avatar-spacing-trigger-button-bottom': '7px',
                },
              },
              { 'trigger-icon': () => 'Edit' },
            ),
          ),
      });
      cy.get('.sd-avatar-trigger-icon-button').should('have.css', rtl ? 'left' : 'right', '-9px');
      cy.get('.sd-avatar-trigger-icon-button').should('have.css', 'bottom', '-7px');
    });
  }
});
