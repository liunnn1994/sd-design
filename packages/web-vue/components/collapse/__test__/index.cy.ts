import Collapse from '../index';

const CollapseItem = Collapse.Item;

describe('Collapse', () => {
  it('emits change on item click, respecting disabled and accordion', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      slots: {
        default:
          '<collapse-item key="1" header="Test 1">Test 1</collapse-item>' +
          '<collapse-item key="2" header="Test 2" disabled>Test 2</collapse-item>' +
          '<collapse-item key="3" header="Test 3">Test 3</collapse-item>',
      },
    });

    cy.get('.sd-collapse-item-header').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });

    cy.get('.sd-collapse-item-header').eq(2).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]?.[0]).to.deep.equal(['3']);
    });

    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ accordion: true })));
    cy.get('.sd-collapse-item-header').eq(0).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[1]?.[0]).to.deep.equal(['1']);
    });
  });
});
