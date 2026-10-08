import { mount } from 'cypress/vue';

import type { TourExpose } from '../types';

import Tour from '../index';
import '../style';

describe('Tour on-demand styles', () => {
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
  it('includes upstream layout and SD Design button and popup tokens', () => {
    mount(Tour, { props: { animate: false, steps: [{ popover: { title: '欢迎' } }] } }).then(
      ({ wrapper }) => (wrapper.vm as TourExpose).drive(),
    );
    cy.get('.driver-popover').should('have.css', 'position', 'fixed');
    cy.get('.driver-popover-next-btn').should('have.css', 'height', '28px');
    cy.get('.driver-popover').invoke('css', '--component-tour-color-bg', 'rgb(20, 30, 40)');
    cy.get('.driver-popover').should('have.css', 'background-color', 'rgb(20, 30, 40)');
    cy.get('.driver-popover-next-btn').click();
    cy.get('.driver-popover').should('not.exist');
  });
});
