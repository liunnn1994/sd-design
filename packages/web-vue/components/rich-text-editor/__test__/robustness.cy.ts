import { $getRoot } from 'lexical';

import type { RichTextEditorRef } from '../types';

import RichTextEditor from '../index';

describe('RichTextEditor robustness', () => {
  it('emits a plugin edit queued during an external state update', () => {
    let edit: (() => void) | undefined;
    const changes: string[] = [];
    cy.mount(RichTextEditor, {
      props: {
        defaultValue: 'Old',
        onUpdate: ({ tags }) => {
          if (tags.has('sd-rich-text-external')) edit?.();
        },
        onChange: (_value, context) => {
          changes.push(context.editorState.read(() => $getRoot().getTextContent()));
        },
      },
    });
    cy.get('@vue').then(({ wrapper }) => {
      const editor = wrapper.vm as RichTextEditorRef;
      editor.setContent(['External']);
      const external = editor.getJSON()!;
      editor.setContent(['Old']);
      changes.length = 0;
      edit = () => editor.insertText(' edited', { position: 'end', tag: 'user-edit' });
      return wrapper.setProps({ modelValue: external });
    });
    cy.get('[role="textbox"]').should('have.text', 'External edited');
    cy.then(() => expect(changes).to.deep.equal(['External edited']));
  });

  for (const name of ['constructor', 'toString', '__proto__']) {
    it(`uses fallback content for the unregistered ${name} node`, () => {
      cy.mount(RichTextEditor, {
        props: { defaultValue: [{ key: 'custom', name, textValue: 'Fallback' }] },
      });
      cy.get('.sd-rich-text-editor-component-fallback').should('have.text', 'Fallback');
    });
  }

  it('round-trips empty imported HTML through JSON and remains editable', () => {
    const onError = cy.spy().as('onError');
    cy.mount(RichTextEditor, { props: { defaultValue: 'Old content', onError } });
    cy.get('@vue').then(({ wrapper }) => {
      const editor = wrapper.vm as RichTextEditorRef;
      editor.setHTML('');
      expect(editor.getText()).to.equal('');
      editor.setJSON(editor.getJSON()!);
    });
    cy.get('@onError').should('not.have.been.called');
    cy.get('@vue').then(({ wrapper }) => {
      const editor = wrapper.vm as RichTextEditorRef;
      editor.insertText('New content', { position: 'end' });
      expect(editor.getText()).to.equal('New content');
    });
  });
});
