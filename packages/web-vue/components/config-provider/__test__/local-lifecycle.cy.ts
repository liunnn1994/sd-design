import { defineComponent, h, ref } from 'vue';

import ThemeProvider from '../theme-provider.vue';

describe('ThemeProvider local lifecycle', () => {
  it('removes popup containers when local theme configuration is cleared', () => {
    cy.mount(ThemeProvider, {
      props: { themeMode: 'dark', theme: { tokens: { primary6: '12,34,56' } } },
      slots: { default: () => h('span', 'Content') },
    });
    cy.get('.sd-theme-popup-container').should('have.length', 1);
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ themeMode: undefined, theme: undefined }),
    );
    cy.get('.sd-theme-popup-container').should('not.exist');
    cy.get('.sd-theme-provider').should('not.exist');
    cy.contains('span', 'Content').should('be.visible');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ themeMode: 'light' }));
    cy.get('.sd-theme-popup-container')
      .should('have.length', 1)
      .and('have.attr', 'sd-theme', 'light');
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('.sd-theme-popup-container').should('not.exist');
  });

  it('removes stale CSS variables from both local targets', () => {
    cy.mount(ThemeProvider, { props: { theme: { tokens: { primary6: '12,34,56' } } } });
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ theme: { tokens: { success6: '65,43,21' } } }),
    );
    cy.get('.sd-theme-provider, .sd-theme-popup-container').should(($targets) => {
      expect($targets).to.have.length(2);
      for (const target of $targets) {
        expect(target.style.getPropertyValue('--primary-6')).to.equal('');
        expect(target.style.getPropertyValue('--success-6')).to.equal('65,43,21');
      }
    });
  });

  it('unmounts one provider without removing a sibling popup container', () => {
    cy.mount(
      defineComponent({
        setup() {
          const first = ref(true);
          return () =>
            h('div', [
              h(
                'button',
                {
                  onClick: () => {
                    first.value = false;
                  },
                },
                'Remove first',
              ),
              first.value ? h(ThemeProvider, { themeMode: 'dark' }) : null,
              h(ThemeProvider, { themeMode: 'light' }),
            ]);
        },
      }),
    );
    cy.get('.sd-theme-popup-container').should('have.length', 2);
    cy.contains('button', 'Remove first').click();
    cy.get('.sd-theme-popup-container')
      .should('have.length', 1)
      .and('have.attr', 'sd-theme', 'light');
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('.sd-theme-popup-container').should('not.exist');
  });
});
