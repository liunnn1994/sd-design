import { h, ref } from 'vue';

import MarkdownRender from '..';
import {
  captureMarkdownDiff,
  compactMarkdownDiffCapture,
  getMarkdownDiffNode,
  markdownDiffScenarios,
  isMarkdownDiffSynchronized,
} from '../../../../web-core/tests/fixtures/markdown-pre-diff';

describe('Markdown locked pre diff contracts', () => {
  const captures: Record<string, ReturnType<typeof captureMarkdownDiff>> = {};
  for (const scenario of Object.keys(
    markdownDiffScenarios,
  ) as (keyof typeof markdownDiffScenarios)[]) {
    it(`captures real Vue ${scenario} diff semantics, rows and resize`, () => {
      cy.viewport(1000, 660);
      const settings = markdownDiffScenarios[scenario];
      cy.mount({
        setup() {
          const narrow = ref(false),
            expanded = ref(false),
            changed = ref(false),
            caseName = ref<'source' | 'numbered' | 'blank'>('source');
          return () =>
            h('div', [
              h(
                'button',
                {
                  onClick: () => {
                    narrow.value = !narrow.value;
                  },
                },
                'Resize',
              ),
              h(
                'button',
                {
                  onClick: () => {
                    expanded.value = !expanded.value;
                  },
                },
                'Expand',
              ),
              h(
                'button',
                {
                  onClick: () => {
                    changed.value = !changed.value;
                  },
                },
                'Change',
              ),
              h(
                'button',
                {
                  onClick: () => {
                    caseName.value = caseName.value === 'source' ? 'numbered' : 'blank';
                  },
                },
                'Number width',
              ),
              h('div', { style: { width: narrow.value ? '320px' : '600px' } }, [
                h(MarkdownRender, {
                  nodes: [getMarkdownDiffNode(caseName.value)],
                  final: true,
                  fade: false,
                  smoothStreaming: false,
                  batchRendering: false,
                  deferNodesUntilVisible: false,
                  nodeVirtual: false,
                  renderCodeBlocksAsPre: true,
                  isDark: scenario === 'dark',
                  codeBlockOptions: {
                    fontFamily: 'Courier New',
                    fontSize: changed.value ? 16 : 14,
                    lineHeight: changed.value ? 26 : 22,
                    ...settings.options,
                  },
                  codeBlockProps: {
                    ...settings.props,
                    ...(expanded.value ? { diffHideUnchangedRegions: false } : {}),
                  },
                }),
              ]),
            ]);
        },
      });
      const capture = (name: string) => {
        cy.get('pre.code-pre-fallback').should(
          'have.attr',
          'data-markstream-code-theme',
          scenario === 'dark' ? 'vitesse-dark' : 'vitesse-light',
        );
        if (['dark', 'split', 'collapsed', 'reserved'].includes(scenario))
          cy.get('pre.code-pre-fallback').should(($pre) =>
            expect(isMarkdownDiffSynchronized($pre[0])).to.equal(true),
          );
        cy.get('pre.code-pre-fallback').then(($pre) => {
          const result = captureMarkdownDiff($pre[0]);
          if (scenario === 'reserved') {
            expect(result.height).to.equal(160);
            expect(result.styles['max-height']).to.equal('500px');
          }
          captures[`${scenario}-${name}`] = result;
        });
      };
      capture('wide');
      cy.contains('button', 'Resize').click();
      capture('narrow');
      cy.contains('button', 'Expand').click();
      capture('expanded');
      cy.contains('button', 'Change').click();
      capture('configured');
      cy.contains('button', 'Number width').click();
      capture('numbered');
      cy.contains('button', 'Number width').click();
      capture('shrunk');
    });
  }
  for (const name of ['patch', 'blank', 'loading'] as const)
    it(`captures Vue ${name} diff metadata`, () => {
      cy.mount(() =>
        h('div', { style: { width: '600px' } }, [
          h(MarkdownRender, {
            nodes: [getMarkdownDiffNode(name)],
            final: name !== 'loading',
            fade: false,
            batchRendering: false,
            deferNodesUntilVisible: false,
            nodeVirtual: false,
            renderCodeBlocksAsPre: true,
            codeBlockOptions: {
              fontFamily: 'Courier New',
              fontSize: 14,
              lineHeight: 22,
              diffStyle: 'unified',
            },
            codeBlockProps: { diffHideUnchangedRegions: true },
          }),
        ]),
      );
      cy.get('pre.code-pre-fallback')
        .should('have.attr', 'data-markstream-code-theme', 'vitesse-light')
        .then(($pre) => {
          captures[name] = captureMarkdownDiff($pre[0]);
        });
    });
  after(() => {
    cy.writeFile('../../.local/markdown-pre-diff-vue-oracle.json', captures);
    cy.writeFile(
      '../../.local/markdown-pre-diff-vue-compact.json',
      Object.fromEntries(
        Object.entries(captures).map(([key, value]) => [key, compactMarkdownDiffCapture(value)]),
      ),
    );
  });
});
