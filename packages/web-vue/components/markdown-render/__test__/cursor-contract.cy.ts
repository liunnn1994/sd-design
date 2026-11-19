import type { NodeRendererTypewriter } from 'markstream-vue';

import { h, ref } from 'vue';

import MarkdownRender from '..';

const control = (name: string) => cy.contains('button', new RegExp(`^${name}$`)).click();
const mountCursor = (
  initialMode: NodeRendererTypewriter,
  {
    initialContent = 'A **bold** opening followed by ordinary text that wraps across several lines. 最后的文字 tail',
    fragment = false,
  } = {},
) =>
  cy.mount(
    {
      setup() {
        const content = ref(initialContent);
        const mode = ref(initialMode);
        const final = ref(false);
        const supplied = ref(false);
        return () =>
          h('div', [
            h(
              'button',
              {
                onClick: () => {
                  content.value += ' continued';
                },
              },
              'Append',
            ),
            h(
              'button',
              {
                onClick: () => {
                  content.value += '\n\nNew paragraph';
                },
              },
              'Paragraph',
            ),
            h(
              'button',
              {
                onClick: () => {
                  mode.value = 'precise';
                },
              },
              'Precise',
            ),
            h(
              'button',
              {
                onClick: () => {
                  content.value += '\n\n```txt\nHeavy code\n```';
                },
              },
              'Code tail',
            ),
            h(
              'button',
              {
                onClick: () => {
                  supplied.value = !supplied.value;
                },
              },
              'Toggle nodes',
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
              typewriter: mode.value,
              final: final.value,
              nodes: supplied.value
                ? [
                    {
                      type: 'paragraph',
                      raw: '',
                      children: [{ type: 'text', content: 'Supplied', raw: '' }],
                    },
                  ]
                : undefined,
              smoothStreaming: false,
              fade: false,
              renderCodeBlocksAsPre: true,
              batchRendering: false,
              deferNodesUntilVisible: false,
              nodeVirtual: false,
              renderAsFragment: fragment,
              style: { width: '280px', padding: '10px', border: '1px solid black' },
            }),
          ]);
      },
    },
    { global: { stubs: { transition: false } } },
  );
const geometry = (tail: string) =>
  cy.get('.markdown-renderer').should(($root) => {
    const root = $root[0];
    const cursor = root.querySelector<HTMLElement>('.typewriter-cursor')!;
    expect(cursor, `cursor for "${tail}"`).not.to.equal(null);
    expect(getComputedStyle(cursor).visibility).to.equal('visible');
    const paragraph = Array.from(root.querySelectorAll('[data-node-type="paragraph"]')).at(-1);
    expect(paragraph?.textContent).to.include(tail);
    const walker = root.ownerDocument.createTreeWalker(paragraph!, NodeFilter.SHOW_TEXT);
    let last: Text | undefined;
    while (walker.nextNode())
      if (walker.currentNode.textContent?.trim()) last = walker.currentNode as Text;
    const range = root.ownerDocument.createRange();
    range.setStart(last!, last!.length - 1);
    range.setEnd(last!, last!.length);
    const rects = range.getClientRects();
    const rect = rects[rects.length - 1];
    const bounds = root.getBoundingClientRect();
    const values = cursor.style.transform.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
    expect(values[0], `cursor x for "${tail}"`).to.be.closeTo(
      Math.max(0, rect.right - bounds.left + root.scrollLeft),
      2,
    );
    expect(values[1], `cursor y for "${tail}"`).to.be.closeTo(
      Math.max(0, rect.top - bounds.top + root.scrollTop),
      2,
    );
  });
describe('Markdown typewriter cursor contracts', () => {
  it('uses a simple text pseudo cursor and switches to native Range positioning', () => {
    mountCursor('simple');
    cy.get('.typewriter-simple-cursor-target').should('have.length', 1);
    control('Paragraph');
    cy.get('.typewriter-simple-cursor-target')
      .should('have.length', 1)
      .and('have.text', 'New paragraph');
    control('Precise');
    cy.get('.typewriter-simple-cursor-target').should('not.exist');
    geometry('New paragraph');
    control('Append');
    geometry('New paragraph continued');
    control('Finish');
    cy.get('.typewriter-cursor').should('not.exist');
  });
  it('normalizes true to precise and suppresses heavy tails and supplied nodes', () => {
    // The separate expiry test owns the idle timeout; keep this cursor active while checking layout.
    cy.clock(undefined, ['setTimeout', 'clearTimeout']);
    mountCursor(true, { initialContent: 'Plain text tail' });
    geometry('Plain text tail');
    control('Code tail');
    cy.get('[data-node-type="code_block"]').should('contain.text', 'Heavy code');
    cy.get('.typewriter-cursor').should('not.exist');
    control('Paragraph');
    geometry('New paragraph');
    control('Toggle nodes');
    cy.get('.markdown-renderer').should('have.text', 'Supplied');
    cy.get('.typewriter-cursor').should('not.exist');
  });
  it('expires after three seconds and restarts on ordinary appended text', () => {
    mountCursor('simple');
    cy.get('.typewriter-simple-cursor-target').should('have.length', 1);
    cy.get('.typewriter-simple-cursor-target', { timeout: 4500 }).should('not.exist');
    control('Append');
    cy.get('.typewriter-simple-cursor-target').should('have.length', 1);
  });
  it('does not add cursors to fragment renderers', () => {
    mountCursor('precise', { fragment: true });
    cy.get('.text-node').should('exist');
    cy.get('.typewriter-cursor, .typewriter-simple-cursor-target').should('not.exist');
  });
});
