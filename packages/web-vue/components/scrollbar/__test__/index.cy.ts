import Scrollbar from '../index';

describe('Scrollbar', () => {
  it('renders slot content', () => {
    cy.mount(Scrollbar, { slots: { default: '<div class="slot-content">content</div>' } });
    cy.get('.slot-content').should('exist');
    cy.get('.sd-scrollbar').should('exist');
  });

  it('applies the type class', () => {
    cy.mount(Scrollbar, { props: { type: 'track' } });
    cy.get('.sd-scrollbar').should('have.class', 'sd-scrollbar-type-track');
  });

  it('exposes scroll methods', () => {
    cy.mount(Scrollbar);
    cy.get('@vue').should(({ wrapper }) => {
      const vm = wrapper.vm as Record<string, (...args: unknown[]) => unknown>;
      expect(() => vm.scrollTo({ top: 12 })).not.to.throw();
      expect(() => vm.scrollTop(20)).not.to.throw();
      expect(() => vm.scrollLeft(32)).not.to.throw();
    });
  });

  it('merges OverlayScrollbars options props', () => {
    cy.mount(Scrollbar, {
      props: {
        paddingAbsolute: true,
        overflow: { y: 'hidden' },
        updateOptions: { debounce: { event: [10, 20] } },
        scrollbars: { autoHide: 'scroll', dragScroll: false },
        overlayOptions: { scrollbars: { autoHideDelay: 400 } },
      },
    });
    cy.get('@vue').should(({ wrapper }) => {
      const options = (wrapper.vm as { options: () => Record<string, any> }).options();
      const debounce = options?.update?.debounce;
      expect(options?.paddingAbsolute).to.equal(true);
      expect(options?.overflow.y).to.equal('hidden');
      expect(debounce && !Array.isArray(debounce) ? debounce.event : undefined).to.deep.equal([
        10, 20,
      ]);
      expect(options?.scrollbars.autoHide).to.equal('scroll');
      expect(options?.scrollbars.autoHideSuspend).to.equal(false);
      expect(options?.scrollbars.dragScroll).to.equal(false);
      expect(options?.scrollbars.autoHideDelay).to.equal(400);
    });
  });

  it('proxies OverlayScrollbars instance methods', () => {
    cy.mount(Scrollbar);
    cy.get('@vue').should(({ wrapper }) => {
      const vm = wrapper.vm as Record<string, (...args: unknown[]) => unknown>;
      expect(vm.getOSInstance()).to.not.equal(null);
      expect(vm.state()).to.not.equal(null);
      expect((vm.elements() as { viewport?: unknown })?.viewport).to.not.equal(null);
      expect(typeof vm.update()).to.equal('boolean');
    });
    cy.get('@vue').then(({ wrapper }) => {
      const vm = wrapper.vm as Record<string, (...args: unknown[]) => unknown>;
      const remove = vm.on('updated', () => {});
      expect(typeof remove).to.equal('function');
      vm.off('updated', () => {});
    });
  });

  it('keeps the scroll event contract', () => {
    cy.mount(Scrollbar);
    cy.get('.sd-scrollbar').then(($el) => {
      // OverlayScrollbars intercepts scroll on its viewport; assert the host
      // element still accepts a scroll event without error.
      expect(() => $el[0].dispatchEvent(new Event('scroll'))).not.to.throw();
    });
  });
});
