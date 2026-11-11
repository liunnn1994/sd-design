import type { BaseNode } from 'markstream-vue';

import { defineComponent, h, ref } from 'vue';

import { getMarkdownMeasurementKey } from '@sdata/web-core/markdown/render-options';
import {
  getCompatibleMarkdownHeightCache,
  getMarkdownContentHash,
  getMarkdownNodeSignature,
} from '@sdata/web-core/markdown/virtual-state';

import type { MarkdownRenderMethods } from '../types';

import MarkdownRender from '..';

describe('Markdown virtual-state cross-framework contract', () => {
  it('matches real Vue captured signatures and restores only matching measured nodes', () => {
    const nodes: BaseNode[] = [
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', content: 'Heading', raw: 'Heading' }],
        raw: '## Heading',
      },
      {
        type: 'paragraph',
        children: Array.from({ length: 180 }, (_, index) => ({
          type: 'text',
          content: `${index} `,
          raw: `${index} `,
        })),
        raw: 'Long paragraph',
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', content: 'Last paragraph', raw: 'Last paragraph' }],
        raw: 'Last paragraph',
      },
    ];
    const instance = ref<MarkdownRenderMethods | null>(null);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h('div', { style: { width: '640px' } }, [
            h(MarkdownRender, {
              ref: instance,
              nodes,
              final: true,
              nodeVirtual: false,
              batchRendering: false,
              deferNodesUntilVisible: false,
              virtualScroll: {
                enabled: true,
                sessionKey: 'contract',
                threadKey: 'thread',
                measurementKey: 'layout',
              },
            }),
          ]),
      }),
    );
    cy.get('.node-slot h2.sd-typography').should('have.text', 'Heading');
    cy.then(async () => {
      await instance.value!.settle({ frames: 2, timeoutMs: 2000, flushPendingTimers: true });
      const state = instance.value!.captureVirtualState({
        allowFallbackAnchor: true,
        includeEmptyState: true,
      })!;
      expect(state.heightCache?.length, 'real measured nodes').to.equal(nodes.length);
      expect(state.contentHash).to.equal(getMarkdownContentHash(nodes));
      expect(state.measurementKey).to.equal(
        getMarkdownMeasurementKey({ measurementKey: 'layout', isDark: false }),
      );
      for (const entry of state.heightCache!)
        expect(entry.signature, `node ${entry.index}`).to.equal(
          getMarkdownNodeSignature(nodes[entry.index]),
        );
      const identity = {
        sessionKey: state.sessionKey,
        threadKey: state.threadKey,
        measurementKey: state.measurementKey,
        width: state.width,
        nodes,
      };
      expect(getCompatibleMarkdownHeightCache(identity, state)).to.deep.equal(state.heightCache);
      const changed = nodes.map((node, index) =>
        index === 1 ? { ...node, raw: 'Changed paragraph' } : node,
      );
      expect(
        getCompatibleMarkdownHeightCache({ ...identity, nodes: changed }, state).map(
          (entry) => entry.index,
        ),
      ).to.deep.equal([0, 2]);
      expect(
        getCompatibleMarkdownHeightCache({ ...identity, width: state.width + 64 }, state),
      ).to.deep.equal([]);
    });
  });
});
