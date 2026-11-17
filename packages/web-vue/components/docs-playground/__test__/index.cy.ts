import DemoEditor from '../../../../sd-vue-docs/src/components/docs/DemoEditor.vue';
import LiveCodesPanel from '../../../../sd-vue-docs/src/components/docs/LiveCodesPanel.vue';

for (const framework of ['vue', 'react'] as const) {
  it(`${framework}: opens lazily, reports missing assets and allows retry and collapse`, () => {
    cy.mount(DemoEditor, { props: { framework, source: '<p>示例</p>', mainFile: 'Example' } });
    cy.get('iframe').should('not.exist');
    cy.contains('button', '在线编辑').should('have.attr', 'aria-expanded', 'false').click();
    cy.get('[role="alert"]').should('contain.text', '404');
    cy.contains('button', '重试').click();
    cy.get('[role="alert"]').should('contain.text', '404');
    cy.contains('button', '收起').click().should('have.attr', 'aria-expanded', 'false');
    cy.get('.demo-editor__panel').should('not.be.visible');
  });
}

it('releases a pending panel when it unmounts', () => {
  cy.mount(LiveCodesPanel, {
    props: { framework: 'vue', source: '<template />', mainFile: 'Example.vue' },
  });
  cy.mount({ template: '<p>已卸载</p>' });
  cy.contains('已卸载').should('be.visible');
  cy.get('iframe').should('not.exist');
});
