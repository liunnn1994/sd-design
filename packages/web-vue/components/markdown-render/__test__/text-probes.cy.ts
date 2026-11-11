import type { BaseNode } from 'markstream-vue';

import { h, ref } from 'vue';

import { getMarkdownStaticHeight } from '@sdata/web-core/markdown/fallback-height';
import { readMarkdownTextFontProfile } from '@sdata/web-core/markdown/text-height';

import MarkdownRender from '..';
import { markdownProbeNodes } from '../../../../web-core/tests/fixtures/markdown-probe-nodes';
import { provideMarkdownComponents } from '../context';

describe('Markdown native text measurement probes', () => {
  for (const viewportWidth of [1000, 1280]) {
    it('captures locked Vue text estimates for width, font and custom paragraph changes', () => {
      cy.viewport(viewportWidth, 660);
      cy.window().then((window) => {
        cy.stub(window, 'requestIdleCallback').returns(1);
        cy.stub(window, 'cancelIdleCallback');
      });
      const captured: Record<string, number[]> = {};
      cy.mount({
        setup() {
          const width = ref(600),
            monospace = ref(false),
            custom = ref(false);
          const customParagraph = () => h('div', 'Custom paragraph');
          provideMarkdownComponents(
            {
              'probe-fixture': () => h('div', { style: { height: '80px' } }, 'Measured'),
              get 'paragraph'() {
                return custom.value ? customParagraph : undefined;
              },
            },
            () => undefined,
          );
          return () =>
            h('div', [
              h(
                'button',
                {
                  onClick: () => {
                    width.value = width.value === 600 ? 320 : 600;
                  },
                },
                'Resize',
              ),
              h(
                'button',
                {
                  onClick: () => {
                    width.value = 605;
                  },
                },
                'Resize within bucket',
              ),
              h(
                'button',
                {
                  onClick: () => {
                    monospace.value = !monospace.value;
                  },
                },
                'Change font',
              ),
              h(
                'button',
                {
                  onClick: () => {
                    custom.value = !custom.value;
                  },
                },
                'Custom paragraph',
              ),
              h('div', { style: { width: `${width.value}px`, height: '1px', overflow: 'auto' } }, [
                h(MarkdownRender, {
                  class: 'probe-renderer',
                  style: { fontFamily: monospace.value ? 'Courier New' : 'Arial' },
                  nodes: markdownProbeNodes as unknown as BaseNode[],
                  final: true,
                  fade: false,
                  smoothStreaming: false,
                  nodeVirtual: false,
                  batchRendering: false,
                  initialRenderBatchSize: 1,
                  viewportPriorityOptions: { rootMargin: '0px' },
                  virtualScroll: {
                    enabled: true,
                    sessionKey: 'probe',
                    measurementKey: monospace.value ? 'monospace' : 'arial',
                  },
                }),
              ]),
            ]);
        },
      });
      cy.get('.height-estimation-probes')
        .should('have.attr', 'aria-hidden', 'true')
        .and('not.be.visible');
      cy.get('.height-estimation-probes > [data-probe]').should('have.length', 9);
      cy.get('.node-slot > .node-content').should('have.length', 1);
      cy.get('.height-estimation-probes > [data-probe]').then(($nodes) =>
        cy.writeFile(
          '../../.local/markdown-probe-vue-profile.json',
          [...$nodes].map((node) => ({
            probe: node.dataset.probe,
            profile: readMarkdownTextFontProfile(
              node,
              node.querySelector<HTMLElement>('p,h1,h2,h3,h4,h5,h6'),
            ),
            html: node.innerHTML,
          })),
        ),
      );
      // Wait for the actual lazy text-layout module to replace the static paragraph estimate.
      cy.get('.node-slot[data-node-index="1"] > .node-placeholder').should(($node) =>
        expect($node.height()).not.to.equal(getMarkdownStaticHeight(markdownProbeNodes[1], 585)),
      );
      const capture = (name: string) =>
        cy.get('.probe-renderer > .node-slot > .node-placeholder').then(($nodes) => {
          captured[name] = [...$nodes].map((node) => Number.parseFloat(node.style.height));
        });
      capture('wide');
      cy.contains('button', /^Resize$/).click();
      cy.get('.height-estimation-probes').should('have.css', 'width', '305px');
      capture('narrow');
      cy.contains('button', /^Resize$/).click();
      cy.contains('button', 'Resize within bucket').click();
      cy.get('.height-estimation-probes').should('have.css', 'width', '590px');
      capture('withinBucket');
      cy.contains('button', 'Change font').click();
      cy.get('.height-estimation-probes .paragraph-node')
        .first()
        .should(($node) => expect($node.css('font-family')).to.include('Courier New'));
      capture('monospace');
      cy.contains('button', 'Custom paragraph').click();
      capture('custom');
      cy.then(() => {
        expect(captured.wide).to.have.length(9);
        expect(captured.narrow[0]).to.be.greaterThan(captured.wide[0]);
        expect(captured.withinBucket.at(-1)).to.be.lessThan(captured.wide.at(-1)!);
      });
      cy.writeFile(`../../.local/markdown-probe-vue-heights-${viewportWidth}.json`, captured);
    });
  }
  for (const width of [1000, 1280])
    for (const ordered of [false, true]) {
      it(`uses the locked ${ordered ? 'ordered' : 'unordered'} list spacing at ${width}px`, () => {
        cy.viewport(width, 660);
        cy.mount(() =>
          h('div', { style: { width: '600px' } }, [
            h(MarkdownRender, {
              class: 'probe-renderer',
              style: { fontFamily: 'Arial' },
              nodes: [{ ...markdownProbeNodes[5], ordered }] as unknown as BaseNode[],
              final: true,
              fade: false,
              nodeVirtual: false,
              batchRendering: false,
              deferNodesUntilVisible: false,
            }),
          ]),
        );
        cy.get('.probe-renderer .list-node')
          .should('have.length', 1)
          .should(($list) => {
            const mobileUnordered = width === 1000 && !ordered;
            expect(Number.parseFloat($list.css('margin-top'))).to.be.closeTo(
              mobileUnordered ? (14 * 4) / 3 : 14,
              0.02,
            );
            expect(Number.parseFloat($list.css('padding-left'))).to.be.closeTo(
              mobileUnordered ? (14 * 14) / 9 : 12,
              0.02,
            );
          });
      });
    }
});
