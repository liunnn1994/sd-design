import Split from '../index';

describe('Split initially hidden', () => {
  for (const [defaultSize, expectedSize] of [
    [0.5, 0.525],
    ['200px', '210px'],
  ] as const) {
    it(`preserves ${defaultSize} until the container can be measured`, () => {
      const update = cy.spy().as('update');
      cy.mount(Split, {
        props: { defaultSize, 'onUpdate:size': update },
        attrs: { style: 'display:none;width:400px;height:200px' },
      });

      cy.get('.sd-split').should('not.be.visible');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ style: 'width:400px;height:200px' }));
      cy.get('[role="separator"]').should('be.visible').focus().type('{rightarrow}');
      cy.get('@update').should('have.been.calledOnceWith', expectedSize);
    });
  }
});
