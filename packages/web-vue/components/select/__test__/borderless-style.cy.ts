import Select from '../select.vue';

describe('Select borderless styles', () => {
  for (const multiple of [false, true]) {
    it(`removes the background and border in ${multiple ? 'multiple' : 'single'} mode`, () => {
      cy.mount(Select, {
        props: { bordered: false, multiple, options: ['one', 'two'] },
        attrs: {
          style: {
            '--component-input-input-color-bg': 'rgb(12, 34, 56)',
            '--component-input-input-color-border': 'rgb(78, 90, 12)',
          },
        },
      });

      cy.get('.sd-select-view')
        .should('have.class', 'sd-select-view-borderless')
        .and('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
        .and('have.css', 'border-top-width', '0px')
        .and('have.css', 'box-shadow', 'none');
    });
  }
});
