import './real-transitions';
import { defineComponent } from 'vue';

import Calendar from '../index';

describe('Calendar locale isolation', () => {
  it('keeps English and Chinese titles independent after navigation', () => {
    cy.mount(
      defineComponent({
        components: { Calendar },
        template:
          '<Calendar id="english" view="day" view-date="2025-01-08" locale="en-us"/><Calendar id="chinese" view="day" view-date="2025-01-08" locale="zh-cn"/>',
      }),
    );
    cy.get('#chinese .sd-calendar__title').should('contain.text', '一月');
    cy.get('#english .sd-calendar__nav--next').click();
    cy.get('#english .sd-calendar__title').should('have.length', 1).and('contain.text', 'January');
    cy.get('#chinese .sd-calendar__nav--next').click();
    cy.get('#chinese .sd-calendar__title').should('have.length', 1).and('contain.text', '一月');
  });
});
