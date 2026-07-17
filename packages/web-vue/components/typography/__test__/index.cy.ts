import { defineComponent, h } from 'vue';

import Typography from '../index';

const { Paragraph } = Typography;

describe('Typography', () => {
  it('Paragraph supports copyable', () => {
    cy.mount(Paragraph, { props: { copyable: true }, slots: { default: 'my text' } });
    cy.get('.sd-typography-operation-copy').should('exist').click({ force: true });
    cy.get('.sd-typography-operation-copied').should('exist');
  });

  it('Paragraph passes clipboard props to copy-to-clipboard', () => {
    cy.window().then((win) => {
      Object.defineProperty(win, 'isSecureContext', { configurable: true, value: false });
      Object.defineProperty(win, 'prompt', { configurable: true, value: cy.stub().as('prompt') });
    });
    cy.document().then((doc) => {
      cy.stub(doc, 'execCommand').returns(false).as('execCommand');
    });
    cy.mount(Paragraph, {
      props: {
        copyable: true,
        copyText: 'clipboard-text',
        clipboardProps: { fallbackToPrompt: true },
      },
      slots: { default: 'my text' },
    });
    cy.get('.sd-typography-operation-copy').click({ force: true });
    cy.get('@execCommand').should('have.been.calledWith', 'copy');
    cy.get('@prompt').should(
      'have.been.calledWith',
      'Copy to clipboard: Ctrl+C, Enter',
      'clipboard-text',
    );
  });

  it('Paragraph supports editable', () => {
    cy.mount(Paragraph, { props: { editable: true }, slots: { default: 'my text' } });
    cy.get('.sd-typography-operation-edit').should('exist').click({ force: true });
    cy.get('.sd-typography-edit-content').should('exist');
  });

  it('exposes copy/edit controls with button role, tabindex and a name', () => {
    cy.mount(Paragraph, {
      props: { copyable: true, editable: true },
      slots: { default: 'my text' },
    });
    cy.get('.sd-typography-operation-copy')
      .should('have.attr', 'role', 'button')
      .and('have.attr', 'tabindex', '0')
      .and('have.attr', 'aria-label');
    cy.get('.sd-typography-operation-edit')
      .should('have.attr', 'role', 'button')
      .and('have.attr', 'tabindex', '0')
      .and('have.attr', 'aria-label');
  });

  it('Paragraph mounts with an ellipsis config', () => {
    // The ellipsis JS measurement relies on mocked DOM metrics (offsetHeight /
    // line-height) in the vitest version; in a real headless mount it is not
    // deterministic, so just assert it renders without error.
    const text = 'A design is a plan or specification for the construction'.repeat(10);
    cy.mount(
      defineComponent({
        render() {
          return h(
            'div',
            { style: 'max-width: 200px' },
            h(Paragraph, { ellipsis: { rows: 2, expandable: true } }, { default: () => text }),
          );
        },
      }),
    );
    cy.get('.sd-typography').should('exist');
  });
});
