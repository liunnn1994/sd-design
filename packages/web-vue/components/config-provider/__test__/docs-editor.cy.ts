describe('文档示例编辑器样式', () => {
  for (const mode of ['light', 'dark']) {
    it(`${mode} 模式使用 SD 控件尺寸与主题颜色`, () => {
      cy.document().then((doc) => {
        if (mode === 'dark') doc.body.setAttribute('sd-theme', 'dark');
        else doc.body.removeAttribute('sd-theme');
      });
      // Cypress exposes a partial process object; Monaco reads env at import time.
      cy.window().then((win) => {
        const target = win as unknown as { process?: { env?: Record<string, string> } };
        target.process ??= {};
        target.process.env ??= {};
      });
      // The cold import includes Monaco; keep its loading budget separate from UI assertions.
      cy.then({ timeout: 30000 }, async () => {
        const { default: DemoEditor } =
          await import('../../../../sd-vue-docs/src/components/docs/DemoEditor.vue');
        return DemoEditor;
      }).then((DemoEditor) => {
        cy.mount(DemoEditor, {
          props: { source: '<template><button>Demo</button></template>', mainFile: 'App.vue' },
        });
      });
      cy.get('.demo-editor__button')
        .should('have.css', 'height', '32px')
        .and('have.css', 'border-radius', '8px')
        .and('have.css', 'font-size', '14px')
        .should(($button) => {
          const style = getComputedStyle($button[0]);
          expect(style.color).to.equal(style.getPropertyValue('--sd-color-text-2').trim());
        })
        .focus()
        .should('have.css', 'outline-style', 'solid');
      cy.get('.demo-editor__panel').should('not.exist');
    });
  }

  afterEach(() => {
    cy.document().then((doc) => doc.body.removeAttribute('sd-theme'));
  });
});
