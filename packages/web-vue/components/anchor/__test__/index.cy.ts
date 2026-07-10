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
});
