describe('连续曲率圆角', () => {
  it('按钮的四角使用共享曲率 token，圆形按钮保留圆弧', () => {
    cy.visit('/components/button/');
    cy.get('.demo-block .sd-btn', { timeout: 60000 })
      .first()
      .should(($button) => {
        const style = getComputedStyle($button[0]);
        for (const corner of ['top-left', 'top-right', 'bottom-right', 'bottom-left']) {
          expect(style.getPropertyValue(`corner-${corner}-shape`)).to.equal('superellipse(2)');
        }
      });
    cy.contains('h3', '按钮形状').scrollIntoView();
    cy.get('.demo-block .sd-btn-shape-circle', { timeout: 60000 })
      .first()
      .should('have.css', 'corner-shape', 'superellipse(1)');
  });
});
