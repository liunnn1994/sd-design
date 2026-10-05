import { mount } from 'cypress/vue';

import AutoTooltip from '../auto-tooltip/auto-tooltip.vue';
import InputLabel from '../input-label/input-label.vue';
import '../auto-tooltip/style';
import '../input-label/style';

describe('Internal component on-demand styles', () => {
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

  it('retains the ellipsis width limit in AutoTooltip', () => {
    mount(AutoTooltip, { slots: { default: 'Tooltip text' } });
    cy.get('.sd-auto-tooltip').should('have.css', 'max-width', '100%');
  });

  it('retains the ellipsis width limit in InputLabel', () => {
    mount(InputLabel, {
      props: { modelValue: { value: 'value', label: 'Label text', closable: false } },
    });
    cy.get('.sd-input-label-value > .sd-ellipsis').should('have.css', 'max-width', '100%');
  });
});
