import { defineComponent, h, ref } from 'vue';

import List from '../../list';
import Spin from '../../spin';
import ConfigProvider from '../index';

describe('ConfigProvider dynamic slots', () => {
  for (const slot of ['empty', 'loading'] as const) {
    it(`updates an already mounted consumer when the ${slot} slot changes`, () => {
      cy.mount(
        defineComponent({
          setup() {
            const visible = ref(false);
            const consumer = h(slot === 'empty' ? List : Spin);
            return () =>
              h('div', [
                h(
                  'button',
                  {
                    onClick: () => {
                      visible.value = !visible.value;
                    },
                  },
                  'Toggle',
                ),
                h(
                  ConfigProvider,
                  {},
                  {
                    default: () => consumer,
                    ...(visible.value
                      ? { [slot]: () => h('span', { 'data-testid': 'dynamic-slot' }, 'Custom') }
                      : {}),
                  },
                ),
              ]);
          },
        }),
      );
      cy.get('[data-testid="dynamic-slot"]').should('not.exist');
      cy.contains('button', 'Toggle').click();
      cy.get('[data-testid="dynamic-slot"]').should('have.text', 'Custom');
      cy.contains('button', 'Toggle').click();
      cy.get('[data-testid="dynamic-slot"]').should('not.exist');
    });
  }
});
