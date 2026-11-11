import { defineComponent, h, provide, ref } from 'vue';

import { MARKSTREAM_NODE_LIFECYCLE_KEY } from 'markstream-vue';

import type { MarkdownRenderMethods } from '..';

import MarkdownRender from '..';
import { provideMarkdownComponents } from '../context';
import MarkdownImage from '../nodes/image.vue';

const mountNested = (fragment: boolean) =>
  cy.mount({
    setup() {
      const lifecycleTrace = ref<Array<[string, string | number]>>([]);
      provide(MARKSTREAM_NODE_LIFECYCLE_KEY, {
        markPending: (key) => {
          lifecycleTrace.value.push(['pending', key]);
        },
        markSettled: (key) => {
          lifecycleTrace.value.push(['settled', key]);
        },
        reportHeight: (key) => {
          lifecycleTrace.value.push(['height', key]);
        },
      });
      const Nested = defineComponent({
        props: { indexKey: [String, Number] },
        setup(props) {
          const mounted = ref(false);
          const imageUrl = `/nested-markdown-image.svg?case=${crypto.randomUUID()}`;
          return () =>
            h('div', { style: { minHeight: '100px' } }, [
              h(
                'button',
                {
                  onClick: () => {
                    mounted.value = !mounted.value;
                  },
                },
                'Toggle child',
              ),
              mounted.value
                ? h(MarkdownRender, {
                    nodes: [
                      {
                        type: 'image',
                        src: imageUrl,
                        alt: 'Nested image',
                        title: null,
                        raw: '',
                      },
                    ],
                    final: true,
                    indexKey: `${props.indexKey}-inner`,
                    renderAsFragment: fragment,
                    batchRendering: false,
                    deferNodesUntilVisible: false,
                    virtualScroll: { enabled: true, sessionKey: 'child' },
                  })
                : null,
            ]);
        },
      });
      provideMarkdownComponents({ fixture_nested: Nested }, () => undefined);
      const renderer = ref<MarkdownRenderMethods | null>(null);
      const metrics = ref('');
      return () =>
        h('div', [
          h(
            'button',
            {
              onClick: async () => {
                metrics.value = '';
                metrics.value = JSON.stringify({
                  ...(await renderer.value!.settle({ frames: 2, timeoutMs: 80 })),
                  lifecycleTrace: lifecycleTrace.value,
                });
              },
            },
            'Settle parent',
          ),
          h('output', metrics.value),
          h(MarkdownRender, {
            ref: renderer,
            nodes: [{ type: 'fixture_nested', raw: '' }],
            final: true,
            indexKey: 'outer',
            batchRendering: false,
            deferNodesUntilVisible: false,
            virtualScroll: { enabled: true, sessionKey: 'parent' },
          }),
        ]);
    },
  });
const metrics = () =>
  cy
    .get('output')
    .invoke('text')
    .should('not.be.empty')
    .then((text) => JSON.parse(text));
const imageResponses = new Set<() => void>();
const releaseImages = () => {
  for (const release of imageResponses) release();
  imageResponses.clear();
};
const image = () =>
  cy.intercept(
    'GET',
    '**/nested-markdown-image.svg*',
    (request) =>
      new Promise<void>((resolve) =>
        imageResponses.add(() => {
          request.reply({
            headers: { 'content-type': 'image/svg+xml' },
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="blue"/></svg>',
          });
          resolve();
        }),
      ),
  );
describe('Markdown nested lifecycle and SD DOM mode contracts', () => {
  afterEach(releaseImages);
  it('retains slots for minimal DOM requests when SD node mappings are installed', () => {
    cy.mount(MarkdownRender, {
      props: {
        content: '## Minimal',
        final: true,
        domMode: 'minimal',
        mode: 'minimal',
        fade: false,
        batchRendering: false,
        deferNodesUntilVisible: false,
        viewportPriority: false,
        maxLiveNodes: 0,
        nodeVirtual: false,
      },
    });
    cy.get('.node-slot').should('have.length', 1);
    cy.get('.node-content h2.sd-typography').should('have.text', 'Minimal');
  });
  it('preserves loaded state when an equivalent image AST node is cloned', () => {
    image();
    cy.mount({
      setup() {
        const node = ref({
          type: 'image',
          src: `/nested-markdown-image.svg?case=${crypto.randomUUID()}`,
          alt: 'Cloned image',
          title: null,
          raw: '',
        });
        return () =>
          h('div', [
            h(
              'button',
              {
                onClick: () => {
                  node.value = { ...node.value };
                },
              },
              'Clone image AST',
            ),
            h(
              MarkdownImage,
              { node: node.value, indexKey: 'clone-0' },
              {
                placeholder: () => h('span', { 'data-testid': 'image-pending' }, 'Pending'),
              },
            ),
          ]);
      },
    });
    cy.get('img[alt="Cloned image"]').should('exist');
    cy.wrap(null).should(() => expect(imageResponses.size).to.be.greaterThan(0));
    cy.then(releaseImages);
    cy.get('[data-testid="image-pending"]').should('not.exist');
    cy.contains('button', 'Clone image AST').click();
    cy.get('[data-testid="image-pending"]').should('not.exist');
    cy.get('img[alt="Cloned image"]').should(($image) =>
      expect(($image[0] as HTMLImageElement).naturalWidth).to.equal(32),
    );
  });
  for (const fragment of [false, true]) {
    it(`forwards nested image pending and settled state with fragment=${fragment}`, () => {
      image();
      mountNested(fragment);
      cy.contains('button', 'Toggle child').click();
      cy.get('img[alt="Nested image"]').should('exist');
      cy.wrap(null).should(() => expect(imageResponses.size).to.be.greaterThan(0));
      cy.contains('button', 'Settle parent').click();
      metrics().then((value) => expect(value.stable, JSON.stringify(value)).to.equal(false));
      cy.then(releaseImages);
      cy.get('img[alt="Nested image"]').should(($image) =>
        expect(($image[0] as HTMLImageElement).naturalWidth).to.equal(32),
      );
      cy.contains('button', 'Settle parent').click();
      metrics().then((value) => {
        expect(value.stable, JSON.stringify(value)).to.equal(true);
        expect(value.lifecycleTrace.map((entry: [string, string]) => entry[0])).to.include.members([
          'pending',
          'height',
          'settled',
        ]);
      });
    });
  }
  it('releases a nested pending marker when the child unmounts', () => {
    image();
    mountNested(true);
    cy.contains('button', 'Toggle child').click();
    cy.get('img[alt="Nested image"]').should('exist');
    cy.wrap(null).should(() => expect(imageResponses.size).to.be.greaterThan(0));
    cy.contains('button', 'Settle parent').click();
    metrics().then((value) => expect(value.stable, JSON.stringify(value)).to.equal(false));
    cy.contains('button', 'Toggle child').click();
    cy.get('img[alt="Nested image"]').should('not.exist');
    cy.contains('button', 'Settle parent').click();
    metrics().then((value) => expect(value.stable).to.equal(true));
  });
});
