import { h } from 'vue';

import Anchor, { AnchorLink } from '../index';
import '../style';

describe('Anchor layout', () => {
  let disabledSheets: CSSStyleSheet[] = [];

  afterEach(() => {
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('lays out horizontal links in one row and restores vertical layout when changed', () => {
    cy.mount(Anchor, {
      props: { direction: 'horizontal', changeHash: false },
      slots: {
        default: () => [
          h(AnchorLink, { href: '#first', title: 'First' }),
          h(AnchorLink, { href: '#second', title: 'Second' }),
        ],
      },
    });
    cy.get('.sd-anchor-link').should(($links) => {
      const first = $links[0].getBoundingClientRect();
      const second = $links[1].getBoundingClientRect();
      expect(second.top).to.equal(first.top);
      expect(second.left).to.be.greaterThan(first.right);
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ direction: 'vertical' }));
    cy.get('.sd-anchor-link').should(($links) => {
      expect($links[1].getBoundingClientRect().top).to.be.greaterThan(
        $links[0].getBoundingClientRect().top,
      );
    });
  });

  it('loads the affix stacking style through the anchor style entry', () => {
    cy.document().then((doc) => {
      for (const sheet of Array.from(doc.styleSheets)) {
        const id = (sheet.ownerNode as HTMLElement | null)?.getAttribute('data-vite-dev-id');
        if (id?.endsWith('/components/index.scss') && !sheet.disabled) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    });
    cy.mount(Anchor, {
      props: { affix: true, offsetTop: 100 },
      slots: { default: () => h(AnchorLink, { href: '#first', title: 'First' }) },
    });
    cy.get('.sd-affix').should('have.css', 'z-index', '999');
  });
});
