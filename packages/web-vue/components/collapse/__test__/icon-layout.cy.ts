import Collapse, { CollapseItem } from '../index';

describe('Collapse hidden icon layout', () => {
  for (const position of ['left', 'right']) {
    it(`removes reserved ${position} icon space when icons are hidden`, () => {
      cy.mount(Collapse, {
        props: { showExpandIcon: false, expandIconPosition: position },
        global: { components: { CollapseItem } },
        slots: { default: '<CollapseItem key="one" header="Title">Body</CollapseItem>' },
      });
      cy.get('.sd-collapse-item-header').should(($header) => {
        const style = getComputedStyle($header[0]);
        expect(style.paddingLeft).to.equal(style.paddingRight);
      });
    });
  }
});
