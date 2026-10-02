import type { RichTextEditorRef } from '../types';

import RichTextEditor from '../index';

describe('RichTextEditor HTML fragments', () => {
  for (const html of ['Hello', '<span>Hello</span>', 'Hello<p>World</p>']) {
    it(`imports ${html} without losing the content`, () => {
      const onError = cy.spy().as('onError');
      cy.mount(RichTextEditor, { props: { defaultValue: 'Old content', onError } });
      cy.get('@vue').then(({ wrapper }) => {
        const editor = wrapper.vm as RichTextEditorRef;
        editor.setHTML(html);
      });
      cy.get('[role="textbox"]')
        .should('contain.text', 'Hello')
        .and('not.contain.text', 'Old content');
      if (html.includes('World')) cy.get('[role="textbox"] p').should('contain.text', 'World');
      cy.get('@onError').should('not.have.been.called');
    });
  }
});
