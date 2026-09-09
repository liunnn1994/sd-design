import Cascader from '../index';

describe('Cascader search lifecycle', () => {
  it('cancels pending search when unmounted', () => {
    cy.clock();
    const search = cy.spy().as('search');
    let searchTimer: number;
    cy.window().then((win) => {
      cy.spy(win, 'setTimeout').as('setTimer');
      cy.spy(win, 'clearTimeout').as('clearTimer');
    });
    cy.mount(Cascader, { props: { allowSearch: true, searchDelay: 1000, onSearch: search } });
    cy.get('input').type('query', { delay: 0 });
    cy.get('@setTimer').then((timer: any) => {
      const calls = timer.getCalls().filter((call: any) => call.args[1] === 1000);
      expect(calls.length).to.be.greaterThan(0);
      searchTimer = calls[calls.length - 1].returnValue;
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('@clearTimer').should((clearTimer) => {
      expect(clearTimer).to.have.been.calledWith(searchTimer);
    });
    cy.tick(1000);
    cy.get('@search').should('not.have.been.called');
  });
});
