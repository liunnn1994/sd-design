import { mount } from 'cypress/vue';

import Icon from '../index';
import '../style';

describe('Icon on-demand styles', () => {
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

  it('applies icon dimensions with only the component style entry', () => {
    mount(Icon, { props: { size: 24 }, slots: { default: '<path d="M0 0h10v10H0z" />' } });
    cy.get('svg').should('have.css', 'width', '24px').and('have.css', 'height', '24px');
  });
});
