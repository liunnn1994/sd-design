import { checkComponentDocs } from './docs-contract';

describe('React Tree documentation', () => {
  it('documents shared tree scenes, drag cursors and framework navigation', () => {
    checkComponentDocs('tree');
    cy.contains('p', '按住可拖拽节点的标题').should('contain.text', 'grabbing');
  });
});
