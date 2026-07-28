import { h } from 'vue';

import List, { ListItemMeta } from '../index';

describe('List', () => {
  it('renders item meta props with performant ellipsis', () => {
    cy.mount(ListItemMeta, {
      props: { title: 'Title long long long', description: 'Description long long long' },
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findAllComponents({ name: 'PerformantEllipsis' })).to.have.length(2);
    });
  });

  it('does not wrap item meta slots with performant ellipsis', () => {
    cy.mount(ListItemMeta, {
      slots: {
        title: () => h('span', { class: 'custom-title' }, 'Title'),
        description: () => h('span', { class: 'custom-description' }, 'Description'),
      },
    });
    cy.get('.custom-title').should('exist');
    cy.get('.custom-description').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'PerformantEllipsis' }).exists()).to.equal(false);
    });
  });

  it('renders the empty component for empty data', () => {
    cy.mount(List, { props: { data: [] } });
    cy.get('.sd-empty').should('exist');
  });

  it('passes spinProps to the loading overlay', () => {
    cy.mount(List, {
      props: { data: [], loading: true, spinProps: { tip: '列表加载中', size: 24 } },
    });
    cy.get('.sd-list-wrapper .sd-spin-tip').should('have.text', '列表加载中');
    cy.get('.sd-list-wrapper .sd-spin-icon').should('have.css', 'font-size', '24px');
  });
});
