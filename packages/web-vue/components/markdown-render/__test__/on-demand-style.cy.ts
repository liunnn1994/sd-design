import { mount } from 'cypress/vue';

import MarkdownRender from '../index';
import '../style';

describe('MarkdownRender on-demand styles', () => {
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

  it('styles the nested heading editor with only the component style entry', () => {
    mount(MarkdownRender, {
      props: {
        nodes: [
          {
            type: 'heading',
            level: 1,
            attrs: { editable: true, editing: true },
            children: [{ type: 'text', content: 'Heading', raw: 'Heading' }],
            raw: '# Heading',
          },
        ],
        final: true,
      },
    });
    cy.get('.sd-input-wrapper').should(($input) => {
      expect(parseFloat(getComputedStyle($input[0]).height)).to.be.closeTo(32, 0.1);
    });
  });
});
