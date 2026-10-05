import { defineComponent, h, inject, provide, ref } from 'vue';

import Typography from '../index';

const { Paragraph } = Typography;
const text = 'A long paragraph that must overflow the narrow container. '.repeat(4);

describe('Typography robustness', () => {
  for (const ellipsis of [false, true]) {
    it(`copies the displayed injected slot text, ellipsis=${ellipsis}`, () => {
      const label = ref('Provided');
      const Child = defineComponent({
        setup() {
          const value = inject('label', ref('Fallback'));
          return () => h('span', value.value);
        },
      });
      const copy = cy.spy().as('copy');
      cy.mount({
        setup() {
          provide('label', label);
          return () =>
            h(Paragraph, { copyable: true, ellipsis, onCopy: copy }, { default: () => h(Child) });
        },
      });
      cy.get('.sd-typography').should('contain.text', 'Provided');
      cy.get('.sd-typography-operation-copy:visible').first().click({ force: true });
      cy.get('@copy').should('have.been.calledWith', 'Provided');
      if (!ellipsis) {
        cy.then(() => {
          label.value = 'Updated';
        });
        cy.get('.sd-typography').should('contain.text', 'Updated');
        cy.get('.sd-typography-operation-copied:visible').first().click({ force: true });
        cy.get('@copy').should('have.been.calledWith', 'Updated');
      }
    });
  }

  it('keeps quotes in mark colors inside the style attribute', () => {
    cy.mount(Paragraph, {
      props: { ellipsis: true, mark: { color: 'red" data-robustness="injected' } },
      slots: { default: 'Text' },
    });
    cy.get('.sd-typography mark').should('exist').and('not.have.attr', 'data-robustness');
  });

  it('removes the clamp title when ellipsis is disabled', () => {
    const enabled = ref(true);
    cy.mount({
      setup: () => () =>
        h(Paragraph, { ellipsis: enabled.value, style: 'width:80px' }, { default: () => text }),
    });
    cy.get('.sd-typography').should('have.attr', 'title', text.trim());
    cy.then(() => {
      enabled.value = false;
    });
    cy.get('.sd-typography').should('not.have.attr', 'title');
  });

  it('removes the collapse operation when ellipsis is disabled', () => {
    const enabled = ref(true);
    cy.mount({
      setup: () => () =>
        h(
          Paragraph,
          { ellipsis: enabled.value ? { rows: 1, expandable: true } : false, style: 'width:80px' },
          { default: () => text },
        ),
    });
    cy.get('.sd-typography [data-part="content"] .sd-typography-operation-expand')
      .first()
      .click({ force: true });
    cy.get('.sd-typography-operation-expand:visible').should('have.attr', 'aria-expanded', 'true');
    cy.then(() => {
      enabled.value = false;
    });
    cy.get('.sd-typography-operation-expand').should('not.exist');
  });
});
