describe('React wrap', () => {
  beforeEach(() => cy.visit('/wrap.html'));

  it('preserves keyed wrap item elements when the expanded list is reordered', () => {
    cy.contains('button', '展开所有项目').click();
    cy.get('[data-testid="wrap"] [data-part="item"]')
      .should('have.length', 12)
      .first()
      .then(($first) => {
        const first = $first[0];
        cy.contains('button', '反转项目顺序').click();
        cy.get('[data-testid="wrap"] [data-part="item"]')
          .last()
          .should(($last) => {
            expect($last[0]).to.eq(first);
            expect($last.text()).to.eq('Item 1');
          });
      });
  });

  it('fits whole wrap items, reports hidden items and expands through ref controls', () => {
    cy.get('[data-testid="wrap-clamped"]').should('have.text', 'true');
    cy.get('[data-testid="wrap"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.at.most(49),
    );
    cy.get('[data-testid="wrap"] [data-part="item"]:visible')
      .its('length')
      .then((count) => {
        cy.get('[data-testid="wrap"] [data-part="after"]').should(
          'have.text',
          `还有 ${12 - count} 项`,
        );
      });
    cy.contains('button', '展开所有项目').click();
    cy.get('[data-testid="wrap"] [data-part="item"]:visible').should('have.length', 12);
    cy.contains('button', '折叠项目').click();
    cy.get('[data-testid="wrap-clamped"]').should('have.text', 'true');
    cy.get('[data-testid="wrap"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.at.most(49),
    );
  });

  it('recomputes wrap item counts for a wider container and a replacement list', () => {
    cy.get('[data-testid="wrap-clamped"]').should('have.text', 'true');
    cy.get('[data-testid="wrap"]').should(($root) => {
      expect($root[0].getBoundingClientRect().height).to.be.at.most(49);
      expect($root.find('[data-part="item"]:visible')).to.have.length(5);
    });
    cy.contains('button', '改变项目宽度').click();
    cy.get('[data-testid="wrap"]').should('have.css', 'width', '460px');
    cy.get('[data-testid="wrap"] [data-part="item"]:visible').should('have.length', 12);
    cy.contains('button', '改变项目数量').click();
    cy.get('[data-testid="wrap"] [data-part="item"]:visible').should('have.length', 2);
    cy.get('[data-testid="wrap-clamped"]').should('have.text', 'false');
    cy.get('[data-testid="wrap"] [data-part="after"]').should('have.text', '还有 0 项');
  });

  it('keeps controlled wrap expansion unchanged until the parent writes back', () => {
    cy.contains('button', '拒绝展开').click();
    cy.get('[data-testid="wrap-requests"]').should('have.text', '1');
    cy.get('[data-testid="wrap-controlled"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.at.most(49),
    );
    cy.get('[data-testid="wrap-controlled"] [data-part="item"]:visible').should(($items) =>
      expect($items.length).to.be.lessThan(12),
    );
  });
});
