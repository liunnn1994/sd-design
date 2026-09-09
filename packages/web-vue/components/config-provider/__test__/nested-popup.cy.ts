import { defineComponent, h, ref } from 'vue';

import Trigger from '../../trigger';
import ThemeProvider from '../theme-provider.vue';

describe('ThemeProvider nested popup inheritance', () => {
  for (const childTheme of ['empty', 'partial', 'override']) {
    it(`inherits parent theme with ${childTheme} child configuration`, () => {
      cy.mount(
        defineComponent({
          setup() {
            const changed = ref(false);
            return () =>
              h('div', [
                h(
                  'button',
                  {
                    onClick: () => {
                      changed.value = true;
                    },
                  },
                  'Change parent',
                ),
                h(
                  ThemeProvider,
                  {
                    themeMode: changed.value ? 'light' : 'dark',
                    theme: { tokens: { primary6: changed.value ? '40,50,60' : '10,20,30' } },
                  },
                  {
                    default: () =>
                      h(
                        ThemeProvider,
                        {
                          themeMode: childTheme === 'override' ? 'light' : undefined,
                          theme:
                            childTheme === 'empty'
                              ? undefined
                              : {
                                  tokens:
                                    childTheme === 'override'
                                      ? { primary6: '91,92,93', success6: '70,80,90' }
                                      : { success6: '70,80,90' },
                                },
                        },
                        {
                          default: () =>
                            h(
                              Trigger,
                              { defaultPopupVisible: true },
                              {
                                default: () => h('button', 'Open'),
                                content: () => h('span', { id: 'nested-theme-content' }, 'Popup'),
                              },
                            ),
                        },
                      ),
                  },
                ),
              ]);
          },
        }),
      );
      cy.get('#nested-theme-content').closest('.sd-theme-popup-container').as('popup');
      cy.get('@popup').should(
        'have.attr',
        'sd-theme',
        childTheme === 'override' ? 'light' : 'dark',
      );
      cy.get('@popup').should(($popup) => {
        expect(getComputedStyle($popup[0]).getPropertyValue('--primary-6').trim()).to.equal(
          childTheme === 'override' ? '91,92,93' : '10,20,30',
        );
        if (childTheme !== 'empty')
          expect(getComputedStyle($popup[0]).getPropertyValue('--success-6').trim()).to.equal(
            '70,80,90',
          );
      });
      cy.contains('button', 'Change parent').click();
      cy.get('@popup').should('have.attr', 'sd-theme', 'light');
      cy.get('@popup').should(($popup) => {
        expect(getComputedStyle($popup[0]).getPropertyValue('--primary-6').trim()).to.equal(
          childTheme === 'override' ? '91,92,93' : '40,50,60',
        );
      });
    });
  }
});
