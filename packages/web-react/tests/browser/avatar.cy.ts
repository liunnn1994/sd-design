describe('React avatar', () => {
  beforeEach(() => cy.visit('/avatar.html'));

  it('inherits avatar group shape and size and updates stacking and RTL overlap', () => {
    cy.get('[data-testid="avatar-group"] > .sd-avatar')
      .should('have.length', 3)
      .each(($avatar) => {
        expect($avatar).to.have.class('sd-avatar-square');
        expect($avatar[0].style.width).to.eq('32px');
      });
    cy.get('[data-testid="avatar-group"] > .sd-avatar')
      .eq(1)
      .should('have.css', 'margin-left', '-8px')
      .and('have.css', 'z-index', '3');
    cy.contains('button', '切换头像层级').click();
    cy.get('[data-testid="avatar-group"] > .sd-avatar').eq(1).should('have.css', 'z-index', '2');
    cy.contains('button', '切换头像 RTL').click();
    cy.get('[data-testid="avatar-group"]').should('have.class', 'sd-avatar-group-rtl');
    cy.get('[data-testid="avatar-group"] > .sd-avatar')
      .eq(1)
      .should('have.css', 'margin-right', '-8px')
      .and('have.css', 'margin-left', '0px');
  });

  it('shows overflow avatars in a popover and removes the overflow trigger when limits change', () => {
    cy.get('[data-testid="avatar-group"] .sd-avatar-group-max-count-avatar')
      .should('contain.text', '+2')
      .click();
    cy.get('.sd-avatar-group-popover > .sd-avatar').should('have.length', 2);
    cy.get('.sd-avatar-group-popover').should('contain.text', 'C').and('contain.text', 'D');
    cy.get('.sd-avatar-group-popover > .sd-avatar')
      .eq(1)
      .should(($avatar) =>
        expect(parseFloat(getComputedStyle($avatar[0]).marginLeft)).to.be.greaterThan(0),
      );
    cy.contains('button', 'Toggle last avatar').click();
    cy.get('[data-testid="avatar-group"] .sd-avatar-group-max-count-avatar')
      .should('contain.text', '+1')
      .click();
    cy.get('.sd-avatar-group-popover > .sd-avatar').should('have.length', 1).and('have.text', 'C');
    cy.contains('button', 'Toggle last avatar').click();
    cy.get('[data-testid="avatar-group"] .sd-avatar-group-max-count-avatar').should(
      'contain.text',
      '+2',
    );
    cy.contains('button', '切换头像数量限制').click();
    cy.get('[data-testid="avatar-group"] .sd-avatar-group-max-count-avatar').should('not.exist');
    cy.get('[data-testid="avatar-group"] > .sd-avatar').should('have.length', 4);
    cy.get('.sd-avatar-group-popover').should('not.exist');
  });

  it('detects a child-rendered image and clears stale scaling when returning to short text', () => {
    const avatar = () => cy.get('[data-testid="text-avatar"]');
    avatar()
      .find('.sd-avatar-text')
      .should(([$text]) => expect($text.style.transform).to.contain('scale('));
    cy.contains('button', 'Show slotted avatar image').click();
    avatar().find('.sd-avatar-text').should('not.exist');
    avatar().find('.sd-avatar-image img').should('have.attr', 'alt', 'Slotted avatar');
    avatar().find('.sd-avatar-image img').should('have.prop', 'naturalWidth', 10);
    cy.contains('button', 'Shorten avatar text').click();
    avatar().find('.sd-avatar-image').should('not.exist');
    avatar()
      .find('.sd-avatar-text')
      .should(([$text]) => {
        expect($text.textContent).to.equal('A');
        expect($text.style.transform).to.equal('');
      });
    avatar().should('have.css', 'width', '32px');
  });

  it('applies group font scaling preferences to child avatars', () => {
    cy.get('[data-testid="avatar-group"] .sd-avatar-text')
      .first()
      .should(($text) => expect($text[0].style.transform).to.eq(''));
    cy.contains('button', '启用组字体缩放').click();
    cy.get('[data-testid="avatar-group"] .sd-avatar-text')
      .first()
      .should(($text) => expect($text[0].style.transform).to.contain('scale('));
    cy.contains('button', '启用组字体缩放').click();
    cy.get('[data-testid="avatar-group"] .sd-avatar-text')
      .first()
      .should(($text) => expect($text[0].style.transform).to.eq(''));
  });

  it('scales avatar text and recovers a failed image when its URL changes', () => {
    cy.get('[data-testid="text-avatar"]').should('have.css', 'width', '32px');
    cy.get('[data-testid="image-avatar"]').should('have.css', 'width', '32px');
    cy.get('[data-testid="text-avatar"] .sd-avatar-text').should(($text) => {
      expect($text[0].style.transform).to.contain('scale(');
    });
    cy.get('[data-testid="image-avatar"]').should('contain.text', '头像失败');
    cy.get('[data-testid="avatar-events"]').should('have.text', 'error');
    cy.contains('button', '重试头像').click();
    cy.get<HTMLImageElement>('[data-testid="image-avatar"] img')
      .should('have.prop', 'naturalWidth', 10)
      .and('have.attr', 'alt', 'avatar');
    cy.get('[data-testid="image-avatar"] img').should('have.css', 'object-fit', 'contain');
    cy.get('[data-testid="image-avatar"]').should('not.contain.text', '头像失败');
    cy.get('[data-testid="avatar-events"]').should('have.text', 'error|load');
  });

  it('recalculates stacking and overlap after keyed members change order', () => {
    const avatars = () => cy.get('[data-testid="avatar-group"] > .sd-avatar');
    avatars().first().should('have.text', 'LongName').and('have.css', 'z-index', '4');
    cy.contains('button', '交换头像顺序').click();
    avatars()
      .first()
      .should('have.text', 'B')
      .and('have.css', 'z-index', '4')
      .and('have.css', 'margin-left', '0px');
    avatars()
      .eq(1)
      .should('have.text', 'LongName')
      .and('have.css', 'z-index', '3')
      .and('have.css', 'margin-left', '-8px');
  });

  it('moves the button overlay in RTL and updates its wrapper and style in mask mode', () => {
    const overlay = () => cy.get('[data-testid="trigger-avatar"] .sd-avatar-trigger-icon-button');
    overlay().should('have.css', 'right', '-4px').and('have.css', 'color', 'rgb(22, 93, 255)');
    cy.contains('button', '切换编辑方向').click();
    overlay().should('have.css', 'left', '-4px');
    overlay().find('button').click();
    overlay().should('not.exist');
    cy.get('[data-testid="trigger-avatar"] .sd-avatar-trigger-icon-mask').should(
      'have.css',
      'color',
      'rgb(255, 255, 255)',
    );
  });
});
