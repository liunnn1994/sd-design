import { moveMouseAway, moveMouseTo } from '../../../web-core/tests/browser/hover-intent';

describe('React link', () => {
  beforeEach(() => cy.visit('/text-controls.html'));

  it('blocks disabled and loading link actions and retains icon and overflow hints', () => {
    cy.get('[data-testid="disabled-link"]').should('not.have.attr', 'href');
    cy.get('[data-testid="disabled-link"]').click();
    cy.get('[data-testid="loading-link"]').click();
    cy.location('hash').should('eq', '');
    cy.get('[data-testid="link-clicks"]').should('have.text', '0');
    cy.get('[data-testid="normal-link"]').click();
    cy.location('hash').should('eq', '#allowed');
    cy.get('[data-testid="link-clicks"]').should('have.text', '1');
    cy.get('[data-testid="icon-link"]')
      .should('have.class', 'sd-link-icon-only')
      .find('.sd-link-icon > span')
      .trigger('mouseover');
    cy.get('[role="tooltip"]').should('contain.text', '图标说明');
    cy.get('[data-testid="icon-link"] .sd-link-icon > span').trigger('mouseout');
    moveMouseTo('[data-testid="ellipsis-link"] .sd-link-content');
    cy.get('[role="tooltip"]').should('contain.text', '链接长文本内容在悬浮时完整显示');
    moveMouseAway();
  });

  it('updates hover defaults, the icon and ellipsis when link presentation props change', () => {
    const link = '[data-testid="normal-link"]';
    const icon = '[data-testid="icon-link"]';
    const text = '[data-testid="ellipsis-link"] .sd-link-content';
    cy.get(link).should('not.have.class', 'sd-link-hoverless');
    cy.get(icon).should('have.class', 'sd-link-hoverless');
    cy.get(text).should('have.class', 'sd-ellipsis');
    cy.contains('button', '切换链接样式').click();
    cy.get(link)
      .should('have.class', 'sd-link-hoverless')
      .and('have.class', 'sd-link-status-warning');
    cy.get(`${link} .sd-link-icon strong`).should('have.text', '自定义链接图标');
    cy.get(icon).should('not.have.class', 'sd-link-hoverless');
    cy.get(text).should('not.have.class', 'sd-ellipsis').and('contain.text', '链接长文本');
    cy.contains('button', '切换链接样式').click();
    cy.get(link).should('not.have.class', 'sd-link-hoverless');
    cy.get(icon).should('have.class', 'sd-link-hoverless');
    cy.get(text).should('have.class', 'sd-ellipsis');
  });
});
