import { mount } from 'cypress/vue';

import Ellipsis from '../index';
import '../style';

describe('Ellipsis on-demand styles', () => {
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

  it('styles its tooltip with only the component style entry', () => {
    mount(Ellipsis, {
      props: { tooltip: { always: true, trigger: 'click' } },
      slots: { default: 'Ellipsis text' },
    });
    cy.get('.sd-ellipsis[data-part="root"]').click();
    cy.get('.sd-tooltip-content').should('have.css', 'padding-left', '12px');
  });
});
