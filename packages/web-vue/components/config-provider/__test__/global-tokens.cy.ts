import ThemeProvider from '../theme-provider.vue';

describe('ThemeProvider global token restoration', () => {
  afterEach(() => {
    cy.document().then((document) => document.body.style.removeProperty('--primary-6'));
  });

  for (const action of ['unmount', 'remove token'] as const) {
    it(`restores an existing inline token on ${action}`, () => {
      cy.document().then((document) =>
        document.body.style.setProperty('--primary-6', '1,2,3', 'important'),
      );
      cy.mount(ThemeProvider, {
        props: { global: true, theme: { tokens: { primary6: '4,5,6' } } },
      });
      cy.get('body').should(($body) => {
        expect($body[0].style.getPropertyValue('--primary-6')).to.equal('4,5,6');
      });
      cy.get('@vue').then(({ wrapper }) => {
        if (action === 'unmount') wrapper.unmount();
        else return wrapper.setProps({ theme: undefined });
      });
      cy.get('body').should(($body) => {
        expect($body[0].style.getPropertyValue('--primary-6')).to.equal('1,2,3');
        expect($body[0].style.getPropertyPriority('--primary-6')).to.equal('important');
      });
    });
  }
});
