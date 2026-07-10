import { h, ref } from 'vue';

import { configProviderInjectionKey } from '../../config-provider/context';
import Pagination from '../pagination';

describe('Pagination', () => {
  it('emits change on page and ellipsis clicks', () => {
    cy.mount(Pagination, { props: { total: 200, showJumper: true } });
    cy.get('.sd-pagination-item').eq(2).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([2]);
    });
    cy.get('.sd-pagination-item-ellipsis').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[1]).to.deep.equal([7]);
    });
  });

  it('total changes that reduce page count reset current', () => {
    const total = ref(5);
    const current = ref(5);
    const handleChange = (data: number) => {
      current.value = data;
    };
    cy.mount(() =>
      h(Pagination, {
        total: total.value,
        pageSize: 1,
        current: current.value,
        onChange: handleChange,
      }),
    );
    cy.then(() => {
      total.value = 4;
    });
    cy.wrap(current).should((c) => expect((c as { value: number }).value).to.equal(4));
    cy.then(() => {
      total.value = 5;
      current.value = 3;
    });
    cy.then(() => {
      total.value = 4;
    });
    cy.wrap(current).should((c) => expect((c as { value: number }).value).to.equal(3));
  });

  it('applies pagination config from the ConfigProvider', () => {
    cy.mount(Pagination, {
      props: { total: 200 },
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            slots: {},
            pagination: { showPageSize: true, pageSizeOptions: [5, 15, 25] },
          },
        },
      },
    });
    cy.get('@vue').should(({ wrapper }) => {
      const pageOptions = wrapper.findComponent({ name: 'PageOptions' });
      expect(pageOptions.exists()).to.equal(true);
      expect(pageOptions.props('sizeOptions')).to.deep.equal([5, 15, 25]);
    });
  });

  it('local pagination props override ConfigProvider config', () => {
    cy.mount(Pagination, {
      props: { total: 200, showPageSize: true, pageSizeOptions: [8, 18] },
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            slots: {},
            pagination: { showPageSize: false, pageSizeOptions: [5, 15, 25] },
          },
        },
      },
    });
    cy.get('@vue').should(({ wrapper }) => {
      const pageOptions = wrapper.findComponent({ name: 'PageOptions' });
      expect(pageOptions.exists()).to.equal(true);
      expect(pageOptions.props('sizeOptions')).to.deep.equal([8, 18]);
    });
  });

  it('applies defaultPageSize from the ConfigProvider', () => {
    cy.mount(Pagination, {
      props: { total: 100, simple: true },
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            slots: {},
            pagination: { defaultPageSize: 50 },
          },
        },
      },
    });
    cy.get('.sd-pagination-jumper-total-page').should('have.text', '2');
  });

  it('applies showJumper from the ConfigProvider', () => {
    cy.mount(Pagination, {
      props: { total: 200 },
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: { slots: {}, pagination: { showJumper: true } },
        },
      },
    });
    cy.get('.sd-pagination-jumper').should('exist');
  });
});
