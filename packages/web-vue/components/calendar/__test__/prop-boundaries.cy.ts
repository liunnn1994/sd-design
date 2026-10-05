import './real-transitions';
import Calendar from '../index';

describe('Calendar reactive date boundaries', () => {
  it('navigates after viewDate changes to another valid date string', () => {
    cy.mount(Calendar, { props: { view: 'month', viewDate: '2025-01-08', locale: 'en-us' } });
    cy.get('.sd-calendar__title').should('contain.text', 'January 2025');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ viewDate: '2025-02-08' }));
    cy.get('.sd-calendar__title').should('contain.text', 'February 2025');
  });

  it('clears the selected cell when selectedDate is reset to its empty default', () => {
    cy.mount(Calendar, {
      props: { view: 'month', viewDate: '2025-01-08', selectedDate: '2025-01-09' },
    });
    cy.get('.sd-calendar__cell--selected').should('have.length', 1);
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ selectedDate: '' }));
    cy.get('.sd-calendar__cell--selected').should('not.exist');
  });

  for (const bound of ['minDate', 'maxDate'] as const) {
    it(`honors ${bound} with a zero timestamp`, () => {
      const viewDate = new Date(0);
      viewDate.setDate(viewDate.getDate() + (bound === 'minDate' ? -1 : 1));
      cy.mount(Calendar, { props: { view: 'day', viewDate, [bound]: new Date(0) } });
      cy.get('.sd-calendar__cell').should('have.class', 'sd-calendar__cell--disabled');
      cy.get('.sd-calendar__cell').click({ force: true });
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:selectedDate')).to.equal(undefined);
      });
    });
  }
});
