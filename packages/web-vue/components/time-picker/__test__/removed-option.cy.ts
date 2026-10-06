import TimeColumn from '../time-column.vue';

describe('TimePicker removed options', () => {
  it('does not scroll to a detached option after the list changes', () => {
    const list = Array.from({ length: 60 }, (_, value) => ({ value, label: String(value) }));
    cy.mount(TimeColumn, {
      props: { prefixCls: 'sd-timepicker', list, value: 30, visible: true },
    }).then(({ wrapper }) => {
      cy.get('.sd-timepicker-column').should(($column) => {
        expect($column[0].scrollTop).to.be.greaterThan(0);
      });
      cy.then(() => wrapper.setProps({ list: list.filter(({ value }) => value !== 30) }));
      cy.then(() => wrapper.setProps({ value: 29 }));
      cy.get('.sd-timepicker-column').should(($column) => {
        expect($column[0].scrollTop).to.equal(29 * 32);
      });
      cy.then(() => wrapper.setProps({ value: 30 }));
      cy.wait(200);
      cy.get('.sd-timepicker-column').should(($column) => {
        expect($column[0].scrollTop).to.equal(29 * 32);
      });
    });
  });
});
