import { h, ref } from 'vue';

import { configProviderInjectionKey } from '../../config-provider/context';
import Select from '../../select';
import Pagination from '../pagination.vue';

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

  it('always disables clearing the page size select', () => {
    cy.mount(Pagination, {
      props: { total: 200, showPageSize: true, pageSizeProps: { allowClear: true } },
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: { slots: {}, allowClear: true },
        },
      },
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Select).props('allowClear')).to.equal(false);
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

  it('exposes navigation role and aria-current on the active page', () => {
    cy.mount(Pagination, { props: { total: 50, current: 3 } });
    cy.get('.sd-pagination').should('have.attr', 'role', 'navigation');
    cy.get('.sd-pagination').should('have.attr', 'aria-label', '分页');
    cy.contains('.sd-pagination-item', '3').should('have.attr', 'aria-current', 'page');
  });

  it('activates a page via Enter key', () => {
    cy.mount(Pagination, { props: { total: 50 } });
    cy.contains('.sd-pagination-item', '2').focus().trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([2]);
    });
  });

  it('labels the previous/next step pagers', () => {
    cy.mount(Pagination, { props: { total: 50 } });
    cy.get('.sd-pagination-item-previous').should('have.attr', 'aria-label', '上一页');
    cy.get('.sd-pagination-item-next').should('have.attr', 'aria-label', '下一页');
  });

  it('emits update:current alongside change when a page is clicked', () => {
    cy.mount(Pagination, { props: { total: 50 } });
    cy.contains('.sd-pagination-item', '2').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:current')?.[0]).to.deep.equal([2]);
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([2]);
    });
  });

  it('steps previous/next and disables them at the boundaries', () => {
    cy.mount(Pagination, { props: { total: 50, current: 5 } });
    cy.get('.sd-pagination-item-next').should('have.class', 'sd-pagination-item-disabled');
    cy.get('.sd-pagination-item-next').click({ force: true });
    cy.get('.sd-pagination-item-previous').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.deep.equal([[4]]);
    });
  });

  it('jumper navigates to the typed page', () => {
    cy.mount(Pagination, { props: { total: 50, showJumper: true } });
    cy.get('.sd-pagination-jumper-input input').type('4').blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([4]);
    });
  });

  it('jumper clamps out-of-range pages to the last page', () => {
    cy.mount(Pagination, { props: { total: 50, showJumper: true } });
    cy.get('.sd-pagination-jumper-input input').type('99').blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([5]);
    });
  });
  it('clears the jumper input after a jump', () => {
    cy.mount(Pagination, { props: { total: 50, showJumper: true } });
    cy.get('.sd-pagination-jumper-input input').type('4').blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([4]);
    });
    // the input is cleared after the jump instead of keeping the typed value
    cy.get('.sd-pagination-jumper-input input').should('have.value', '');
  });

  it('simple mode syncs the jumper input with step navigation', () => {
    cy.mount(Pagination, { props: { total: 50, simple: true } });
    cy.get('.sd-pagination-simple').should('exist');
    cy.get('.sd-pagination-jumper-total-page').should('have.text', '5');
    cy.get('.sd-pagination-jumper-input input').should('have.value', '1');
    cy.get('.sd-pagination-item-next').click({ force: true });
    cy.get('.sd-pagination-jumper-input input').should('have.value', '2');
  });

  it('renders the total text and honors the total slot override', () => {
    cy.mount(Pagination, { props: { total: 1234, showTotal: true } });
    cy.get('.sd-pagination-total').should('have.text', '共 1234 条');

    cy.mount(Pagination, {
      props: { total: 1234, showTotal: true },
      slots: { total: '<span class="custom-total">Total {{ params.total }}</span>' },
    });
    cy.get('.custom-total').should('have.text', 'Total 1234');
  });

  it('hideOnSinglePage removes the pagination for a single page', () => {
    cy.mount(Pagination, { props: { total: 5, hideOnSinglePage: true } });
    cy.get('.sd-pagination').should('not.exist');

    cy.mount(Pagination, { props: { total: 50, hideOnSinglePage: true } });
    cy.get('.sd-pagination').should('exist');
  });

  it('disabled pagination ignores page clicks', () => {
    cy.mount(Pagination, { props: { total: 50, disabled: true } });
    cy.get('.sd-pagination').should('have.class', 'sd-pagination-disabled');
    cy.get('.sd-pagination-item-previous').should('have.class', 'sd-pagination-item-disabled');
    cy.get('.sd-pagination-item-next').should('have.class', 'sd-pagination-item-disabled');
    cy.contains('.sd-pagination-item', '2').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });
  it('disabled pagination also disables the ellipsis pager', () => {
    cy.mount(Pagination, { props: { total: 200, disabled: true } });
    cy.get('.sd-pagination-item-ellipsis')
      .should('have.attr', 'aria-disabled', 'true')
      .and('have.attr', 'tabindex', '-1')
      .and('have.class', 'sd-pagination-item-disabled');
    cy.get('.sd-pagination-item-ellipsis').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('total=0 keeps the jumper usable and disables paging', () => {
    cy.mount(Pagination, { props: { total: 0, showJumper: true, simple: true } });
    // jumper max clamped to 1 so min=1/max=1 is a valid range
    cy.get('.sd-pagination-jumper-input input')
      .should('have.attr', 'aria-valuemax', '1')
      .and('have.attr', 'aria-valuemin', '1');
    // no pages -> step pagers disabled
    cy.get('.sd-pagination-item-next').should('have.class', 'sd-pagination-item-disabled');
    cy.get('.sd-pagination-item-previous').should('have.class', 'sd-pagination-item-disabled');
  });
  it('showMore adds a second ellipsis that advances by the buffer step', () => {
    cy.mount(Pagination, { props: { total: 200, showMore: true } });
    cy.get('.sd-pagination-item-ellipsis').should('have.length', 2);
    cy.get('.sd-pagination-item-ellipsis').eq(1).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      // bufferSize 2 → step = 2 * 2 + 1 = 5
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([6]);
    });
  });

  it('changing the page size emits pageSize events and keeps the first item visible', () => {
    cy.mount(Pagination, {
      props: { total: 100, defaultCurrent: 3, showPageSize: true },
    });
    cy.get('@vue')
      .then(({ wrapper }) => {
        wrapper.findComponent({ name: 'PageOptions' }).vm.$emit('change', 20);
      })
      .should(({ wrapper }) => {
        expect(wrapper.emitted('update:pageSize')?.[0]).to.deep.equal([20]);
        expect(wrapper.emitted('pageSizeChange')?.[0]).to.deep.equal([20]);
        // autoAdjust: first item of page 3 (item 21) lands on page 2 at pageSize 20
        expect(wrapper.emitted('update:current')).to.deep.equal([[2]]);
        expect(wrapper.emitted('change')).to.deep.equal([[2]]);
      });
  });

  it('honors ConfigProvider autoAdjust when the page size changes', () => {
    cy.mount(Pagination, {
      props: { total: 100, defaultCurrent: 3, showPageSize: true },
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            slots: {},
            pagination: { autoAdjust: false },
          },
        },
      },
    });
    cy.get('@vue')
      .then(({ wrapper }) => {
        wrapper.findComponent({ name: 'PageOptions' }).vm.$emit('change', 20);
      })
      .should(({ wrapper }) => {
        expect(wrapper.emitted('update:pageSize')).to.deep.equal([[20]]);
        expect(wrapper.emitted('pageSizeChange')).to.deep.equal([[20]]);
        expect(wrapper.emitted('update:current')).to.equal(undefined);
        expect(wrapper.emitted('change')).to.equal(undefined);
      });
  });

  it('activates a page via Space key and ignores keys on a disabled pagination', () => {
    cy.mount(Pagination, { props: { total: 50 } });
    cy.contains('.sd-pagination-item', '2').focus().trigger('keydown', { key: ' ' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([2]);
    });

    cy.mount(Pagination, { props: { total: 50, disabled: true } });
    cy.contains('.sd-pagination-item', '2').focus().trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });
});
