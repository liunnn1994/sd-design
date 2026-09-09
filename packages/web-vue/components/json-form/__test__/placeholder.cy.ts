import JsonForm from '../index';

describe('JsonForm placeholder configuration', () => {
  it('respects an empty placeholder and restores generated text when the override is removed', () => {
    cy.mount(JsonForm, {
      props: {
        model: { name: '' },
        schemas: [
          { field: 'name', label: '姓名', type: 'input', componentProps: { placeholder: '' } },
        ],
      },
    });
    cy.get('input').should('have.attr', 'placeholder', '');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({
        schemas: [
          {
            field: 'name',
            label: '姓名',
            type: 'input',
            componentProps: { placeholder: '自定义提示' },
          },
        ],
      }),
    );
    cy.get('input').should('have.attr', 'placeholder', '自定义提示');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({
        schemas: [{ field: 'name', label: '新姓名', type: 'input' }],
      }),
    );
    cy.get('input').should('have.attr', 'placeholder', '请输入新姓名');
    cy.get('input').type('Alice').should('have.value', 'Alice');
  });
});
