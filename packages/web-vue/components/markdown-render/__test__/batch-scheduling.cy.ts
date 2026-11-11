import type { MarkstreamVirtualMetrics } from 'markstream-vue';

import { h, ref } from 'vue';

import MarkdownRender from '..';

function metricsOf(element: HTMLElement) {
  return (
    element as HTMLElement & {
      __vueParentComponent: { exposed: { getVirtualMetrics(): MarkstreamVirtualMetrics } };
    }
  ).__vueParentComponent.exposed.getVirtualMetrics();
}

describe('Markdown idle batch scheduling contract', () => {
  it('prioritizes idle work, preserves append progress and restarts the coordinated batch counter', () => {
    const pending = new Map<number, IdleRequestCallback>();
    let id = 0;
    cy.window().then((window) => {
      cy.stub(window, 'requestIdleCallback').callsFake((callback: IdleRequestCallback) => {
        pending.set(++id, callback);
        return id;
      });
      cy.stub(window, 'cancelIdleCallback').callsFake((key: number) => {
        pending.delete(key);
      });
    });
    cy.mount({
      setup() {
        const count = ref(60);
        const session = ref('one');
        const thread = ref('thread-one');
        const narrow = ref(false);
        return () =>
          h('div', { style: { width: narrow.value ? '240px' : '480px' } }, [
            h(
              'button',
              {
                onClick: () => {
                  count.value += 10;
                },
              },
              'Append nodes',
            ),
            h(
              'button',
              {
                onClick: () => {
                  session.value = 'two';
                },
              },
              'Change session',
            ),
            h(
              'button',
              {
                onClick: () => {
                  thread.value = thread.value === 'thread-one' ? 'thread-two' : 'thread-one';
                },
              },
              'Change thread',
            ),
            h(
              'button',
              {
                onClick: () => {
                  narrow.value = !narrow.value;
                },
              },
              'Resize viewport',
            ),
            h(MarkdownRender, {
              nodes: Array.from({ length: count.value }, (_, index) => ({
                type: 'heading',
                level: 2,
                children: [{ type: 'text', content: `Node ${index}`, raw: '' }],
                raw: '',
              })),
              final: false,
              smoothStreaming: false,
              nodeVirtual: false,
              maxLiveNodes: 0,
              batchRendering: true,
              initialRenderBatchSize: 1,
              renderBatchSize: 10,
              renderBatchDelay: 500,
              deferNodesUntilVisible: false,
              virtualScroll: { enabled: true, sessionKey: session.value, threadKey: thread.value },
            }),
          ]);
      },
    });
    cy.get('.node-slot').should('have.length', 60);
    cy.get('.node-slot > .node-content').should('have.length', 1);
    cy.then(() => {
      expect(pending.size).to.equal(1);
      const [key, callback] = pending.entries().next().value!;
      pending.delete(key);
      callback({ didTimeout: false, timeRemaining: () => 50 });
    });
    cy.get('.node-slot > .node-content').should('have.length', 2);
    cy.contains('button', 'Append nodes').click();
    cy.get('.node-slot').should('have.length', 70);
    cy.get('.node-slot > .node-content').should('have.length', 2);
    cy.contains('button', 'Resize viewport').click();
    cy.get('.markdown-renderer').should(($root) => {
      const metrics = metricsOf($root[0]);
      expect(metrics.width).to.equal($root[0].clientWidth);
      expect(metrics.width).to.equal(240);
      expect(metrics.renderedCount).to.equal(1);
    });
    cy.get('.node-slot > .node-content').should('have.length', 2);
    cy.contains('button', 'Change session').click();
    cy.get('.markdown-renderer').should(($root) => {
      const metrics = metricsOf($root[0]);
      expect(metrics.sessionKey).to.equal('two');
      expect(metrics.renderedCount).to.equal(1);
    });
    // Mounted content survives this reset while its node identity stays the same.
    cy.get('.node-slot > .node-content').should('have.length', 2);
    cy.contains('button', 'Change thread').click();
    cy.get('.node-slot > .node-content').should('have.length', 1);
    cy.contains('button', 'Change thread').click();
    cy.get('.node-slot > .node-content').should('have.length', 1);
  });
});
