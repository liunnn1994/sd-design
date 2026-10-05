import { mount } from 'cypress/vue';

import Tag from '../index';
import '../style';

describe('Tag on-demand styles', () => {
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

  it('includes ellipsis layout styles', () => {
    mount(Tag, { slots: { default: 'label' } });
    cy.get('.sd-tag-text.sd-ellipsis').should('have.css', 'vertical-align', 'bottom');
  });

  it('includes custom tooltip styles', () => {
    mount(Tag, { props: { ellipsis: false, tooltip: 'detail' }, slots: { default: 'label' } });
    cy.get('.sd-tag-text').trigger('mouseenter');
    cy.get('.sd-tooltip-content').should('have.css', 'padding-left', '12px');
  });
});
