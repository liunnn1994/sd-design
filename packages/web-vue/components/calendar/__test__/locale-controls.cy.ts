import './real-transitions';
import Calendar from '../index';

describe('Calendar locale controls', () => {
  for (const locale of ['en', 'en-us']) {
    it(`uses English controls with explicit ${locale} locale`, () => {
      cy.mount(Calendar, { props: { viewDate: '2025-01-08', locale } });
      cy.get('.sd-calendar__nav--today').should('have.text', 'Today');
      cy.get('.sd-calendar__view-button').should('contain.text', 'Month');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ locale: 'zh-cn' }));
      cy.get('.sd-calendar__nav--today').should('have.text', '今天');
    });
  }
});
