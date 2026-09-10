import { h } from 'vue';

import ConfigProvider from '../../config-provider';
import enUS from '../../locale/lang/en-us';
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

  it('localizes the toggle tooltip and accessible name', () => {
    cy.mount(ConfigProvider, {
      props: { locale: enUS },
      slots: { default: () => h(Secret, { text: 'localized-secret', showCopy: false }) },
    });

    cy.get('.sd-secret-trigger')
      .should('have.attr', 'aria-label', 'Show sensitive information')
      .trigger('mouseenter');
    cy.contains('[role="tooltip"]', 'Show sensitive information').should('be.visible');
    cy.get('.sd-secret-trigger').click({ force: true });
    cy.get('.sd-secret-trigger').should('have.attr', 'aria-label', 'Hide sensitive information');
  });
});
