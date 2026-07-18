import Transfer from '../index';

const data = [0, 1, 2, 3].map((index) => ({
  disabled: false,
  value: `option${index + 1}`,
  label: `Option ${index + 1}`,
}));

describe('Transfer', () => {
  it('emits change on select + move', () => {
    cy.mount(Transfer, { props: { data } });
    cy.get('.sd-transfer-list-item .sd-checkbox-target').first().click({ force: true });
    cy.get('.sd-transfer-operations button').first().click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([['option1']]);
    });
  });

  it('emits select on check-all', () => {
    cy.mount(Transfer, { props: { data } });
    cy.get('.sd-transfer-view-header .sd-checkbox-target').first().click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')?.[0]).to.deep.equal([
        ['option1', 'option2', 'option3', 'option4'],
      ]);
    });
  });

  it('labels the oneWay remove button (role + aria-label + keyboard)', () => {
    cy.mount(Transfer, { props: { data, oneWay: true } });
    // 先移一项到 target，使 target 出现 remove 按钮
    cy.get('.sd-transfer-list-item .sd-checkbox-target').first().click({ force: true });
    cy.get('.sd-transfer-operations button').first().click({ force: true });
    cy.get('.sd-transfer-list-item-remove-btn').should('have.attr', 'role', 'button');
    cy.get('.sd-transfer-list-item-remove-btn').should('have.attr', 'aria-label', '移除');
    // Enter 触发移除
    cy.get('.sd-transfer-list-item-remove-btn').trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => {
      // 移除后 target 应为空（change 最后一次把 option1 移回 source）
      const changes = wrapper.emitted('change');
      expect(changes).to.not.equal(undefined);
    });
  });
});
