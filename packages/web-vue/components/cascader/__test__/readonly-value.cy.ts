import Cascader from '../index';

describe('Cascader readonly value', () => {
  it('blocks option selection when readonly becomes true with the popup open', () => {
    cy.mount(Cascader, {
      props: {
        defaultValue: 'a',
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ],
      },
    });
    cy.get('.sd-select-view').click();
    cy.contains('.sd-cascader-option', 'B').should('be.visible');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ readonly: true }));
    cy.contains('.sd-cascader-option', 'B').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')).to.equal(undefined);
    });
  });

  it('preserves the value when clearing a readonly cascader', () => {
    cy.mount(Cascader, {
      props: {
        readonly: true,
        allowClear: true,
        defaultValue: 'a',
        options: [{ value: 'a', label: 'A' }],
      },
    });
    cy.get('.sd-select-view-clear-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')).to.equal(undefined);
      expect(wrapper.emitted('clear')).to.equal(undefined);
    });
  });

  it('preserves a readonly selected tag when its close button is clicked', () => {
    cy.mount(Cascader, {
      props: {
        readonly: true,
        multiple: true,
        defaultValue: ['a'],
        options: [{ value: 'a', label: 'A' }],
      },
    });
    cy.get('.sd-tag-close-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')).to.equal(undefined);
    });
    cy.get('.sd-tag').should('contain.text', 'A');
  });
});
