import { defineComponent, h, ref } from 'vue';

import type { RegexVisFlag } from '../types';

import RegexVis from '../index';

describe('RegexVis foundation state adapters', () => {
  it('retains controlled flags/model rejection, event order and external literal synchronization', () => {
    cy.mount(
      defineComponent({
        setup() {
          const value = ref('/a/g'),
            flags = ref<RegexVisFlag[]>(['g']),
            accept = ref(false),
            events = ref<string[]>([]);
          return () =>
            h('div', [
              h(RegexVis, {
                'modelValue': value.value,
                'flags': flags.value,
                'onUpdate:flags': (next) => {
                  events.value.push(`flags:${next.join('')}`);
                  if (accept.value) flags.value = next;
                },
                'onUpdate:modelValue': (next) => {
                  events.value.push(`value:${next}`);
                  if (accept.value) value.value = next;
                },
              }),
              h('output', { id: 'regex-state' }, `${value.value}|${flags.value.join('')}`),
              h('output', { id: 'regex-events' }, events.value.join('|')),
              h(
                'button',
                {
                  id: 'regex-accept',
                  onClick: () => {
                    accept.value = true;
                  },
                },
                'Accept',
              ),
              h(
                'button',
                {
                  id: 'regex-external',
                  onClick: () => {
                    value.value = '/😀/u';
                  },
                },
                'External literal',
              ),
            ]);
        },
      }),
    );
    cy.contains('.sd-regex-vis-flags label', 'i').click();
    cy.get('#regex-state').should('have.text', '/a/g|g');
    cy.get('#regex-events').should('have.text', 'flags:gi|value:/a/gi');
    cy.contains('.sd-regex-vis-flags label', 'i').find('input').should('not.be.checked');
    cy.get('#regex-accept').click();
    cy.contains('.sd-regex-vis-flags label', 'i').click();
    cy.get('#regex-state').should('have.text', '/a/gi|gi');
    cy.get('#regex-external').click();
    cy.get('#regex-state').should('have.text', '/😀/u|u');
    cy.contains('.sd-regex-vis-flags label', 'u').find('input').should('be.checked');
  });

  it('keeps stable selection ids, clears missing diagrams and guards nonselectable nodes', () => {
    const select = cy.spy().as('selected');
    cy.mount(RegexVis, { props: { modelValue: 'a', onSelect: select } });
    cy.get('.sd-regex-vis-node-character').click().should('have.attr', 'aria-pressed', 'true');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: 'b' }));
    cy.get('.sd-regex-vis-node-character')
      .should('have.attr', 'aria-pressed', 'true')
      .and('contain.text', 'b');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: '' }));
    cy.get('[data-testid="regex-vis-graph"]').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: 'c', selectable: false }));
    cy.get('.sd-regex-vis-node-character').click().should('not.have.attr', 'aria-pressed');
    cy.get('.sd-regex-vis-node-character').should('not.have.class', 'sd-regex-vis-node-selected');
    cy.get('@selected').should('have.been.calledOnce');
  });
});
