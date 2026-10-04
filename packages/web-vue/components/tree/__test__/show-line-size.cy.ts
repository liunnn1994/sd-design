import Tree from '../index';

describe('Tree connection line sizes', () => {
  for (const [size, height] of [
    ['mini', 24],
    ['small', 28],
    ['medium', 32],
    ['large', 36],
  ] as const) {
    it(`aligns the ${size} leaf and ancestor connection lines with the switcher`, () => {
      cy.mount(Tree, {
        props: {
          size,
          showLine: true,
          animation: false,
          data: [
            {
              key: 'parent',
              title: 'Parent',
              children: [
                { key: 'first', title: 'First' },
                { key: 'last', title: 'Last' },
              ],
            },
            { key: 'sibling', title: 'Sibling' },
          ],
        },
      });
      cy.get('[data-key="first"] .sd-tree-node-switcher').should(
        'have.css',
        'height',
        `${height}px`,
      );
      cy.get('[data-key="first"] .sd-tree-node-indent').should(($indent) => {
        const win = $indent[0].ownerDocument.defaultView!;
        const leafLine = win.getComputedStyle($indent[0], '::after');
        const ancestorLine = win.getComputedStyle(
          $indent.find('.sd-tree-node-indent-block')[0],
          '::before',
        );
        expect(leafLine.content).to.equal('""');
        expect(ancestorLine.content).to.equal('""');
        expect(leafLine.top).to.equal(`${height / 2 + 7 + 4}px`);
        expect(leafLine.bottom).to.equal(`${-(height / 2 - 7 - 4)}px`);
        expect(ancestorLine.top).to.equal(`${4 - (height / 2 - 7)}px`);
        expect(ancestorLine.bottom).to.equal(`${-(height / 2 - 7 - 4)}px`);
      });
    });
  }
});
