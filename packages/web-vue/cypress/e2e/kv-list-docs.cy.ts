describe('KvList 在线编辑器', () => {
  it('通过本地 ESM 模块加载并渲染示例', () => {
    cy.visit('/components/kv-list/');
    cy.get('.demo-block')
      .first()
      .scrollIntoView()
      .within(() => {
        cy.contains('button', '在线编辑', { timeout: 20000 }).click();
        cy.get('iframe', { timeout: 90000 }).should(($frame) => {
          const app =
            $frame[0].contentDocument?.querySelector<HTMLIFrameElement>(
              'iframe[name="app"]',
            )?.contentDocument;
          const preview = app?.querySelector<HTMLIFrameElement>('#result iframe')?.contentDocument;
          expect(Boolean(preview?.querySelector('.sd-kv-list'))).to.equal(true);
        });
      });
  });
});
