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
    cy.get('.sd-selectable-card')
      .should('have.css', 'border-radius', '4px')
      .and('have.css', 'border-width', '1px')
      .and('have.css', 'box-shadow', 'none')
      .and('have.css', 'padding', '12px');
  });

  it('uses the restrained default typography scale', () => {
    cy.mount(SelectableCard, {
      props: {
        label: '标准版方案',
        isSelected: true,
        title: '标准版',
        value: '¥99 / 月',
        description: '适合小型团队协作',
      },
    });

    cy.get('.sd-selectable-card-title').should('have.css', 'font-size', '14px');
    cy.get('.sd-selectable-card-value')
      .should('have.css', 'font-size', '16px')
      .and('have.css', 'font-weight', '500');
    cy.get('.sd-selectable-card-content').should('have.css', 'gap', '8px');
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
