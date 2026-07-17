import Anchor from '../index';

describe('Anchor', () => {
  it('should emit change & select on link click', () => {
    cy.mount(Anchor, {
      slots: {
        default:
          '<sd-anchor-link href="#anchor1">Anchor1</sd-anchor-link>' +
          '<sd-anchor-link href="#anchor2">Anchor2</sd-anchor-link>',
      },
    });
    cy.get('a').first().click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['#anchor1']);
      expect(wrapper.emitted('select')?.[0]).to.deep.equal(['#anchor1', '#anchor1']);
    });
  });

  it('exposes navigation role and aria-current on the active link', () => {
    cy.mount(Anchor, {
      slots: {
        default:
          '<sd-anchor-link href="#anchor1">Anchor1</sd-anchor-link>' +
          '<sd-anchor-link href="#anchor2">Anchor2</sd-anchor-link>',
      },
    });
    cy.get('.sd-anchor').should('have.attr', 'role', 'navigation');
    cy.get('a').first().click();
    // 点击后该链接成为当前锚点 → aria-current=location
    cy.get('a').first().should('have.attr', 'aria-current', 'location');
  });
});
