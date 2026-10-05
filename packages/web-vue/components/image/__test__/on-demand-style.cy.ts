import { mount } from 'cypress/vue';

import { ImagePreviewAction } from '../index';
import '../style';

describe('Image on-demand styles', () => {
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

  it('styles preview action tooltips with only the component style entry', () => {
    mount(ImagePreviewAction, { props: { name: 'Action' }, slots: { default: 'Action' } });
    cy.get('.sd-image-preview-toolbar-action').trigger('mouseenter');
    cy.get('.sd-tooltip-content').should('have.css', 'padding-left', '12px');
  });
});
