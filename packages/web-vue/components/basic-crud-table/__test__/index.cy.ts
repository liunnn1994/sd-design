import { defineComponent, h, ref } from 'vue';

import type { TableColumnData } from '../../table';

import BasicCrudTable from '../basic-crud-table.vue';

const columns: TableColumnData[] = [{ title: '名称', dataIndex: 'name' }];

describe('BasicCrudTable', () => {
  it('加载数据并透传查询参数', () => {
    const fetchTableApi = cy.stub().resolves({ data: [{ key: 1, name: '监控项' }], total: 1 });
    cy.mount(BasicCrudTable, { props: { columns, fetchTableApi } });
    cy.wrap(fetchTableApi).should('have.been.calledWithMatch', { current: 1, pageSize: 10 });
    cy.contains('监控项').should('be.visible');
  });

  it('触发新建与编辑', () => {
    const onCreate = cy.spy().as('create');
    const onEdit = cy.spy().as('edit');
    cy.mount(BasicCrudTable, {
      props: {
        columns,
        tableData: [{ key: 1, name: '监控项' }],
        fetchTableOnMounted: false,
        openCreateModal: false,
        onCreate,
        onEdit,
      },
    });
    cy.contains('新建').click();
    cy.get('@create').should('have.been.calledOnce');
    cy.contains('编辑').click();
    cy.get('@edit').should('have.been.calledWithMatch', { name: '监控项' });
  });

  it('删除经 popconfirm 确认后调用 deleteApi 并刷新列表', () => {
    const fetchTableApi = cy.stub().resolves({ data: [{ key: 1, name: '监控项' }], total: 1 });
    const deleteApi = cy.stub().resolves();
    cy.mount(BasicCrudTable, {
      props: { columns, fetchTableApi, deleteApi },
    });
    cy.contains('监控项').should('be.visible');
    cy.contains('删除').click();
    cy.get('.sd-popconfirm-footer').should('be.visible').contains('确定').click();
    cy.wrap(deleteApi).should('have.been.calledWithMatch', { name: '监控项' });
    cy.wrap(fetchTableApi).should('have.callCount', 2);
  });

  it('重置后用同步后的筛选值请求，而非旧的筛选值', () => {
    const fetchTableApi = cy.stub().resolves({ data: [], total: 0 });
    // 用 v-model 双向绑定，复现真实使用场景：Toolbar.reset 改 modelValue 后，
    // 父级 v-model 的回写是异步的，handleReset 若不等待会读到旧筛选值。
    const Wrapper = defineComponent({
      setup() {
        const filters = ref<Record<string, unknown>>({ status: '' });
        return { filters };
      },
      render() {
        return h(BasicCrudTable, {
          columns,
          fetchTableApi,
          'toolbarModel': this.filters,
          'onUpdate:toolbarModel': (value: Record<string, unknown>) => {
            this.filters = value;
          },
          'toolbarProps': {
            schemas: [
              {
                field: 'status',
                label: '状态',
                type: 'select',
                componentProps: { options: [{ label: '在线', value: '在线' }] },
              },
            ],
          },
        });
      },
    });
    cy.mount(Wrapper);
    cy.wrap(fetchTableApi).should('have.been.calledWithMatch', { status: '' });
    // 通过 v-model 把筛选改为「在线」（不触发请求）
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.vm.filters = { status: '在线' };
    });
    cy.contains('重置').click();
    // 重置后最后一次请求应使用清空后的筛选值，而不是旧的「在线」
    cy.wrap(fetchTableApi).should((stub) => {
      const calls = stub.getCalls();
      const lastParams = calls[calls.length - 1]?.args[0];
      expect(lastParams, '最后一次请求参数').to.deep.include({ status: '' });
    });
  });

  it('区分子组件属性并完成创建提交', () => {
    const fetchTableApi = cy.stub().resolves({ data: [], total: 0 });
    const createApi = cy.stub().resolves({ id: 1 });
    cy.mount(BasicCrudTable, {
      props: {
        columns,
        fetchTableApi,
        createApi,
        toolbarProps: { showReset: false },
        modalFormProps: {
          schemas: [{ field: 'name', label: '名称', type: 'input', required: true }],
        },
      },
    });
    cy.contains('重置').should('not.exist');
    cy.contains('新建').click();
    cy.get('.sd-modal input').type('新记录');
    cy.get('.sd-modal-footer').contains('确定').click();
    cy.wrap(createApi).should('have.been.calledWithMatch', { name: '新记录' });
    cy.wrap(fetchTableApi).should('have.callCount', 2);
  });
});
