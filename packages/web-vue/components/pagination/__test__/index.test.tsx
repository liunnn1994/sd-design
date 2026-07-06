import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';

import { configProviderInjectionKey } from '../../config-provider/context';
import Pagination from '../pagination';

describe('Pagination', () => {
  test('should emit change event', async () => {
    const wrapper = mount(Pagination, {
      props: {
        total: 200,
        showJumper: true,
      },
    });

    const pageButtons = wrapper.findAll('.sd-pagination-item');
    await pageButtons[2].trigger('click');
    expect(wrapper.emitted('change')?.[0]).toEqual([2]);
    const ellipsis = wrapper.find('.sd-pagination-item-ellipsis');
    await ellipsis.trigger('click');
    expect(wrapper.emitted('change')?.[1]).toEqual([7]);
  });

  test('`total` causes page count changes to reset `current`', async () => {
    const total = ref(5);
    const current = ref(5);
    const handleChange = (data: number) => {
      current.value = data;
    };
    mount(() => (
      <Pagination
        total={total.value}
        pageSize={1}
        current={current.value}
        onChange={handleChange}
      ></Pagination>
    ));
    await nextTick();
    total.value = 4;
    await nextTick();
    expect(current.value).toBe(4);

    total.value = 5;
    current.value = 3;
    await nextTick();
    total.value = 4;
    await nextTick();
    expect(current.value).toBe(3);
  });

  test('should apply pagination config from ConfigProvider', async () => {
    const wrapper = mount(Pagination, {
      props: { total: 200 },
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            slots: {},
            pagination: {
              showPageSize: true,
              pageSizeOptions: [5, 15, 25],
            },
          },
        },
      },
    });
    await nextTick();

    const pageOptions = wrapper.findComponent({ name: 'PageOptions' });
    expect(pageOptions.exists()).toBe(true);
    expect(pageOptions.props('sizeOptions')).toEqual([5, 15, 25]);
  });

  test('local pagination prop overrides ConfigProvider config', async () => {
    const wrapper = mount(Pagination, {
      props: { total: 200, showPageSize: true, pageSizeOptions: [8, 18] },
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            slots: {},
            pagination: {
              showPageSize: false,
              pageSizeOptions: [5, 15, 25],
            },
          },
        },
      },
    });
    await nextTick();

    const pageOptions = wrapper.findComponent({ name: 'PageOptions' });
    expect(pageOptions.exists()).toBe(true);
    expect(pageOptions.props('sizeOptions')).toEqual([8, 18]);
  });

  test('should apply defaultPageSize from ConfigProvider', async () => {
    const wrapper = mount(Pagination, {
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
    await nextTick();

    // total 100 / defaultPageSize 50 => 2 pages
    expect(wrapper.find('.sd-pagination-jumper-total-page').text()).toBe('2');
  });

  test('should apply showJumper from ConfigProvider', async () => {
    const wrapper = mount(Pagination, {
      props: { total: 200 },
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: { slots: {}, pagination: { showJumper: true } },
        },
      },
    });
    await nextTick();

    expect(wrapper.find('.sd-pagination-jumper').exists()).toBe(true);
  });
});
