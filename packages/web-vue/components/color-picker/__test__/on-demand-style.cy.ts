import { mount } from 'cypress/vue';

import ColorPicker from '../index';
import '../style';

describe('ColorPicker on-demand styles', () => {
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

  it('styles its mode buttons with only the component style entry', () => {
    mount(ColorPicker, {
      props: { hideTrigger: true, colorModes: ['monochrome', 'linear-gradient'] },
    });
    cy.get('.sd-radio-group-button').should('have.css', 'display', 'flex');
  });
});
