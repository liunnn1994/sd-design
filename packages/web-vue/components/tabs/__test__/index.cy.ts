import Tabs from '../index';

const { TabPane } = Tabs;

const panes =
  '<tab-pane key="1" title="Tab 1">Panel 1</tab-pane><tab-pane key="2" title="Tab 2">Panel 2</tab-pane>';

describe('Tabs', () => {
  it('emits change on tab click', () => {
    cy.mount(Tabs, { global: { components: { TabPane } }, slots: { default: panes } });
    cy.get('.sd-tabs-tab').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['2']);
    });
  });

  it('emits add/delete events', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { editable: true, showAddButton: true },
      slots: { default: panes },
    });
    cy.get('.sd-tabs-nav-add-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('add')).to.have.length(1);
    });
    cy.get('.sd-tabs-tab-close-btn').first().click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('delete')).to.have.length(1);
    });
  });
});
