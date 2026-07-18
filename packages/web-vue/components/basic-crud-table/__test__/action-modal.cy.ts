import ActionDemo from '../../../../sd-vue-docs/src/components/generated/basic-crud-table/action.vue';

describe('action demo modal', () => {
  it('新建弹窗包含完整的表单字段', () => {
    // 回归：自定义操作 demo 的新建/编辑弹窗曾缺少 modalFormProps，打开是空的。
    cy.mount(ActionDemo);
    cy.contains('新建').click();
    cy.get('.sd-modal').should('be.visible');
    cy.get('.sd-modal .sd-input').should('exist'); // 规则名称
    cy.get('.sd-modal .sd-select').should('exist'); // 级别
    cy.get('.sd-modal .sd-switch').should('be.visible'); // 启用
  });

  it('新建提交后在 :table-data 模式下新增一行', () => {
    cy.mount(ActionDemo);
    cy.contains('新建').click();
    // .sd-input 就是规则名称输入框本身（input.tsx 的 <input class="sd-input">）
    cy.get('.sd-modal .sd-input').type('新规则').should('have.value', '新规则');
    cy.get('.sd-modal-footer').contains('确定').click();
    // modal 关闭后元素仍在 DOM（v-show 隐藏，非 v-if 移除），故用 not.be.visible
    cy.get('.sd-modal').should('not.be.visible');
    cy.contains('新规则').should('exist');
  });
});
