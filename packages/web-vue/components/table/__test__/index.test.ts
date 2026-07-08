import { mount } from '@vue/test-utils';
import { nextTick, reactive, ref } from 'vue';

import { TableChangeExtra, TableColumnData, TableData } from '../interface';
import Table from '../table';

const demoData = [
  {
    key: '1',
    name: 'Jane Doe1',
    age: 1,
  },
  {
    key: '2',
    name: 'Jane Doe2',
    age: 2,
  },
  {
    key: '3',
    name: 'Jane Doe3',
    age: 3,
  },
  {
    key: '4',
    name: 'Jane Doe4',
    age: 4,
  },
  {
    key: '5',
    age: 5,
    name: 'Jane Doe5',
  },
];
const demoColumns: TableColumnData[] = [
  {
    title: 'Name',
    dataIndex: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
  },
];
const JSONCopy = (val: unknown) => JSON.parse(JSON.stringify(val));
describe('Table', () => {
  test('Correct rendering after deleting data on the last page', async () => {
    const data = reactive(JSONCopy(demoData));
    const columns = JSONCopy(demoColumns);
    const current = ref(5);
    const handleChange = (data: number) => {
      current.value = data;
    };
    const pagination = reactive({
      current,
      onChange: handleChange,
      pageSize: 1,
    });
    const wrapper = mount(Table as any, {
      props: {
        columns,
        data,
        pagination,
      },
    });
    await nextTick();
    let content = wrapper.find('.sd-table-td-content').element.innerHTML;
    expect(content).toBe('Jane Doe5');
    data.pop();
    await nextTick();
    content = wrapper.find('.sd-table-td-content').element.innerHTML;
    expect(content).toBe('Jane Doe4');
  });

  test('renders virtual body with shared VirtualList', async () => {
    const data = Array.from({ length: 50 }, (_, index) => ({
      key: `${index + 1}`,
      name: `Jane Doe${index + 1}`,
      age: index + 1,
    }));
    const wrapper = mount(Table as any, {
      props: {
        columns: JSONCopy(demoColumns),
        data,
        pagination: false,
        virtualListProps: {
          height: 200,
          itemSize: 32,
        },
      },
    });

    await nextTick();

    const viewport = wrapper.find('.sd-virtual-list-scroller');
    expect(viewport.exists()).toBe(true);
    expect(wrapper.find('.sd-table-body.sd-virtual-list').exists()).toBe(true);
    const content = wrapper.find('.sd-table-element.sd-virtual-list-content');
    expect(content.exists()).toBe(true);
    const initialContentHeight = Number.parseFloat((content.element as HTMLElement).style.height);
    expect(initialContentHeight).toBeGreaterThan(0);

    await wrapper.setProps({
      virtualListProps: {
        height: 200,
        estimatedSize: 48,
      },
    });
    await nextTick();
    const estimatedContentHeight = Number.parseFloat(
      (wrapper.find('.sd-table-element.sd-virtual-list-content').element as HTMLElement).style
        .height,
    );
    expect(estimatedContentHeight).toBeGreaterThan(initialContentHeight);

    await wrapper.setProps({
      virtualListProps: {
        height: 200,
        minItemSize: 56,
      },
    });
    await nextTick();
    expect((wrapper.find('.sd-table-virtual-item').element as HTMLElement).style.minHeight).toBe(
      '56px',
    );

    await new Promise((resolve) => requestAnimationFrame(resolve));
    (wrapper.vm as any).scrollIntoView({ index: 10, align: 'top' });
    await nextTick();
    expect((viewport.element as HTMLElement).scrollTop).toBeGreaterThan(0);
  });
  test('supports sticky header offset 0 in virtual table', async () => {
    const data = Array.from({ length: 10 }, (_, index) => ({
      key: `${index + 1}`,
      name: `Jane Doe${index + 1}`,
      age: index + 1,
    }));
    const wrapper = mount(Table as any, {
      props: {
        columns: JSONCopy(demoColumns),
        data,
        pagination: false,
        stickyHeader: 0,
        virtualListProps: {
          height: 200,
          itemSize: 32,
        },
      },
    });

    await nextTick();

    const header = wrapper.find('.sd-table-header');
    expect(header.classes()).toContain('sd-table-header-sticky');
    expect((header.element as HTMLElement).style.top).toBe('0px');
  });

  test('table sort', async () => {
    const data = reactive(JSONCopy(demoData));
    const columns = JSONCopy(demoColumns);
    columns[1].sortable = {
      sortDirections: ['ascend', 'descend'],
    };
    let testSortRes = {
      data: [] as TableData[],
      extra: {} as TableChangeExtra,
      currentDataSource: [] as TableData[],
    };
    const handleChange = (
      data: TableData[],
      extra: TableChangeExtra,
      currentDataSource: TableData[],
    ) => {
      testSortRes = { data, extra, currentDataSource };
    };
    const wrapper = mount(Table as any, {
      props: {
        columns,
        data,
        onChange: handleChange,
        pagination: {
          pageSize: 2,
        },
      },
    });
    await nextTick();
    wrapper.find('.sd-table-cell-with-sorter').trigger('click');
    expect(testSortRes.data[0].key).toBe('1');
    expect(testSortRes.extra.sorter?.direction).toBe('ascend');
    expect(testSortRes.currentDataSource).toBeTruthy();
    expect(testSortRes.currentDataSource.length).toBe(5);
    expect(testSortRes.currentDataSource[0].key).toBe('1');
    expect(testSortRes.currentDataSource[4].key).toBe('5');
    await nextTick();
    wrapper.find('.sd-table-cell-with-sorter').trigger('click');
    expect(testSortRes.data[0].key).toBe('5');
    expect(testSortRes.extra.sorter?.direction).toBe('descend');
    expect(testSortRes.currentDataSource).toBeTruthy();
    expect(testSortRes.currentDataSource.length).toBe(5);
    expect(testSortRes.currentDataSource[0].key).toBe('5');
    expect(testSortRes.currentDataSource[4].key).toBe('1');
  });
});
