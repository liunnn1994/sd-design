import { mount } from 'cypress/vue';

import Link from '../index';
import '../style';

describe('Link on-demand styles', () => {
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

  it('constrains default ellipsis content with only the component style entry', () => {
    mount(Link, { slots: { default: () => 'Content' } });
    cy.get('.sd-ellipsis').should('have.css', 'max-width', '100%');
  });

  it('styles the icon tooltip with only the component style entry', () => {
    mount(Link, { props: { icon: true, iconTooltip: 'Link information' } });
    cy.get('.sd-link-icon').trigger('mouseenter');
    cy.get('.sd-tooltip-content').should('have.css', 'padding-left', '12px');
  });
});
