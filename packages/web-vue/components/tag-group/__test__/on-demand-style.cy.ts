import { mount } from 'cypress/vue';

import TagGroup from '../index';
import '../style';

describe('TagGroup on-demand styles', () => {
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

  it('includes the default tag styles', () => {
    mount(TagGroup, { props: { options: ['one', 'two'], maxCount: 1 } });
    cy.get('.sd-tag-group-item-content.sd-tag').should('have.css', 'height', '24px');
  });

  it('includes the overflow popover styles', () => {
    mount(TagGroup, { props: { options: ['one', 'two'], maxCount: 1 } });
    cy.get('.sd-tag-group-counter-content').trigger('mouseenter');
    cy.get('.sd-popover-popup-content').should('have.css', 'padding-left', '16px');
  });
});
