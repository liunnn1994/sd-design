import './real-transitions';
import Calendar from '../index';

describe('Calendar horizontal week with hidden weekdays', () => {
  it('renders five weekday rows when weekends are hidden', () => {
    cy.mount(Calendar, {
      props: { view: 'week', viewDate: '2025-01-08', horizontal: true, hideWeekends: true },
    });
    cy.get('.sd-calendar__body .sd-calendar__cell').should('have.length', 5);
    cy.get('.sd-calendar__body').should(($body) => {
      expect($body[0].style.getPropertyValue('--sd-calendar-grid-columns')).to.equal('1');
      expect($body[0].style.getPropertyValue('--sd-calendar-grid-rows')).to.equal('5');
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ hideWeekends: false }));
    cy.get('.sd-calendar__body .sd-calendar__cell').should('have.length', 7);
  });

  it('keeps the visible dates when switching orientation with a hidden weekday', () => {
    cy.mount(Calendar, {
      props: { view: 'week', viewDate: '2025-01-08', hideWeekdays: ['wed'] },
    });
    cy.get('.sd-calendar__body .sd-calendar__cell').should('have.length', 6);
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ horizontal: true }));
    cy.get('.sd-calendar__body .sd-calendar__cell').should('have.length', 6);
    cy.get('.sd-calendar__body').should(($body) => {
      expect($body[0].style.getPropertyValue('--sd-calendar-grid-columns')).to.equal('1');
      expect($body[0].style.getPropertyValue('--sd-calendar-grid-rows')).to.equal('6');
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ horizontal: false }));
    cy.get('.sd-calendar__body .sd-calendar__cell').should('have.length', 6);
  });
});
