import { mount } from 'cypress/vue';

import FilePreviewer from '../index';
import '../style';

describe('FilePreviewer on-demand styles', () => {
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

  it('styles the image preview overlay with only the component style entry', () => {
    mount(FilePreviewer, {
      props: {
        src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        defaultVisible: true,
      },
    });
    cy.get('.sd-image-preview').should('have.css', 'position', 'fixed');
    cy.get('.sd-image-preview-toolbar').should('have.css', 'display', 'flex');
  });
});
