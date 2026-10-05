import DatePicker from '../index';

describe('DatePicker initial header panel', () => {
  for (const year of [2001, 2045]) {
    it(`opens the year panel at the initial ${year} picker value`, () => {
      cy.mount(DatePicker, {
        props: { hideTrigger: true, defaultPickerValue: `${year}-07-05` },
      });
      cy.get('.sd-picker-header-label').eq(0).click();
      const decade = Math.floor(year / 10) * 10;
      cy.get('.sd-panel-year .sd-picker-header-title').should(
        'have.text',
        `${decade}-${decade + 9}`,
      );
    });
  }
});
