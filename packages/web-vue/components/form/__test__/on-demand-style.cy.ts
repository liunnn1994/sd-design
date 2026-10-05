import { h } from 'vue';

import { mount } from 'cypress/vue';

import Form, { FormItem } from '../index';
import '../style';

describe('Form on-demand styles', () => {
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

  it('styles the label tooltip with only the component style entry', () => {
    mount(Form, {
      props: { model: {} },
      slots: {
        default: () => h(FormItem, { label: 'Name', tooltip: 'Field information' }),
      },
    });
    cy.get('.sd-form-item-label-tooltip').trigger('mouseenter');
    cy.get('.sd-tooltip-content').should('have.css', 'padding-left', '12px');
  });
});
