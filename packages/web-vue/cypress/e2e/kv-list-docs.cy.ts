describe('KvList 在线编辑器', () => {
  it('通过本地 ESM 模块加载并渲染示例', () => {
    cy.visit('/components/kv-list/');
    cy.get('.demo-block')
      .first()
      .scrollIntoView()
      .within(() => {
        cy.contains('button', '在线编辑', { timeout: 20000 }).click();
        cy.get('iframe', { timeout: 30000 }).should(($frame) => {
          expect(Boolean($frame[0].contentDocument?.body.querySelector('.sd-kv-list'))).to.equal(
            true,
          );
        });
      });
  });
});
