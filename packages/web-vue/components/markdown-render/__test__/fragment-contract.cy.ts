import MarkdownRender from '..';

describe('Markdown fragment rendering contract', () => {
  it('renders completed uncoordinated content without waiting for delayed batches', () => {
    const nodes = Array.from({ length: 60 }, (_, index) => ({
      type: 'heading',
      level: 2,
      children: [{ type: 'text', content: `Heading ${index}`, raw: '' }],
      raw: '',
    }));
    cy.mount(MarkdownRender, {
      props: {
        nodes,
        mode: 'chat',
        final: true,
        nodeVirtual: false,
        maxLiveNodes: 0,
        batchRendering: true,
        initialRenderBatchSize: 1,
        renderBatchSize: 1,
        renderBatchDelay: 10000,
        deferNodesUntilVisible: false,
        viewportPriority: false,
      },
    });
    cy.get('.node-slot h2.sd-typography').should('have.length', 60);
  });
  it('renders every supplied node without virtual slots or delayed batches', () => {
    const nodes = Array.from({ length: 60 }, (_, index) => ({
      type: 'heading',
      level: 2,
      children: [{ type: 'text', content: `Heading ${index}`, raw: '' }],
      raw: '',
    }));
    cy.mount(MarkdownRender, {
      props: {
        nodes,
        final: true,
        renderAsFragment: true,
        nodeVirtual: true,
        maxLiveNodes: 2,
        liveNodeBuffer: 0,
        batchRendering: true,
        initialRenderBatchSize: 1,
        renderBatchSize: 1,
        renderBatchDelay: 10000,
      },
    });
    cy.get('h2.sd-typography').should('have.length', 60);
    cy.get('.markdown-renderer, .node-slot, .node-spacer').should('not.exist');
  });
});
