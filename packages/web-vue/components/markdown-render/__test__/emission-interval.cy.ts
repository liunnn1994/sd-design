import type { BaseNode, MarkstreamVirtualMetrics } from 'markstream-vue';

import { h, ref } from 'vue';

import type { MarkdownRenderMethods } from '../types';

import MarkdownRender from '..';
import { provideMarkdownComponents } from '../context';

describe('Markdown emission interval contract', () => {
  for (const mode of ['coalesce', 'force', 'unmount', 'throw-unmount', 'thread']) {
    it(`handles ${mode} notifications with the locked Vue renderer`, () => {
      const events: MarkstreamVirtualMetrics[] = [];
      let failUnmount = false;
      const nodes = Array.from({ length: 10 }, (_, index) => ({
        type: 'emission-fixture',
        raw: String(index),
      })) as unknown as BaseNode[];
      cy.mount({
        setup() {
          const renderer = ref<MarkdownRenderMethods | null>(null),
            narrow = ref(false),
            mounted = ref(true),
            thread = ref('one');
          provideMarkdownComponents(
            { 'emission-fixture': () => h('div', { style: { height: '40px' } }, 'Node') },
            () => undefined,
          );
          return () =>
            h('div', [
              h(
                'button',
                {
                  onClick: () => {
                    thread.value = 'two';
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
                'Resize',
              ),
              h(
                'button',
                {
                  onClick: () => {
                    failUnmount = mode === 'throw-unmount';
                    mounted.value = !mounted.value;
                  },
                },
                'Toggle renderer',
              ),
              h(
                'button',
                {
                  onClick: () => {
                    events.length = 0;
                  },
                },
                'Reset events',
              ),
              h(
                'button',
                {
                  onClick: () => {
                    void renderer.value!.forceMeasure();
                  },
                },
                'Force measure',
              ),
              h(
                'div',
                { style: { width: narrow.value ? '320px' : '480px' } },
                mounted.value
                  ? [
                      h(MarkdownRender, {
                        ref: renderer,
                        nodes,
                        final: false,
                        fade: false,
                        smoothStreaming: false,
                        nodeVirtual: false,
                        batchRendering: false,
                        deferNodesUntilVisible: false,
                        virtualScroll: {
                          enabled: true,
                          sessionKey: 'emissions',
                          threadKey: thread.value,
                          emitIntervalMs: 800,
                          settleMode: 'manual',
                        },
                        onHeightChange: (event) => {
                          events.push(event);
                          if (failUnmount) throw new Error('Unmount callback failure');
                        },
                      }),
                    ]
                  : [],
              ),
            ]);
        },
      });
      cy.wrap(events).should((events) => expect(events.at(-1)?.width).to.equal(480));
      cy.contains('button', 'Reset events').click();
      cy.contains('button', 'Force measure').click();
      cy.wrap(events).should('have.length', 1);
      if (mode === 'thread') {
        cy.contains('button', 'Change thread').click();
        cy.wrap(events).should((events) => expect(events.at(-1)?.threadKey).to.equal('two'));
        return;
      }
      cy.contains('button', 'Resize').click();
      cy.wait(100);
      cy.wrap(events).should('have.length', 1);
      if (mode === 'coalesce') {
        cy.wrap(events).should((events) => expect(events.at(-1)?.width).to.equal(320));
        cy.wrap(events).should('have.length', 2);
      } else {
        cy.contains('button', mode === 'force' ? 'Force measure' : 'Toggle renderer').click();
        cy.wrap(events).should('have.length', 2);
        cy.wrap(events).should((events) => expect(events.at(-1)?.width).to.equal(320));
        cy.wait(850);
        cy.wrap(events).should('have.length', 2);
      }
    });
  }
});
