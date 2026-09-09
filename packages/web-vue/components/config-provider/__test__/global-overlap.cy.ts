import { defineComponent, h, ref } from 'vue';

import ThemeProvider from '../theme-provider.vue';

describe('ThemeProvider overlapping global scopes', () => {
  afterEach(() => {
    cy.document().then((document) => {
      document.body.style.removeProperty('--primary-6');
      document.body.removeAttribute('sd-theme');
    });
  });

  for (const firstRemoved of ['first', 'second'] as const) {
    it(`restores the remaining provider when removing ${firstRemoved} first`, () => {
      cy.document().then((document) => {
        document.body.style.setProperty('--primary-6', '1,2,3', 'important');
        document.body.setAttribute('sd-theme', 'light');
      });
      cy.mount(
        defineComponent({
          setup() {
            const first = ref(true);
            const second = ref(true);
            const firstColor = ref('4,5,6');
            return () =>
              h('div', [
                h(
                  'button',
                  {
                    onClick: () => {
                      firstColor.value = '10,11,12';
                    },
                  },
                  'Update first',
                ),
                h(
                  'button',
                  {
                    onClick: () => {
                      first.value = false;
                    },
                  },
                  'Remove first',
                ),
                h(
                  'button',
                  {
                    onClick: () => {
                      second.value = false;
                    },
                  },
                  'Remove second',
                ),
                first.value
                  ? h(ThemeProvider, {
                      global: true,
                      themeMode: 'dark',
                      theme: { tokens: { primary6: firstColor.value } },
                    })
                  : null,
                second.value
                  ? h(ThemeProvider, {
                      global: true,
                      themeMode: 'light',
                      theme: { tokens: { primary6: '7,8,9' } },
                    })
                  : null,
              ]);
          },
        }),
      );
      cy.get('body').should(($body) => {
        expect($body[0].style.getPropertyValue('--primary-6')).to.equal('7,8,9');
      });
      cy.contains('button', 'Update first').click();
      cy.get('body').should(($body) => {
        expect($body[0].style.getPropertyValue('--primary-6')).to.equal('7,8,9');
        expect($body.attr('sd-theme')).to.equal('light');
      });
      cy.contains('button', `Remove ${firstRemoved}`).click();
      cy.get('body').should(($body) => {
        expect($body[0].style.getPropertyValue('--primary-6')).to.equal(
          firstRemoved === 'first' ? '7,8,9' : '10,11,12',
        );
        expect($body.attr('sd-theme')).to.equal(firstRemoved === 'first' ? 'light' : 'dark');
      });
      cy.contains('button', `Remove ${firstRemoved === 'first' ? 'second' : 'first'}`).click();
      cy.get('body').should(($body) => {
        expect($body[0].style.getPropertyValue('--primary-6')).to.equal('1,2,3');
        expect($body[0].style.getPropertyPriority('--primary-6')).to.equal('important');
        expect($body.attr('sd-theme')).to.equal('light');
      });
    });
  }
});
