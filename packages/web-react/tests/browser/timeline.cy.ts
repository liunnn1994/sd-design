describe('React timeline', () => {
  beforeEach(() => cy.visit('/timeline.html'));

  it('updates timeline terminal lines and visual ordering when reversed and reordered', () => {
    cy.get('[data-testid="timeline"] > .sd-timeline-item')
      .should('have.length', 4)
      .last()
      .should('have.class', 'sd-timeline-item-last');
    cy.contains('button', '倒序时间轴').click();
    cy.get('[data-testid="timeline-A"]').should('have.class', 'sd-timeline-item-last');
    cy.get('[data-testid="timeline"]').should('have.css', 'flex-direction', 'column-reverse');
    cy.get('[data-testid="timeline"] > .sd-timeline-item').then(($items) =>
      expect($items[3].getBoundingClientRect().top).to.be.lessThan(
        $items[0].getBoundingClientRect().top,
      ),
    );
    cy.contains('button', '重排时间轴').click();
    cy.get('[data-testid="timeline-C"]')
      .should('have.class', 'sd-timeline-item-last')
      .and('have.class', 'sd-timeline-item-vertical-left');
    cy.get('[data-testid="timeline-A"]')
      .should('not.have.class', 'sd-timeline-item-last')
      .and('have.class', 'sd-timeline-item-vertical-right');
    cy.get('[data-testid="timeline-B"]').should('not.exist');
  });

  it('merges pending spin settings and handles custom pending content and its removal', () => {
    cy.get('[data-testid="timeline"] .sd-dot-loading').should('exist');
    cy.get('[data-testid="timeline"] .sd-spin-tip').should('have.text', '局部等待');
    cy.contains('button', '切换待办节点').click();
    cy.get('[data-testid="timeline"] > .sd-timeline-item')
      .should('have.length', 3)
      .last()
      .should('have.class', 'sd-timeline-item-last');
    cy.contains('button', '切换待办内容').click();
    cy.get('[data-testid="timeline"] > .sd-timeline-item').should('have.length', 4);
    cy.get('[data-testid="timeline"] .sd-timeline-item-dot-custom').should('have.text', '待办图标');
    cy.get('[data-testid="timeline"]').should('contain.text', '自定义待办');
    cy.contains('button', '切换待办内容').click();
    cy.get('[data-testid="timeline"] > .sd-timeline-item').should('have.length', 3);
  });

  it('applies timeline positions, labels, dot styles and horizontal line styles', () => {
    cy.get('[data-testid="timeline-A"] .sd-timeline-item-dot').should(
      'have.css',
      'border-color',
      'rgb(10, 180, 42)',
    );
    cy.get('[data-testid="timeline-A"] > .sd-timeline-item-label').should('have.text', '时间 A');
    cy.get('[data-testid="timeline-A"] .sd-timeline-item-dot-line').should(
      'have.css',
      'border-left-style',
      'dotted',
    );
    cy.contains('button', '切换时间轴方向').click();
    cy.get('[data-testid="timeline-A"]').should('have.class', 'sd-timeline-item-horizontal-top');
    cy.get('[data-testid="timeline-B"]').should('have.class', 'sd-timeline-item-horizontal-bottom');
    cy.get('[data-testid="timeline-A"] .sd-timeline-item-dot-line')
      .should('have.css', 'border-top-style', 'dotted')
      .and('have.css', 'border-color', 'rgb(200, 20, 30)');
    cy.get('[data-testid="override-timeline"] > .sd-timeline-item')
      .first()
      .should('have.class', 'sd-timeline-item-horizontal-bottom');
    cy.get('[data-testid="override-timeline"] > .sd-timeline-item')
      .last()
      .should('have.class', 'sd-timeline-item-horizontal-top');
  });
});
