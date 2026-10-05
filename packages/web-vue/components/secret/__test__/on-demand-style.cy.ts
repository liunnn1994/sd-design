import { mount } from 'cypress/vue';

import Secret from '../index';
import '../style';

describe('Secret on-demand styles', () => {
  let disabledSheets: CSSStyleSheet[] = [];

  beforeEach(() => {
    cy.document().then((doc) => {
      for (const sheet of Array.from(doc.styleSheets)) {
        const id = (sheet.ownerNode as HTMLElement | null)?.getAttribute('data-vite-dev-id');
        if (id?.endsWith('/components/index.scss') && !sheet.disabled) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    });
  });

  afterEach(() => {
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('styles the revealed ellipsis', () => {
    mount(Secret, { props: { text: 'secret', visible: true } });
    cy.get('.sd-secret-content').should('have.css', 'max-width', '100%');
  });

  it('styles the visibility tooltip', () => {
    mount(Secret, { props: { text: 'secret' } });
    cy.get('.sd-secret-trigger').trigger('mouseenter');
    cy.get('.sd-tooltip-content').should('have.css', 'padding-left', '12px');
  });

  it('styles the copy trigger', () => {
    mount(Secret, { props: { text: 'secret' } });
    cy.get('.sd-copy').should('have.css', 'cursor', 'pointer');
  });
});
