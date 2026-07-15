import SelectableCard from '../index';

describe('SelectableCard', () => {
  it('renders content and accessible selection state', () => {
    cy.mount(SelectableCard, {
      props: { label: '方案 A', isSelected: true },
      slots: { default: '方案内容' },
    });

    cy.contains('方案内容').should('exist');
    cy.get('input[type="checkbox"][aria-label="方案 A"]').should('be.checked');
    cy.get('.sd-selectable-card').should('have.class', 'sd-selectable-card--selected');
    cy.get('.sd-selectable-card').should('have.css', 'border-radius', '8px');
  });

  it('renders stat content, slots, size and Tag color classes', () => {
    cy.mount(SelectableCard, {
      props: {
        label: '收入指标',
        isSelected: true,
        title: '本月收入',
        value: '¥128,000',
        description: '较上月增长 18%',
        color: 'green',
        variant: 'soft',
        size: 'large',
        layout: 'horizontal',
      },
      slots: { figure: '<span data-testid="figure">¥</span>' },
    });

    cy.get('.sd-selectable-card')
      .should('have.class', 'sd-selectable-card--color-green')
      .and('have.class', 'sd-selectable-card--soft')
      .and('have.class', 'sd-selectable-card--size-large')
      .and('have.class', 'sd-selectable-card--layout-horizontal');
    cy.get('.sd-selectable-card-title').should('contain.text', '本月收入');
    cy.get('.sd-selectable-card-value').should('contain.text', '¥128,000');
    cy.get('.sd-selectable-card-description').should('contain.text', '较上月增长 18%');
    cy.get('[data-testid="figure"]').should('exist');
    cy.get('.sd-selectable-card').should('have.css', 'background-color', 'rgb(232, 255, 234)');
  });

  it('emits the next selection state when clicked', () => {
    const onChange = cy.spy().as('onChange');
    cy.mount(SelectableCard, {
      props: { label: '方案 A', isSelected: false, onChange },
      slots: { default: '<span>选择方案</span>' },
    });

    cy.contains('选择方案').click();
    cy.get('@onChange').should('have.been.calledOnceWith', true);
  });

  it('does not toggle from nested controls or while disabled', () => {
    const onChange = cy.spy().as('onChange');
    cy.mount(SelectableCard, {
      props: { label: '方案 A', isSelected: false, isDisabled: true, onChange },
      slots: { default: '<button type="button">查看详情</button>' },
    });

    cy.get('input[type="checkbox"]').should('be.disabled');
    cy.get('.sd-selectable-card').click();
    cy.get('@onChange').should('not.have.been.called');
  });
});
