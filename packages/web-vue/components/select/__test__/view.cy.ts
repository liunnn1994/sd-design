import { h } from 'vue';

import SelectView from '../../_components/select-view/select-view.vue';
import ConfigProvider from '../../config-provider';

const value = [{ value: 'one', label: 'One', closable: true }];
describe('SelectView shared presentation', () => {
  it('keeps explicit clear opt-out with global allowClear in multiple mode', () => {
    cy.mount(ConfigProvider, {
      props: { allowClear: true },
      slots: {
        default: () => h(SelectView, { modelValue: value, multiple: true, allowClear: false }),
      },
    });
    cy.get('.sd-select-view-clear-btn').should('not.exist');
  });

  it('renders only one clear control and forwards a single clear event', () => {
    const clear = cy.stub().as('clear');
    cy.mount(ConfigProvider, {
      props: { allowClear: true },
      slots: {
        default: () =>
          h(SelectView, { modelValue: value, multiple: true, allowClear: true, onClear: clear }),
      },
    });
    cy.get('input').focus();
    cy.get('.sd-select-view-clear-btn').should('have.length', 1).should('be.visible').click();
    cy.get('@clear').should('have.been.calledOnce');
  });

  it('switches loading, search and arrow icons and blurs when closed', () => {
    cy.mount(SelectView, {
      props: { modelValue: value, opened: true, allowSearch: true, loading: true },
    });
    cy.get('.sd-icon-loading').should('exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ loading: false }));
    cy.get('.sd-icon-search').should('exist');
    cy.get('input').focus().should('be.focused');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ opened: false }));
    cy.get('input').should('not.be.focused');
    cy.get('.sd-select-view-arrow-icon').should('exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ showArrow: false }));
    cy.get('.sd-select-view-arrow-icon').should('not.exist');
  });
});
