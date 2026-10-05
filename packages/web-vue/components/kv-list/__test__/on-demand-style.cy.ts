import { mount } from 'cypress/vue';

import KvList from '../index';
import '../style';

describe('KvList on-demand styles', () => {
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

  it('styles toolbar buttons and fields with only the component style entry', () => {
    mount(KvList);
    cy.get('.sd-kv-list-toolbar .sd-btn').first().should('have.css', 'height', '28px');
    cy.get('.sd-input-wrapper')
      .first()
      .should(($input) => {
        expect(parseFloat(getComputedStyle($input[0]).height)).to.be.closeTo(32, 0.1);
      });
  });

  it('styles the bulk editor with only the component style entry', () => {
    mount(KvList, { props: { bulkEditable: true } });
    cy.contains('button', '切换到 Bulk 编辑').click();
    cy.get('.sd-kv-list-bulk').should('have.css', 'position', 'relative');
  });
});
