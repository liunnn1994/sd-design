import { mount } from 'cypress/vue';

import RichTextEditor from '../index';
import '../style';

describe('RichTextEditor on-demand styles', () => {
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

  it('styles the built-in input node', () => {
    mount(RichTextEditor, {
      props: { defaultValue: [{ key: 'input', name: 'input', value: 'value' }] },
    });
    cy.get('.sd-input-wrapper').should(($input) => {
      expect(parseFloat($input.css('height'))).to.be.closeTo(32, 0.1);
    });
  });

  it('styles the built-in tag node', () => {
    mount(RichTextEditor, {
      props: { defaultValue: [{ key: 'tag', name: 'tag', value: 'tag' }] },
    });
    cy.get('.sd-tag').should('have.css', 'display', 'inline-flex');
  });
});
