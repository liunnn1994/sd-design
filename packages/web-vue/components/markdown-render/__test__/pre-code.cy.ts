import { h } from 'vue';

import MarkdownRender from '..';
import {
  markdownPreNode,
  markdownPreScenarios,
  markdownPreStyleKeys,
} from '../../../../web-core/tests/fixtures/markdown-pre-node';

describe('Markdown locked pre code rendering', () => {
  it('keeps the open tooltip text until a new hover or focus after copy succeeds', () => {
    let finish: (() => void) | undefined;
    cy.mount(() =>
      h(MarkdownRender, {
        nodes: [markdownPreNode],
        final: true,
        fade: false,
        batchRendering: false,
        deferNodesUntilVisible: false,
        nodeVirtual: false,
        renderCodeBlocksAsPre: true,
        codeBlockProps: {
          clipboardWriter: () =>
            new Promise<void>((resolve) => {
              finish = resolve;
            }),
        },
      }),
    );
    cy.get('button[aria-label="Copy"]').then(() => cy.clock());
    cy.get('button[aria-label="Copy"]').trigger('mouseenter');
    cy.tick(80);
    cy.get('[role="tooltip"]').should('contain.text', 'Copy');
    cy.get('button[aria-label="Copy"]').should('have.attr', 'aria-describedby');
    cy.get('button[aria-label="Copy"]').click();
    cy.then(() => finish!());
    cy.get('button[aria-label="Copied"]').should('exist');
    cy.get('[role="tooltip"]').should('contain.text', 'Copy').and('not.contain.text', 'Copied');
    cy.get('button[aria-label="Copied"]').trigger('mouseleave').trigger('mouseenter');
    cy.tick(80);
    cy.get('[role="tooltip"]').should('contain.text', 'Copied');
    cy.get('button[aria-label="Copied"]').trigger('mouseleave');
    cy.tick(119);
    cy.get('button[aria-label="Copied"]').should('have.attr', 'aria-describedby');
    cy.tick(1);
    cy.get('button[aria-label="Copied"]').should('not.have.attr', 'aria-describedby');
  });
  for (const scenario of markdownPreScenarios) {
    it(`captures actual Vue ${scenario.name} pre geometry and content`, () => {
      cy.mount(() =>
        h('div', { style: { width: '600px' } }, [
          h(MarkdownRender, {
            nodes: [
              {
                ...markdownPreNode,
                raw:
                  scenario.name === 'plain-title'
                    ? '```typescript\ncode\n```'
                    : markdownPreNode.raw,
              },
            ],
            final: true,
            fade: false,
            smoothStreaming: false,
            batchRendering: false,
            deferNodesUntilVisible: false,
            nodeVirtual: false,
            renderCodeBlocksAsPre: true,
            codeBlockOptions: scenario.options,
            codeBlockProps: scenario.props,
            isDark: scenario.dark,
          }),
        ]),
      );
      cy.get('pre.code-pre-fallback')
        .should('have.length', 1)
        .and(
          'have.attr',
          'data-markstream-code-theme',
          scenario.dark ? 'vitesse-dark' : 'vitesse-light',
        )
        .and('contain.text', 'second')
        .then(($pre) => {
          const pre = $pre[0],
            style = pre.ownerDocument.defaultView!.getComputedStyle(pre);
          const header = pre
            .closest('.code-block-container')!
            .querySelector<HTMLElement>('.code-block-header');
          cy.writeFile(`../../.local/markdown-pre-vue-${scenario.name}.json`, {
            styles: Object.fromEntries(
              markdownPreStyleKeys.map((key) => [key, style.getPropertyValue(key)]),
            ),
            height: pre.getBoundingClientRect().height,
            header: header
              ? {
                  height: header.getBoundingClientRect().height,
                  title: header.querySelector('.code-header-title')?.textContent,
                  caption: header.querySelector('.code-header-caption')?.textContent,
                  metrics: [
                    header,
                    ...header.querySelectorAll('.code-header-title,.code-header-caption'),
                  ].map((node) => {
                    const style = node.ownerDocument.defaultView!.getComputedStyle(node);
                    return {
                      class: node.className,
                      height: node.getBoundingClientRect().height,
                      styles: Object.fromEntries(
                        [
                          'line-height',
                          'font-size',
                          'font-family',
                          'color',
                          'background-color',
                          'border-bottom-color',
                          'padding-top',
                          'padding-bottom',
                          'border-bottom-width',
                          'gap',
                          '--ms-leading-body',
                        ].map((key) => [key, style.getPropertyValue(key)]),
                      ),
                    };
                  }),
                }
              : null,
            text: pre.querySelector('code')?.textContent,
            logicalLines: pre.querySelectorAll('.markstream-pre__logical-line').length,
            theme: pre.getAttribute('data-markstream-code-theme'),
          });
        });
    });
  }
  it('waits for the clipboard writer before emitting and resets success feedback', () => {
    let finish: (() => void) | undefined;
    const copy = cy.spy().as('copy'),
      click = cy.spy().as('click');
    const writer = cy
      .stub()
      .callsFake(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      )
      .as('writer');
    cy.mount(() =>
      h(MarkdownRender, {
        nodes: [markdownPreNode],
        final: true,
        fade: false,
        batchRendering: false,
        deferNodesUntilVisible: false,
        nodeVirtual: false,
        renderCodeBlocksAsPre: true,
        codeBlockProps: { clipboardWriter: writer },
        onCopy: copy,
        onClick: click,
      }),
    );
    cy.get('button[aria-label="Copy"]')
      .should('exist')
      .then(() => cy.clock());
    cy.get('button[aria-label="Copy"]').click();
    cy.get('@writer').should('have.been.calledOnceWithExactly', markdownPreNode.code);
    cy.get('@copy').should('not.have.been.called');
    cy.then(() => finish!());
    cy.get('button[aria-label="Copied"]').should('exist');
    cy.get('@copy').should('have.been.calledOnceWithExactly', markdownPreNode.code);
    cy.get('@click').should('have.been.calledOnce');
    cy.tick(1000);
    cy.get('button[aria-label="Copy"]').should('exist');
  });
});
