import { defineComponent, ref } from 'vue';

import KvList from '../index';

describe('KvList drag lifecycle', () => {
  it('reorders through DOM drag events and edits and removes the moved row', () => {
    cy.mount(
      defineComponent({
        components: { KvList },
        setup() {
          return {
            json: ref([
              { key: 'first', value: '1' },
              { key: 'second', value: '2' },
              { key: 'third', value: '3' },
            ]),
            bulk: ref(''),
          };
        },
        template:
          '<KvList v-model:json="json" v-model:bulk="bulk" /><output>{{ bulk }}</output><pre>{{ JSON.stringify(json) }}</pre>',
      }),
    );
    const transfer = new DataTransfer();
    cy.get('.sd-kv-list-drag-handle').first().trigger('pointerdown', {
      eventConstructor: 'PointerEvent',
      button: 0,
      pointerType: 'mouse',
      isPrimary: true,
    });
    cy.get('.sd-kv-list-row').first().trigger('dragstart', { dataTransfer: transfer });
    cy.get('.sd-kv-list-row--ghost').should('exist');
    cy.get('.sd-kv-list-row')
      .last()
      .then(($row) => {
        const rect = $row[0].getBoundingClientRect();
        cy.wrap($row).trigger('dragover', {
          dataTransfer: transfer,
          clientX: rect.left + rect.width / 2,
          clientY: rect.bottom - 2,
        });
      });
    cy.get('.sd-kv-list-row').last().find('input').first().should('have.value', 'first');
    cy.get('.sd-kv-list-row').last().trigger('drop', { dataTransfer: transfer });
    cy.get('output').should('have.text', 'second: 2\nthird: 3\nfirst: 1');
    cy.get('pre').should(
      'have.text',
      JSON.stringify([
        { key: 'second', value: '2' },
        { key: 'third', value: '3' },
        { key: 'first', value: '1' },
      ]),
    );
    cy.get('.sd-kv-list-row').last().find('input').eq(1).type('x');
    cy.get('output').should('have.text', 'second: 2\nthird: 3\nfirst: 1x');
    cy.get('.sd-kv-list-row').last().contains('button', '删除键值对').click();
    cy.get('output').should('have.text', 'second: 2\nthird: 3');
    cy.get('pre').should(
      'have.text',
      JSON.stringify([
        { key: 'second', value: '2' },
        { key: 'third', value: '3' },
      ]),
    );
    cy.get('.sd-kv-list-row--ghost, .sd-kv-list-row--chosen').should('not.exist');
  });

  it('prevents drag initiation when disabled and restores it after enabling', () => {
    cy.mount(
      defineComponent({
        components: { KvList },
        setup() {
          return {
            disabled: ref(true),
            json: ref([
              { key: 'first', value: '1' },
              { key: 'second', value: '2' },
            ]),
          };
        },
        template:
          '<KvList v-model:json="json" :disabled="disabled" /><button @click="disabled = false">Enable</button>',
      }),
    );
    cy.get('.sd-kv-list-drag-handle').first().trigger('pointerdown', {
      eventConstructor: 'PointerEvent',
      button: 0,
      pointerType: 'mouse',
      isPrimary: true,
    });
    cy.get('.sd-kv-list-row--chosen').should('not.exist');
    cy.get('.sd-kv-list-row').first().should('not.have.attr', 'draggable');
    cy.contains('button', 'Enable').click();
    cy.get('.sd-kv-list-drag-handle').first().trigger('pointerdown', {
      eventConstructor: 'PointerEvent',
      button: 0,
      pointerType: 'mouse',
      isPrimary: true,
    });
    cy.get('.sd-kv-list-row--chosen').should('exist');
    cy.get('.sd-kv-list-row').first().trigger('mouseup');
    cy.get('.sd-kv-list-row--chosen').should('not.exist');
    cy.get('.sd-kv-list-row').first().find('input').first().should('have.value', 'first');
  });
});
