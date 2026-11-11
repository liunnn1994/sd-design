import { JSON_FORM_COMPONENT_TYPES } from '@sdata/web-core/json-form/types';

import type { RichTextEditorRef } from '../../src/rich-text-editor/types';
const control = (name: string) => cy.contains('button', new RegExp(`^${name}$`)).click();
const editor = () =>
  cy
    .window()
    .then((window) => (window as unknown as { readEditor(): RichTextEditorRef }).readEditor());
const metrics = () =>
  cy.window().its('richTextMetrics') as Cypress.Chainable<{
    development: boolean;
    mounts: number;
    cleanups: number;
    updates: number;
    changes: number;
    ready: boolean;
    errors: string[];
  }>;
describe('React RichTextEditor', () => {
  it('mounts in StrictMode with ready refs, native editing, placeholder and auto size', () => {
    cy.visit('/rich-text-editor.html');
    metrics().should((value) => {
      expect(value.development).to.be.a('boolean');
      expect(value.mounts).to.equal(value.development ? 2 : 1);
      expect(value.cleanups).to.equal(value.development ? 1 : 0);
      expect(value.ready).to.equal(true);
    });
    cy.get('[role="textbox"]')
      .should('contain.text', 'Initial')
      .and('have.attr', 'aria-multiline', 'true')
      .click()
      .type(' edited');
    editor().then((value) => expect(value.getText()).to.contain('edited'));
    control('Clear');
    cy.get('.sd-rich-text-editor-placeholder').should('have.text', 'Placeholder');
    cy.get('[role="textbox"]').should(($element) => {
      expect($element[0].style.minHeight).to.equal('2lh');
      expect($element[0].style.maxHeight).to.equal('4lh');
    });
    control('Toggle editor');
    metrics().should((value) => expect(value.cleanups).to.equal(value.mounts));
    control('Toggle editor');
    cy.get('[role="textbox"]').should('have.text', 'Initial');
    metrics().should((value) => expect(value.errors).to.deep.equal([]));
  });
  it('imports and exports HTML, Markdown and serialized JSON through a controlled model', () => {
    cy.visit('/rich-text-editor.html?controlled');
    control('Import HTML');
    cy.get('[role="textbox"] h2').should('have.text', 'Heading');
    editor().then((value) => {
      expect(value.getHTML()).to.contain('<strong');
      expect(value.getMarkdown()).to.contain('**Bold**');
    });
    control('Save JSON');
    control('Import Markdown');
    cy.get('[role="textbox"] h2').should('have.text', 'Markdown');
    control('Restore JSON');
    cy.get('[role="textbox"] h2').should('have.text', 'Heading');
    metrics().should((value) => expect(value.changes).to.be.greaterThan(0));
  });
  it('formats selections and supports undo/redo', () => {
    cy.visit('/rich-text-editor.html');
    control('Select all');
    control('Bold');
    cy.get('[role="textbox"] strong').should('have.text', 'Initial');
    editor().then((value) => expect(value.canUndo).to.equal(true));
    control('Undo');
    cy.get('[role="textbox"] strong').should('not.exist');
    editor().then((value) => expect(value.canRedo).to.equal(true));
    control('Redo');
    cy.get('[role="textbox"] strong').should('have.text', 'Initial');
  });
  it('renders real built-in nodes, updates values and removes tags', () => {
    cy.visit('/rich-text-editor.html?nodes');
    cy.get('input[placeholder="Node input"]').should('have.value', 'Value');
    cy.get('.sd-rich-text-editor-component-input .sd-input-fit-width').should('exist');
    cy.get('input[placeholder="Node input"]').clear().type('Changed');
    editor().then((value) =>
      expect(
        value.getContent().find((item) => typeof item !== 'string' && item.key === 'input'),
      ).to.have.property('value', 'Changed'),
    );
    cy.get('.sd-rich-text-editor-component-tag .sd-tag-close-btn').click();
    cy.get('.sd-rich-text-editor-component-tag').should('not.exist');
    cy.get('.sd-rich-text-editor-component-fallback').should('contain.text', 'Fallback');
    control('Toggle editor');
    cy.get('[role="textbox"]').should('not.exist');
    metrics().should((value) => expect(value.cleanups).to.equal(value.mounts));
    control('Toggle editor');
    cy.get('input[placeholder="Node input"]').should('have.value', 'Value');
  });
  it('provides custom node context and synchronizes disabled and readonly states', () => {
    cy.visit('/rich-text-editor.html?nodes&custom');
    cy.get('[data-testid="custom-node"]').click().should('have.text', 'Updated custom');
    control('Toggle readonly');
    cy.get('[role="textbox"]')
      .should('have.attr', 'contenteditable', 'false')
      .and('have.attr', 'aria-readonly', 'true');
    cy.get('input[placeholder="Node input"]').should('be.disabled');
    cy.get('[data-testid="custom-node"]').should('be.disabled');
    cy.get('.sd-tag-close-btn').should('not.exist');
    control('Toggle readonly');
    control('Toggle disabled');
    cy.get('[role="textbox"]').should('have.attr', 'aria-disabled', 'true');
  });
  it('avoids JSON serialization for edits without state listeners', () => {
    cy.visit('/rich-text-editor.html?no-listeners');
    cy.get('[role="textbox"]').should('have.text', 'Initial');
    editor().then((value) =>
      cy.spy(Object.getPrototypeOf(value.editorState), 'toJSON').as('serialize'),
    );
    cy.get('[role="textbox"]').click().type(' change');
    cy.get('@serialize').should('not.have.been.called');
  });
  it('registers raw commands and update listeners, and reports invalid JSON without losing content', () => {
    cy.visit('/rich-text-editor.html');
    cy.get('[role="textbox"]').should('have.text', 'Initial');
    editor().then((value) => {
      const command = { type: 'REACT_EDITOR_TEST' };
      const events: unknown[] = [];
      const unregister = value.registerCommand(
        command,
        (payload) => {
          events.push(payload);
          return true;
        },
        1,
      );
      expect(value.dispatchCommand(command, 'payload')).to.equal(true);
      unregister();
      expect(value.dispatchCommand(command, 'ignored')).to.equal(false);
      const stop = value.registerUpdateListener(() => {
        events.push('update');
      });
      value.insertText('X', { position: 'end' });
      stop();
      expect(events).to.deep.equal(['payload', 'update']);
      value.setJSON('{"root":');
      expect(value.getText()).to.equal('InitialX');
    });
    metrics().should((value) => expect(value.errors).to.have.length(1));
  });
  it('renders every JsonForm built-in and defaults supported text controls to fit width', () => {
    cy.visit('/rich-text-editor.html');
    cy.get('[role="textbox"]').should('have.text', 'Initial');
    const sample = {
      autoComplete: { data: ['React'] },
      cascader: { options: [] },
      checkboxGroup: { options: ['React'] },
      inputTag: { options: [] },
      mention: { data: ['React'] },
      radioGroup: { options: ['React'] },
      select: { options: ['React'] },
      transfer: { data: [] },
      treeSelect: { data: [] },
    };
    editor().then((value) =>
      value.setContent(
        Object.values(JSON_FORM_COMPONENT_TYPES).map((name) => ({
          key: name,
          name,
          value: null,
          props: sample[name as keyof typeof sample] ?? {},
          textValue: name,
        })),
      ),
    );
    for (const name of Object.values(JSON_FORM_COMPONENT_TYPES))
      cy.get(`.sd-rich-text-editor-component-${name}`).should('exist');
    const fitSelectors = {
      input: '.sd-input-fit-width',
      inputNumber: '.sd-input-fit-width',
      inputPassword: '.sd-input-fit-width',
      inputSearch: '.sd-input-fit-width',
      inputTag: '.sd-input-tag-fit-width',
      mention: '.sd-input-fit-width',
      datePicker: '.sd-picker-fit-width',
      rangePicker: '.sd-picker-fit-width',
      select: '.sd-select-view-fit-width',
      textarea: '.sd-textarea-fit-width',
      timePicker: '.sd-picker-fit-width',
      treeSelect: '.sd-select-view-fit-width',
      cascader: '.sd-select-view-fit-width',
      autoComplete: '.sd-input-fit-width',
    };
    for (const [name, selector] of Object.entries(fitSelectors))
      cy.get(`.sd-rich-text-editor-component-${name}`)
        .should('not.have.class', 'sd-rich-text-editor-component-stretch')
        .find(selector)
        .should('exist');
    editor().then((value) =>
      value.setContent([{ key: 'wide', name: 'input', value: 'Wide', props: { fitWidth: false } }]),
    );
    cy.get('.sd-rich-text-editor-component-input').should(
      'have.class',
      'sd-rich-text-editor-component-stretch',
    );
  });
  it('opens a real picker portal from an inline node and exports its value', () => {
    cy.visit('/rich-text-editor.html');
    cy.get('[role="textbox"]').should('have.text', 'Initial');
    editor().then((value) =>
      value.setContent([
        {
          key: 'date',
          name: 'datePicker',
          value: '2026-11-08',
          props: { valueFormat: 'YYYY-MM-DD', placeholder: 'Inline date' },
        },
      ]),
    );
    cy.get('input[placeholder="Inline date"]').click();
    cy.get('.sd-picker-container').should('be.visible');
    cy.get('.sd-picker-container').contains('[role="gridcell"]', /^15$/).click();
    editor().then((value) =>
      expect(value.getContent().find((item) => typeof item !== 'string')).to.have.property(
        'value',
        '2026-11-15',
      ),
    );
  });
});
