import { defineComponent, h, ref } from 'vue';

import MarkdownRender from '..';
import { provideMarkdownComponents } from '../context';

const mountCustom = () =>
  cy.mount({
    setup() {
      const alternate = ref(false);
      const Card = defineComponent({
        inheritAttrs: false,
        props: ['isDark'],
        setup(props, { attrs, slots }) {
          return () =>
            h(
              'section',
              {
                'class': 'fixture-card',
                'data-dark': String(props.isDark),
                'data-flavor': attrs['data-flavor'],
                'data-unsafe': String('onclick' in attrs),
              },
              slots.default?.(),
            );
        },
      });
      provideMarkdownComponents({ 'fixture-card': Card }, () => undefined);
      return () =>
        h('div', [
          h(
            'button',
            {
              onClick: () => {
                alternate.value = !alternate.value;
              },
            },
            'Change config',
          ),
          h(MarkdownRender, {
            nodes: [
              {
                type: 'fixture-card',
                tag: 'fixture-card',
                raw: '',
                content: '<fixture-card data-flavor="deep">**Deep child**</fixture-card>',
                attrs: [['data-flavor', 'recursive']],
              },
              {
                type: 'fixture-card',
                tag: 'fixture-card',
                raw: '',
                content: 'Ignored content',
                attrs: [
                  ['data-flavor', 'AST'],
                  ['onclick', 'alert(1)'],
                ],
                children: [
                  {
                    type: 'heading',
                    level: 2,
                    raw: '',
                    children: [{ type: 'text', content: 'AST child', raw: '' }],
                  },
                ],
              },
              {
                type: 'fixture-card',
                tag: 'fixture-card',
                raw: '',
                content: '## Parsed child\n\nFirst\nSecond\n\n<div>Escaped</div>',
                loading: false,
                attrs: [['data-flavor', 'parsed']],
              },
            ],
            customHtmlTags: ['fixture-card'],
            customMarkdownIt: (md) =>
              alternate.value ? md.disable('heading') : md.enable('heading'),
            isDark: !alternate.value,
            htmlPolicy: 'escape',
            fade: false,
            smoothStreaming: false,
            batchRendering: false,
            deferNodesUntilVisible: false,
            nodeVirtual: false,
          }),
        ]);
    },
  });

describe('Markdown custom node recursive children', () => {
  it('inherits custom tag registration through multiple levels of parsed content', () => {
    mountCustom();
    cy.get('.fixture-card[data-flavor="recursive"] .fixture-card[data-flavor="deep"]')
      .should('have.attr', 'data-dark', 'true')
      .find('strong')
      .should('have.text', 'Deep child');
    cy.contains('button', 'Change config').click();
    cy.get('.fixture-card[data-flavor="deep"]').should('have.attr', 'data-dark', 'false');
  });
  it('prefers supplied AST children and sanitizes attributes on the custom component', () => {
    mountCustom();
    cy.get('.fixture-card[data-flavor="AST"]')
      .should('have.attr', 'data-dark', 'true')
      .and('have.attr', 'data-unsafe', 'false')
      .within(() => {
        cy.get('h2.sd-typography').should('have.text', 'AST child');
        cy.contains('Ignored content').should('not.exist');
      });
  });
  it('parses content children with inherited options and updates them with parent configuration', () => {
    mountCustom();
    cy.get('.fixture-card[data-flavor="parsed"]').within(() => {
      cy.get('h2.sd-typography').should('have.text', 'Parsed child');
      cy.contains('<div>Escaped</div>').should('exist');
      cy.get('.node-slot, .markdown-renderer').should('not.exist');
    });
    cy.contains('button', 'Change config').click();
    cy.get('.fixture-card[data-flavor="parsed"]')
      .should('have.attr', 'data-dark', 'false')
      .within(() => {
        cy.get('h2').should('not.exist');
        cy.contains('## Parsed child').should('exist');
      });
    cy.get('.fixture-card[data-flavor="AST"] h2').should('have.text', 'AST child');
  });
});
