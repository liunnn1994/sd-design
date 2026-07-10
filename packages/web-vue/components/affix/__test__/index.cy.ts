import Affix from '../index';

describe('Affix Render', () => {
  // Affix reads its wrapper rect on scroll to decide whether to fix. We drive
  // that by stubbing getBoundingClientRect (as the vitest test did) and
  // dispatching a real `scroll` event — no need to mock addEventListener in a
  // real browser.
  let rect: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
  };

  beforeEach(() => {
    rect = { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };
    cy.stub(HTMLElement.prototype, 'getBoundingClientRect').callsFake(() => rect);
  });

  const scrollWindow = () => {
    cy.window().then((win) => {
      win.dispatchEvent(new win.Event('scroll'));
    });
  };

  it('should fix to top when scrolled past offsetTop', () => {
    cy.mount(Affix, { slots: { default: '<div>abc</div>' } });
    cy.get('.sd-affix').should('not.exist');
    cy.then(() => {
      rect.top = -100;
    });
    scrollWindow();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
    cy.get('.sd-affix').should('exist');
  });

  it('should support offsetBottom', () => {
    cy.mount(Affix, { props: { offsetBottom: 20 }, slots: { default: '<div>abc</div>' } });
    cy.get('.sd-affix').should('not.exist');
    cy.then(() => {
      rect.bottom = 2500;
    });
    scrollWindow();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
    cy.get('.sd-affix').should('exist');
  });
});
