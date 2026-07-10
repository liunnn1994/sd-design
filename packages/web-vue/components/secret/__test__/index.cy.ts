import Secret from '../index';

describe('Secret', () => {
  it('renders hidden content by default', () => {
    cy.mount(Secret, { props: { text: 'AKIAIOSFODNN7EXAMPLE' } });
    cy.get('.sd-secret-placeholder').should('have.text', '********');
    cy.get('.sd-copy').should('exist');
  });

  it('toggles visible state in uncontrolled mode', () => {
    cy.mount(Secret, { props: { text: 'db-password-prod-2026' } });
    cy.get('.sd-secret-trigger').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:visible')).to.deep.equal([[true]]);
    });
    cy.get('.sd-secret-placeholder').should('not.exist');
    cy.contains('db-password-prod-2026').should('exist');
  });

  it('respects visible and showCopy props', () => {
    cy.mount(Secret, { props: { text: 'visible-secret', visible: true, showCopy: false } });
    cy.get('.sd-secret-placeholder').should('not.exist');
    cy.contains('visible-secret').should('exist');
    cy.get('.sd-copy').should('not.exist');
  });

  it('renders custom hidden text', () => {
    cy.mount(Secret, { props: { text: '18812345678', hiddenText: '手机号已隐藏' } });
    cy.get('.sd-secret-placeholder').should('have.text', '手机号已隐藏');
  });
});
