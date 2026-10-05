import { mount } from 'cypress/vue';

import Modal from '../index';
import '../style';

describe('Modal on-demand styles', () => {
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

  it('styles the title ellipsis with only the component style entry', () => {
    mount(Modal, { props: { visible: true, title: 'Title' } });
    cy.get('.sd-modal-title-text').should('have.css', 'max-width', '100%');
  });
});
