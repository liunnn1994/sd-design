import type { RichTextEditorRef } from '../types';

import RichTextEditor from '../index';

describe('RichTextEditor combined text decorations', () => {
  it('shows underline and strikethrough together and removes each independently', () => {
    cy.mount(RichTextEditor, { props: { defaultValue: 'Decorated text' } });
    cy.get('@vue').then(({ wrapper }) => {
      const editor = wrapper.vm as RichTextEditorRef;
      editor.focus(undefined, { selection: 'all' });
      editor.formatText('underline');
      editor.formatText('strikethrough');
    });
    cy.get('[data-lexical-text="true"]').should(($text) => {
      const decoration = getComputedStyle($text[0]).textDecorationLine;
      expect(decoration).to.contain('underline');
      expect(decoration).to.contain('line-through');
    });
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as RichTextEditorRef).formatText('strikethrough');
    });
    cy.get('[data-lexical-text="true"]').should('have.css', 'text-decoration-line', 'underline');
  });
});
