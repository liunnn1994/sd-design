import './real-transitions';
import Calendar from '../index';

describe('Calendar ISO week numbers', () => {
  for (const locale of ['en-us', 'zh-cn']) {
    it(`keeps the final ISO week of 2020 in ${locale}`, () => {
      cy.mount(Calendar, { props: { view: 'week', viewDate: '2021-01-01', locale } });
      cy.get('.sd-calendar__title small').should('contain.text', '53');
      cy.get('.sd-calendar__nav--next').click();
      cy.get('.sd-calendar__title small')
        .should('have.length', 1)
        .and(($title) => {
          expect($title.text().trim()).to.match(/\s1$/);
        });
    });
  }
});
