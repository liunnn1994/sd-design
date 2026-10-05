import { h } from 'vue';

import { mount } from 'cypress/vue';

import Tabs, { TabPane } from '../index';
import '../style';

describe('Tabs on-demand styles', () => {
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

  it('includes the full-height pane scrollbar styles', () => {
    mount(Tabs, {
      props: { fullHeight: true },
      attrs: { style: 'height: 200px' },
      slots: { default: () => h(TabPane, { key: 'one', title: 'One' }, () => 'Content') },
    });
    cy.get('.sd-tabs-pane-scrollbar.sd-scrollbar').should('have.css', 'position', 'relative');
  });
});
