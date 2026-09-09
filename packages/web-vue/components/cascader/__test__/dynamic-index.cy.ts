import Cascader, { CascaderPanel } from '../index';

describe('Cascader dynamic option index', () => {
  it('resolves a parent label after enabling strict selection', () => {
    cy.mount(Cascader, {
      props: {
        modelValue: 'parent',
        options: [
          {
            value: 'parent',
            label: 'Parent label',
            children: [{ value: 'child', label: 'Child' }],
          },
        ],
      },
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ checkStrictly: true }));
    cy.get('.sd-select-view').should('contain.text', 'Parent label');
  });

  it('reindexes object values when valueKey changes', () => {
    cy.mount(Cascader, {
      props: {
        valueKey: 'id',
        modelValue: { id: 'one', code: 'first' },
        options: [{ value: { id: 'one', code: 'first' }, label: 'First option' }],
      },
    });
    cy.get('.sd-select-view').should('contain.text', 'First option');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ valueKey: 'code' }));
    cy.get('.sd-select-view').should('contain.text', 'First option');
    cy.get('.sd-select-view').click();
    cy.contains('button', 'First option').should('have.class', 'sd-cascader-option-active');
  });

  it('enables independent parent selection in the panel after changing checkStrictly', () => {
    cy.mount(CascaderPanel, {
      props: {
        multiple: true,
        options: [
          {
            value: 'parent',
            label: 'Parent',
            children: [{ value: 'child', label: 'Child', disabled: true }],
          },
        ],
      },
    });
    cy.contains('button', 'Parent').find('input').should('be.disabled');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ checkStrictly: true }));
    cy.contains('button', 'Parent').find('input').should('not.be.disabled');
    cy.contains('button', 'Parent').find('.sd-checkbox').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.deep.equal([[['parent']]]);
    });
  });
});
