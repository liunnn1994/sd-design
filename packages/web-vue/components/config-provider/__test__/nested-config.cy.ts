import { defineComponent, h, ref } from 'vue';

import Button from '../../button';
import ConfigProvider from '../index';

describe('ConfigProvider nested configuration', () => {
  it('updates outer defaults without replacing explicit inner defaults', () => {
    cy.mount(
      defineComponent({
        setup() {
          const small = ref(false);
          return () =>
            h(
              ConfigProvider,
              { size: small.value ? 'mini' : 'medium' },
              {
                default: () => [
                  h(
                    Button,
                    {
                      id: 'outer-button',
                      onClick: () => {
                        small.value = true;
                      },
                    },
                    () => 'Outer',
                  ),
                  h(
                    ConfigProvider,
                    { size: 'large' },
                    {
                      default: () => h(Button, { id: 'inner-button' }, () => 'Inner'),
                    },
                  ),
                ],
              },
            );
        },
      }),
    );
    cy.get('#outer-button').should('have.class', 'sd-btn-size-medium');
    cy.get('#inner-button').should('have.class', 'sd-btn-size-large');
    cy.get('#outer-button').click();
    cy.get('#outer-button').should('have.class', 'sd-btn-size-mini');
    cy.get('#inner-button').should('have.class', 'sd-btn-size-large');
  });
});
