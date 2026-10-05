import TimePicker from '../index';

describe('TimePicker invalid step boundaries', () => {
  for (const step of [0, -1, NaN, Infinity, 0.5, 1.5]) {
    it(`uses the default discrete interval for step=${step}`, () => {
      cy.mount(TimePicker, {
        props: { step: { hour: step, minute: step, second: step }, popupVisible: true },
      });
      cy.get('.sd-timepicker-column').eq(0).find('li').should('have.length', 24);
      cy.get('.sd-timepicker-column').eq(1).find('li').should('have.length', 60);
      cy.get('.sd-timepicker-column').eq(2).find('li').should('have.length', 60);
      cy.get('.sd-timepicker-column').eq(0).find('li').eq(1).should('have.text', '01');
    });
  }
});
