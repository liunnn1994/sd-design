import type { RichTextEditorRef } from '../types';

import RichTextEditor from '../index';

for (const [name, selector] of [
  ['input', '.sd-input-wrapper'],
  ['select', '.sd-select-view'],
  ['tag', '.sd-tag'],
] as const) {
  it(`keeps caret space inside the ${name} node without adding document text`, () => {
    cy.mount(RichTextEditor, {
      props: {
        defaultValue: ['前', { key: 'slot', name, value: 'Vue', props: { options: ['Vue'] } }],
      },
    });
    cy.get('[data-rich-text-component-key="slot"]').should(($host) => {
      const host = $host[0];
      const control = host.querySelector(selector)!;
      const outer = host.getBoundingClientRect();
      const inner = control.getBoundingClientRect();
      expect(inner.left - outer.left, 'space before control').to.be.at.least(4);
      expect(outer.right - inner.right, 'space after control').to.be.at.least(4);
    });
    cy.get('@vue').then(({ wrapper }) => {
      const editor = wrapper.vm as RichTextEditorRef;
      editor.insertContent(['后'], { position: 'end' });
      expect(editor.getText()).to.equal('前Vue后');
      expect(editor.getContent()).to.have.length(3);
    });
  });
}
