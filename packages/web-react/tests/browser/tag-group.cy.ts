describe('React tag-group', () => {
  beforeEach(() => cy.visit('/tag-group.html'));

  it('opens TagGroup hidden items by keyboard focus and forwards close without removing controlled tags', () => {
    cy.contains('button', 'Mount TagGroup').click();
    cy.get('[data-testid="tag-group-fixed"] .sd-tag-group-item-counter')
      .should('have.text', '+2')
      .and('have.attr', 'aria-haspopup', 'true');
    cy.get('[data-testid="tag-group-fixed"] .sd-tag-close-btn').click();
    cy.get('[data-testid="tag-group-fixed"] .sd-tag-group-item-content').should(
      'have.class',
      'custom-group-tag',
    );
    cy.get('[data-testid="tag-group-close"]').should('have.text', '1');
    cy.get('[data-testid="tag-group-fixed"]').should('contain.text', 'Closable');
    cy.get('[data-testid="tag-group-fixed"] .sd-tag-group-counter-content').focus();
    cy.get('.sd-tag-group-popover:visible')
      .should('contain.text', 'Hidden one')
      .and('contain.text', 'Hidden two');
    cy.contains('button', 'Toggle TagGroup limit').click();
    cy.get('[data-testid="tag-group-fixed"] .sd-tag-group-item-counter').should('not.exist');
    cy.get('[data-testid="tag-group-fixed"] .sd-tag-group-item').should('have.length', 3);
    cy.contains('button', 'Read TagGroup ref').click();
    cy.get('[data-testid="tag-group-ref"]').should('have.text', 'SPAN');
    cy.contains('button', 'Empty TagGroup').click();
    cy.get('[data-testid="tag-group-fixed"]')
      .should('have.class', 'sd-tag-group-empty')
      .and('have.text', 'No tags');
  });

  it('recomputes responsive TagGroup counters on width and option changes', () => {
    cy.contains('button', 'Mount TagGroup').click();
    cy.get('[data-testid="tag-group-responsive"] .sd-tag-group-item-counter:visible').should(
      'have.text',
      '+1',
    );
    cy.contains('button', 'Append TagGroup option').click();
    cy.get('[data-testid="tag-group-responsive"] .sd-tag-group-item-counter:visible').should(
      'have.text',
      '+2',
    );
    cy.get('[data-testid="tag-group-responsive"] [data-part="item"]:visible').should(
      'have.length',
      2,
    );
    cy.contains('button', 'Resize TagGroup').click();
    cy.get('[data-testid="tag-group-responsive"] [data-part="item"]:visible').should(
      'have.length',
      4,
    );
    cy.get('[data-testid="tag-group-responsive"] .sd-tag-group-item-counter').should('not.exist');
    cy.get('[data-testid="tag-group-responsive"] [role="listitem"]').should('have.length', 4);
    cy.get('[data-testid="tag-group-responsive"] [data-part="content"]').should(($content) => {
      expect(parseFloat(getComputedStyle($content[0]).columnGap)).to.be.greaterThan(0);
      const items = $content.find('[data-part="item"]:visible').toArray();
      expect(new Set(items.map((item) => item.getBoundingClientRect().top)).size).to.equal(1);
    });
    cy.contains('button', 'Resize TagGroup').click();
    cy.get('[data-testid="tag-group-responsive"] .sd-tag-group-item-counter:visible').should(
      'have.text',
      '+2',
    );
    cy.contains('button', 'Use oversized TagGroup label').click();
    cy.get('[data-testid="tag-group-responsive"] [data-part="item"]:visible').should('not.exist');
    cy.get('[data-testid="tag-group-responsive"] .sd-tag-group-item-counter:visible').should(
      'have.text',
      '+4',
    );
    cy.get('[data-testid="tag-group-responsive"] .sd-tag-group-counter-content:visible').focus();
    cy.get('.sd-tag-group-popover:visible').should('contain.text', 'LongUnbrokenTagLabel');
  });

  it('preserves TagGroup mapped fields and custom item, label and counter render functions', () => {
    cy.contains('button', 'Mount TagGroup').click();
    cy.get('[data-testid="tag-group-custom"] a')
      .should('have.attr', 'href', '#docs')
      .and('have.attr', 'data-context', 'docs:0:false:false');
    cy.contains('[data-testid="tag-group-custom"] button', 'More 1').focus();
    cy.get('.sd-tag-group-popover:visible a')
      .should('have.attr', 'href', '#help')
      .and('have.attr', 'data-context', 'help:1:false:false');
    cy.get('[data-testid="tag-group-label"]').should('contain.text', 'First label');
    cy.contains('button', 'Toggle TagGroup label').click();
    cy.get('[data-testid="tag-group-label"] b').should('contain.text', 'Custom function');
    cy.contains('button', 'Unmount TagGroup').click();
    cy.get('.sd-tag-group-popover').should('not.exist');
  });
});
