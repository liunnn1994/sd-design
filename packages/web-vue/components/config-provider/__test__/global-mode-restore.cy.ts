import ThemeProvider from '../theme-provider.vue';

describe('ThemeProvider global mode restoration', () => {
  afterEach(() => {
    cy.document().then((document) => document.body.removeAttribute('sd-theme'));
  });

  it('restores the previous body mode when switching from global to local', () => {
    cy.document().then((document) => document.body.setAttribute('sd-theme', 'dark'));
    cy.mount(ThemeProvider, { props: { global: true, themeMode: 'light' } });
    cy.get('body').should('have.attr', 'sd-theme', 'light');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ global: false }));
    cy.get('body').should('have.attr', 'sd-theme', 'dark');
    cy.get('.sd-theme-provider').should('have.attr', 'sd-theme', 'light');
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.unmount();
    });
    cy.get('body').should('have.attr', 'sd-theme', 'dark');
  });
});
