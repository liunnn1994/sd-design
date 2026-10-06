import { startDrag, moveDrag } from '../../../cypress/support/drag-sort';
import Tree from '../tree.vue';

const data = Array.from({ length: 200 }, (_, key) => ({ key, title: `Node ${key}` }));

describe('Tree drag sorting boundaries', () => {
  it('drops between nodes in a scrolled virtual list with numeric keys', () => {
    cy.mount(Tree, {
      props: {
        data,
        draggable: true,
        virtualListProps: { height: 240, itemSize: 40 },
      },
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.vm.scrollIntoView({ index: 50, align: 'top' }));
    cy.get('[data-key="51"]').should('be.visible');
    startDrag('[data-key="51"] .sd-tree-node-title');
    moveDrag('[data-key="53"] .sd-tree-node-title', 0.9);
    cy.get('@vue').should(({ wrapper }) => {
      const drop = wrapper.emitted('drop')?.[0]?.[0];
      expect(drop.dragNode.key).to.equal(51);
      expect(drop.dropNode.key).to.equal(53);
      expect(drop.dropPosition).to.equal(1);
    });
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.vm.scrollIntoView({ index: 199, align: 'bottom' }),
    );
    cy.get('[data-key="199"]').should('be.visible');
  });

  it('survives source recycling during virtual scrolling', () => {
    cy.mount(Tree, {
      props: {
        data,
        draggable: true,
        virtualListProps: { height: 240, itemSize: 40 },
      },
    });
    startDrag('[data-key="1"] .sd-tree-node-title');
    cy.get('@vue').then(({ wrapper }) => wrapper.vm.scrollIntoView({ index: 50, align: 'top' }));
    cy.get('[data-key="51"]').should('be.visible');
    moveDrag('[data-key="52"] .sd-tree-node-title', 0.1);
    cy.get('@vue').should(({ wrapper }) => {
      const drop = wrapper.emitted('drop')?.[0]?.[0];
      expect(drop.dragNode.key).to.equal(1);
      expect(drop.dropNode.key).to.equal(52);
      expect(drop.dropPosition).to.equal(-1);
    });
  });

  it('cancels without dropping and honors per-node draggable settings', () => {
    cy.mount(Tree, { props: { data: data.slice(0, 3), draggable: true } });
    startDrag('[data-key="0"] .sd-tree-node-title');
    cy.document().trigger('keydown', { key: 'Escape' });
    moveDrag('[data-key="2"] .sd-tree-node-title');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('drop')).to.equal(undefined);
      expect(wrapper.emitted('dragEnd')).to.have.length(1);
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ draggable: false }));
    cy.get('[data-tree-draggable]').should('not.exist');
    cy.get('.sd-tree-node-title-draggable').should('not.exist');
  });
});
