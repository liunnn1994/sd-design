import { h, ref } from 'vue';

import MarkdownRender from '..';

const initial = 'An ordinary paragraph '.repeat(5);
const smoothOptions = {
  minCharsPerSecond: 1e9,
  maxCharsPerSecond: 1e9,
  startDelayMs: 0,
  targetLatencyMs: 1,
  maxCharsPerCommit: 10000,
  flushOnFinish: true,
};
describe('Markdown streaming parse coalescing contract', () => {
  it('holds ordinary text but commits a heading boundary and all queued content', () => {
    cy.mount({
      setup() {
        const content = ref(initial);
        return () =>
          h('div', [
            h(
              'button',
              {
                onClick: () => {
                  content.value += ' alpha';
                },
              },
              'Append',
            ),
            h(
              'button',
              {
                onClick: () => {
                  content.value += '\n\n## Boundary';
                },
              },
              'Heading',
            ),
            h(MarkdownRender, {
              content: content.value,
              final: false,
              smoothStreaming: true,
              smoothStreamingOptions: smoothOptions,
              parseCoalesceMs: 10000,
              batchRendering: false,
              deferNodesUntilVisible: false,
            }),
          ]);
      },
    });
    cy.get('.markdown-renderer').should('contain.text', 'An ordinary paragraph');
    cy.contains('button', 'Append').click();
    cy.get('.markdown-renderer').should('not.contain.text', 'alpha');
    cy.contains('button', 'Heading').click();
    cy.get('.markdown-renderer h2').should('have.text', 'Boundary');
    cy.get('.markdown-renderer').should('contain.text', 'alpha');
  });
  it('commits pending plain text when the source becomes final', () => {
    cy.mount({
      setup() {
        const content = ref(initial);
        const final = ref(false);
        return () =>
          h('div', [
            h(
              'button',
              {
                onClick: () => {
                  content.value += ' alpha';
                },
              },
              'Append',
            ),
            h(
              'button',
              {
                onClick: () => {
                  final.value = true;
                },
              },
              'Finish',
            ),
            h(MarkdownRender, {
              content: content.value,
              final: final.value,
              smoothStreaming: true,
              smoothStreamingOptions: smoothOptions,
              parseCoalesceMs: 10000,
              batchRendering: false,
              deferNodesUntilVisible: false,
            }),
          ]);
      },
    });
    cy.get('.markdown-renderer').should('contain.text', 'An ordinary paragraph');
    cy.contains('button', 'Append').click();
    cy.get('.markdown-renderer').should('not.contain.text', 'alpha');
    cy.contains('button', 'Finish').click();
    cy.get('.markdown-renderer').should('contain.text', 'alpha');
  });
});
