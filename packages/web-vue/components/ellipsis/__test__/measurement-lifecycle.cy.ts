import Ellipsis from '../ellipsis.vue';

describe('Ellipsis measurement lifecycle', () => {
  it('recalculates truncation when the container grows and shrinks', () => {
    cy.mount(Ellipsis, {
      props: { tooltip: false },
      attrs: { style: 'width: 60px' },
      slots: { default: 'A moderately long text' },
    });
    cy.get('.sd-ellipsis').should('have.attr', 'title', 'A moderately long text');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ style: 'width: 800px' }));
    cy.get('.sd-ellipsis').should('not.have.attr', 'title');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ style: 'width: 60px' }));
    cy.get('.sd-ellipsis').should('have.attr', 'title', 'A moderately long text');
  });

  it('resolves measurement requests made after the empty-content fallback', () => {
    cy.clock();
    cy.mount(Ellipsis, { props: { tooltip: false, lineClamp: 1 } });
    cy.tick(250);
    cy.get('@vue').then(({ wrapper }) => wrapper.vm.waitForMeasurement());
  });

  it('settles an outstanding measurement request on unmount', () => {
    cy.clock();
    cy.mount(Ellipsis, { props: { tooltip: false, lineClamp: 1 } });
    cy.get('@vue').then(({ wrapper }) => {
      const measurement = wrapper.vm.waitForMeasurement();
      wrapper.unmount();
      return measurement;
    });
  });
});
