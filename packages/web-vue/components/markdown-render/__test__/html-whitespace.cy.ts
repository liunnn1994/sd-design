import { computed, h, provide, reactive, ref } from 'vue';

import { markdownContextKey } from '../context';
import Html from '../nodes/html.vue';

describe('Markdown HTML whitespace', () => {
  it('updates an existing block host when content and inherited policy change', () => {
    const node = reactive({ type: 'html_inline', content: '<p>Original</p>' });
    const policy = ref<'safe' | 'trusted'>('safe');
    cy.mount({
      setup() {
        provide(
          markdownContextKey,
          computed(() => ({ content: '', htmlPolicy: policy.value })),
        );
        return () => h(Html, { node });
      },
    });
    cy.get('.sd-typography').should('have.text', 'Original');
    cy.then(() => {
      policy.value = 'trusted';
      node.content = '<p><button type="reset">Updated</button></p>';
    });
    cy.get('.sd-btn').should('have.text', 'Updated').and('have.attr', 'type', 'reset');
    cy.then(() => {
      policy.value = 'safe';
    });
    cy.get('.sd-btn').should('not.exist');
  });

  it('preserves whitespace between adjacent inline elements', () => {
    cy.mount(Html, {
      props: {
        node: {
          type: 'html_block',
          content: '<p><a href="#one">one</a>\n\t<a href="#two">two</a></p>',
        },
      },
    });
    cy.get('.sd-typography').should('have.text', 'one\n\ttwo');
  });
});
