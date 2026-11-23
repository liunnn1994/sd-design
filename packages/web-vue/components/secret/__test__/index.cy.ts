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
    cy.get('.sd-secret-trigger').should('have.attr', 'aria-pressed', 'true').click();
    cy.get('.sd-secret-placeholder').should('exist');
    cy.get('.sd-secret-trigger').should('have.attr', 'aria-pressed', 'false');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:visible')).to.deep.equal([[true], [false]]);
    });
  });

  it('respects visible and showCopy props', () => {
    cy.mount(Secret, { props: { text: 'visible-secret', visible: true, showCopy: false } });
    cy.get('.sd-secret-placeholder').should('not.exist');
    cy.contains('visible-secret').should('exist');
    cy.get('.sd-copy').should('not.exist');
  });

  it('copies masked text and requests a keyboard reveal until the controlled value changes', () => {
    const update = cy.spy();
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').resolves().as('copyWrite');
    });
    cy.mount(Secret, {
      props: { 'text': 'example masked value', 'visible': false, 'onUpdate:visible': update },
    });
    cy.get('.sd-secret').should('not.contain.text', 'example masked value');
    cy.get('.sd-copy').click();
    cy.get('@copyWrite').should('have.been.calledOnceWith', 'example masked value');
    cy.get('.sd-secret-trigger').focus().should('be.focused');
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.wrap(update).should('have.been.calledOnceWith', true);
    cy.get('.sd-secret-trigger').should('have.attr', 'aria-pressed', 'false');
    cy.get('.sd-secret-placeholder').should('be.visible');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ visible: true }));
    cy.get('.sd-secret-trigger').should('have.attr', 'aria-pressed', 'true');
    cy.get('.sd-secret').should('contain.text', 'example masked value');
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
