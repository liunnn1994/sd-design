import { h } from 'vue';

import { mount } from 'cypress/vue';

import Layout, { LayoutFooter, LayoutSider } from '../index';
import '../style';

describe('Layout styles', () => {
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

  it('styles the built-in scrollbar with only the component style entry', () => {
    mount(LayoutSider, { slots: { default: () => h('div', 'Content') } });
    cy.get('.sd-scrollbar').should('have.css', 'position', 'relative');
  });

  it('styles the temporary drawer with only the component style entry', () => {
    mount(LayoutSider, { props: { temporary: true, collapsed: false } });
    cy.get('.sd-drawer').should('have.css', 'position', 'absolute');
  });

  it('prevents the footer from shrinking in a column layout', () => {
    mount(Layout, { slots: { default: () => h(LayoutFooter, null, () => 'Footer') } });
    cy.get('.sd-layout-footer').should('have.css', 'flex-shrink', '0');
  });

  for (const reverseArrow of [false, true]) {
    it(`positions the zero-width trigger outside the sidebar (reverseArrow=${reverseArrow})`, () => {
      mount(LayoutSider, {
        props: { collapsible: true, collapsed: true, collapsedWidth: 0, reverseArrow },
      });
      cy.get('.sd-layout-sider-zero-width-trigger').should(
        'have.css',
        reverseArrow ? 'inset-inline-start' : 'inset-inline-end',
        '-40px',
      );
    });
  }
});
