import './real-transitions';
import Calendar from '../index';

describe('Calendar initial view adapter', () => {
  it('normalizes a copied initial Date without changing the caller date', () => {
    const input = new Date(2026, 9, 20, 12, 45, 30, 100);
    cy.mount(Calendar, { props: { view: 'day', viewDate: input, locale: 'en-us' } });
    cy.get('@vue').should(({ wrapper }) => {
      const view = wrapper.vm.view;
      expect(view.viewDate.getHours()).to.equal(0);
      expect(view.viewDate.getMinutes()).to.equal(0);
      expect(view.viewDate.getDate()).to.equal(20);
      expect(view.viewDate).not.to.equal(input);
      expect(input.getHours()).to.equal(12);
      expect(input.getMilliseconds()).to.equal(100);
    });
  });

  it('retains first-available fallback for an unavailable initial view', () => {
    cy.mount(Calendar, {
      props: { view: 'week', views: ['day', 'month'], viewDate: '2026-10-20', locale: 'en-us' },
    });
    cy.get('.sd-calendar').should('have.class', 'sd-calendar--day-view');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.vm.view.id).to.equal('day');
      expect(wrapper.vm.view.viewDate.getDate()).to.equal(20);
    });
  });
});
