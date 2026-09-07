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

describe('Affix Behavior', () => {
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

  it('should emit change with true when fixed and false when unfixed', () => {
    cy.mount(Affix, { slots: { default: '<div>abc</div>' } });
    cy.get('.sd-affix').should('not.exist');
    cy.then(() => {
      rect.top = -100;
    });
    scrollWindow();
    cy.get('@vue').should(({ wrapper }) => {
      const calls = wrapper.emitted('change') ?? [];
      expect(calls).to.have.length(1);
      expect(calls[0]).to.deep.equal([true]);
    });
    cy.get('.sd-affix')
      .should('have.attr', 'style')
      .and('include', 'position: fixed')
      .and('include', 'top: 0px');
    // the placeholder keeps the wrapper's original space while fixed
    cy.get('.sd-affix')
      .prev()
      .should('have.attr', 'style')
      .and('include', 'width:')
      .and('include', 'height:');
    // scroll back: unfixed again
    cy.then(() => {
      rect.top = 0;
    });
    scrollWindow();
    cy.get('@vue').should(({ wrapper }) => {
      const calls = wrapper.emitted('change') ?? [];
      expect(calls).to.have.length(2);
      expect(calls[1]).to.deep.equal([false]);
    });
    cy.get('.sd-affix').should('not.exist');
  });

  it('should apply offsetTop as the fixed top position', () => {
    cy.mount(Affix, { props: { offsetTop: 60 }, slots: { default: '<div>abc</div>' } });
    cy.get('.sd-affix').should('not.exist');
    cy.then(() => {
      rect.top = -100;
    });
    scrollWindow();
    cy.get('.sd-affix')
      .should('have.attr', 'style')
      .and('include', 'position: fixed')
      .and('include', 'top: 60px');
  });

  it('should not emit change when the scroll does not cross the threshold', () => {
    cy.mount(Affix, { slots: { default: '<div>abc</div>' } });
    cy.then(() => {
      rect.top = 100;
    });
    scrollWindow();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
    cy.get('.sd-affix').should('not.exist');
  });

  it('should prefer offsetBottom when both offsetTop and offsetBottom are set', () => {
    cy.mount(Affix, {
      props: { offsetTop: 10, offsetBottom: 20 },
      slots: { default: '<div>affix</div>' },
    });
    cy.get('.sd-affix').should('not.exist');
    cy.then(() => {
      rect.bottom = 2500;
    });
    scrollWindow();
    cy.get('.sd-affix')
      .should('have.attr', 'style')
      .and('include', 'position: fixed')
      .and('include', 'bottom: 20px')
      .and('not.include', 'top:');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });

  it('should update position via the exposed updatePosition method without scroll', () => {
    cy.mount(Affix, { slots: { default: '<div>abc</div>' } });
    cy.get('.sd-affix').should('not.exist');
    cy.then(() => {
      rect.top = -100;
    });
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.vm.updatePosition();
    });
    cy.get('.sd-affix').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });

  it('should fix relative to a custom target and listen to its scroll events', () => {
    cy.document().then((doc) => {
      const targetEl = doc.createElement('div');
      targetEl.id = 'affix-scroll-target';
      doc.body.appendChild(targetEl);

      cy.mount(Affix, {
        props: { target: '#affix-scroll-target' },
        slots: { default: '<div>abc</div>' },
      });
      cy.get('.sd-affix').should('not.exist');
      cy.then(() => {
        // shadow the prototype stub for the target element only: its rect
        // decides the fix position (top: 0px), the wrapper rect decides when.
        // 直接赋值实例属性以遮蔽原型 stub，避免 sinon "already wrapped" 冲突
        (targetEl as any).getBoundingClientRect = () => ({
          top: 0,
          bottom: 300,
          left: 0,
          right: 0,
          width: 0,
          height: 300,
        });
        rect.top = -50;
      });
      cy.window().then((win) => {
        targetEl.dispatchEvent(new win.Event('scroll'));
      });
      cy.get('@vue').should(({ wrapper }) => {
        const calls = wrapper.emitted('change') ?? [];
        expect(calls).to.have.length(1);
        expect(calls[0]).to.deep.equal([true]);
      });
      cy.get('.sd-affix')
        .should('have.attr', 'style')
        .and('include', 'position: fixed')
        .and('include', 'top: 0px');
    });
  });

  it('should respond to scroll events on targetContainer', () => {
    cy.document().then((doc) => {
      const containerEl = doc.createElement('div');
      containerEl.id = 'affix-container';
      doc.body.appendChild(containerEl);

      cy.mount(Affix, {
        props: { targetContainer: containerEl },
        slots: { default: '<div>abc</div>' },
      });
      cy.get('.sd-affix').should('not.exist');
      cy.then(() => {
        rect.top = -100;
      });
      cy.window().then((win) => {
        containerEl.dispatchEvent(new win.Event('scroll'));
      });
      cy.get('@vue').should(({ wrapper }) => {
        const calls = wrapper.emitted('change') ?? [];
        expect(calls).to.have.length(1);
        expect(calls[0]).to.deep.equal([true]);
      });
      cy.get('.sd-affix').should('exist');
    });
  });
});
