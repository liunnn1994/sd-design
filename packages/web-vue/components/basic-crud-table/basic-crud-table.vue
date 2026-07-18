<template>
  <section :class="cls" :aria-busy="loading">
    <header v-if="showHeader" :class="`${prefixCls}-header`">
      <slot name="header__title" :title="title">
        <h3 v-if="showTitle && title" :class="`${prefixCls}-title`">{{ title }}</h3>
      </slot>
      <slot name="header__extra" />
      <div v-if="!showToolbar && showCreate" :class="`${prefixCls}-header-actions`">
        <Button type="primary" @click="handleCreate">新建</Button>
      </div>

      <Toolbar
        v-if="showToolbar"
        ref="toolbarRef"
        v-model="toolbarModel"
        v-bind="toolbarProps"
        :loading="loading"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template v-if="$slots.toolbar__default" #default>
          <slot name="toolbar__default" />
        </template>
        <template v-if="$slots.toolbar__action_prepend" #action-prepend>
          <slot name="toolbar__action_prepend" />
        </template>
        <template #action-append>
          <slot name="toolbar__action_append" />
          <Button v-if="showCreate" type="primary" @click="handleCreate">新建</Button>
        </template>
        <template v-for="name in toolbarSlotNames" :key="name" #[name]="data">
          <slot :name="`toolbar__${name}`" v-bind="data" />
        </template>
      </Toolbar>
    </header>

    <Spin :loading="loading" :class="`${prefixCls}-body`">
      <Table
        v-bind="tableProps"
        :columns="resolvedColumns"
        :data="tableData"
        :pagination="resolvedPagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        @change="handleTableChange"
      >
        <template v-for="name in tableSlotNames" :key="name" #[name]="data">
          <slot :name="`table__${name}`" v-bind="data" />
        </template>
        <template #basic-crud-action="data">
          <Space>
            <slot name="table__action_prepend" v-bind="data" />
            <Link v-if="showEdit" :ellipsis="false" @click="handleEdit(data.record, data)">
              编辑
            </Link>
            <Popconfirm
              v-if="showDelete"
              :content="deleteConfirmContent"
              type="warning"
              :on-before-ok="handleDeleteConfirm"
              @popup-visible-change="(visible) => handleDeletePopupChange(visible, data.record)"
            >
              <Link :ellipsis="false" status="danger">删除</Link>
            </Popconfirm>
            <slot name="table__action_append" v-bind="data" />
          </Space>
        </template>
      </Table>
    </Spin>

    <BasicCrudModal
      ref="modalRef"
      v-model:visible="modalVisible"
      v-model:model="modalModel"
      :modal-props="modalProps"
      :modal-form-props="modalFormProps"
      :create-api="createApi"
      :update-api="updateApi"
      :detail-api="detailApi"
      :value-transformer="valueTransformer"
      :before-submit="beforeModalSubmit"
      @success="handleModalSuccess"
      @close="emit('modalClose')"
      @error="emit('error', $event)"
    >
      <template v-for="name in modalSlotNames" :key="name" #[name]="data">
        <slot :name="`modal__${name}`" v-bind="data" />
      </template>
    </BasicCrudModal>
  </section>
</template>

<script setup lang="ts">
  import type { UnknownRecord } from 'type-fest';

  import type { VNode } from 'vue';
  import { computed, nextTick, onMounted, ref, shallowRef, useSlots } from 'vue';

  import { isFunction, isNil, isString, omitBy } from 'es-toolkit';

  import type { TableChangeExtra, TableData } from '../table';
  import type { ToolbarInstance, ToolbarModelValue } from '../toolbar';
  import type {
    BasicCrudTableActionSlotProps,
    BasicCrudTableDataResult,
    BasicCrudTableModalSubmitContext,
    BasicCrudTableProps,
  } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import { isPromise } from '../_utils/is';
  import Button from '../button';
  import Link from '../link';
  import Popconfirm from '../popconfirm';
  import Space from '../space';
  import Spin from '../spin';
  import Table from '../table';
  import Toolbar from '../toolbar';
  import BasicCrudModal from './basic-crud-modal.vue';

  defineOptions({ name: 'BasicCrudTable', inheritAttrs: false });

  defineSlots<{
    [key: `header__${string}`]: ((data: UnknownRecord) => VNode[]) | undefined;
    [key: `toolbar__${string}`]: ((data: UnknownRecord) => VNode[]) | undefined;
    [key: `table__${string}`]: ((data: BasicCrudTableActionSlotProps) => VNode[]) | undefined;
    [key: `modal__${string}`]: ((data: UnknownRecord) => VNode[]) | undefined;
  }>();

  const {
    title,
    columns,
    tableProps = {},
    toolbarProps = {},
    modalProps = {},
    modalFormProps = { schemas: [] },
    showCreate = true,
    openCreateModal = true,
    showEdit = true,
    showDelete = true,
    showToolbar = true,
    showHeader = true,
    showTitle = true,
    showActionColumn = true,
    fetchExcludeEmptyValues = false,
    fetchTableOnMounted = true,
    actionWidth = 120,
    fetchTableApi,
    tableDataTransformer,
    createApi,
    updateApi,
    detailApi,
    valueTransformer,
    beforeModalSubmit,
    deleteContent,
    deleteApi,
    beforeDelete,
    deleteNameKey,
  } = defineProps<BasicCrudTableProps<TableData>>();

  const emit = defineEmits<{
    create: [];
    edit: [row: TableData, context?: unknown];
    delete: [row: TableData, context?: unknown];
    reset: [];
    search: [params: ToolbarModelValue];
    tableFetched: [rows: TableData[], result: BasicCrudTableDataResult<TableData>];
    modalSuccess: [result: unknown, context: BasicCrudTableModalSubmitContext<TableData>];
    modalClose: [];
    error: [error: unknown];
  }>();

  const loading = defineModel<boolean>('loading', { default: false });
  const toolbarModel = defineModel<ToolbarModelValue>('toolbarModel', { default: () => ({}) });
  const tableData = defineModel<TableData[]>('tableData', { default: () => [] });
  const modalModel = defineModel<UnknownRecord>('modalModel', { default: () => ({}) });
  const modalVisible = defineModel<boolean>('modalVisible', { default: false });

  const slots = useSlots();
  const toolbarRef = shallowRef<ToolbarInstance>();
  const modalRef = shallowRef<InstanceType<typeof BasicCrudModal>>();
  const current = shallowRef(resolvePaginationNumber('current', 'defaultCurrent', 1));
  const pageSize = shallowRef(resolvePaginationNumber('pageSize', 'defaultPageSize', 10));
  const total = shallowRef(0);
  const sorter = shallowRef<UnknownRecord>({});
  const fetchData = shallowRef<unknown>();
  const prefixCls = getPrefixCls('basic-crud-table');
  const cls = computed(() => [prefixCls, { [`${prefixCls}-loading`]: loading.value }]);
  const toolbarSlotNames = computed(() =>
    getForwardedSlotNames('toolbar__', ['default', 'action_prepend', 'action_append']),
  );
  const tableSlotNames = computed(() =>
    getForwardedSlotNames('table__', ['action_prepend', 'action_append']),
  );
  const modalSlotNames = computed(() => getForwardedSlotNames('modal__'));
  const resolvedColumns = computed(() =>
    showActionColumn
      ? [
          ...columns,
          {
            title: '操作',
            dataIndex: '__basic_crud_action__',
            slotName: 'basic-crud-action',
            width: actionWidth,
            fixed: 'right' as const,
          },
        ]
      : columns,
  );
  const resolvedPagination = computed(() =>
    tableProps.pagination === false
      ? false
      : {
          ...(typeof tableProps.pagination === 'object' ? tableProps.pagination : {}),
          current: current.value,
          pageSize: pageSize.value,
          total: total.value,
        },
  );
  const params = computed(() => ({
    current: current.value,
    pageSize: pageSize.value,
    ...sorter.value,
    ...toolbarModel.value,
  }));

  onMounted(() => {
    if (fetchTableOnMounted) void handleFetchData();
  });

  function getForwardedSlotNames(prefix: string, excluded: string[] = []) {
    return Object.keys(slots)
      .filter((name) => name.startsWith(prefix))
      .map((name) => name.slice(prefix.length))
      .filter((name) => !excluded.includes(name));
  }
  function resolvePaginationNumber(
    controlled: 'current' | 'pageSize',
    initial: 'defaultCurrent' | 'defaultPageSize',
    fallback: number,
  ) {
    const pagination = tableProps.pagination;
    return typeof pagination === 'object'
      ? Number(pagination[controlled] ?? pagination[initial] ?? fallback)
      : fallback;
  }
  function isObjectResult(
    value: unknown,
  ): value is Exclude<BasicCrudTableDataResult<TableData>, TableData[]> {
    return (
      !!value && typeof value === 'object' && Array.isArray((value as { data?: unknown }).data)
    );
  }
  async function handleFetchData(fetchParams: UnknownRecord = params.value) {
    if (isNil(fetchTableApi)) return;
    loading.value = true;
    try {
      const requestParams = fetchExcludeEmptyValues
        ? omitBy(fetchParams, (value) => value === '' || value === null || value === undefined)
        : fetchParams;
      const response = await fetchTableApi(requestParams);
      fetchData.value = response;
      const result = isFunction(tableDataTransformer)
        ? await tableDataTransformer(response)
        : (response as BasicCrudTableDataResult<TableData>);
      if (Array.isArray(result)) {
        tableData.value = result;
        total.value = result.length;
      } else if (isObjectResult(result)) {
        tableData.value = result.data;
        total.value = result.total ?? result.count ?? result.data.length;
      } else return;
      emit('tableFetched', tableData.value, result);
    } catch (error) {
      emit('error', error);
    } finally {
      loading.value = false;
    }
  }
  async function handleSearch() {
    current.value = 1;
    await handleFetchData();
    emit('search', toolbarModel.value);
  }
  async function handleReset() {
    current.value = 1;
    sorter.value = {};
    // 等待工具栏 v-model 同步：Toolbar.reset 先改 modelValue 再 emit 'reset'，
    // defineModel 的 update 是 flush:'pre' 异步触发，不等待会用旧筛选值请求。
    await nextTick();
    await handleFetchData();
    emit('reset');
  }

  /** 仅重置工具栏筛选项，不触发列表请求。 */
  function resetToolbar() {
    toolbarRef.value?.reset(false);
  }

  /** 重置工具栏筛选、分页与排序，并重新请求列表。 */
  async function reset() {
    resetToolbar();
    await handleReset();
  }

  function handleCreate() {
    if (openCreateModal) void modalRef.value?.open();
    emit('create');
  }
  async function handleEdit(row: TableData, context?: unknown) {
    await modalRef.value?.open(row);
    emit('edit', row, context);
  }
  const deleteConfirmContent = ref('确定要删除此条记录吗？');
  const pendingDeleteRow = shallowRef<TableData>();

  function resolveDeleteContent(row: TableData): string | Promise<string> {
    if (isString(deleteContent)) return deleteContent;
    if (isFunction(deleteContent)) return deleteContent(row);
    const name = deleteNameKey ? row[deleteNameKey] : undefined;
    return name ? `确定删除【${String(name)}】吗？` : '确定要删除此条记录吗？';
  }

  function handleDeletePopupChange(visible: boolean, row: TableData) {
    if (!visible) return;
    pendingDeleteRow.value = row;
    const resolved = resolveDeleteContent(row);
    if (isPromise(resolved)) {
      resolved.then((content) => {
        if (pendingDeleteRow.value === row) deleteConfirmContent.value = content;
      });
    } else {
      deleteConfirmContent.value = resolved;
    }
  }

  async function executeDelete(row: TableData, context?: unknown): Promise<boolean> {
    if (beforeDelete && (await beforeDelete(row)) === false) return false;
    emit('delete', row, context);
    try {
      if (deleteApi) await deleteApi(row);
      await handleFetchData();
      return true;
    } catch (error) {
      emit('error', error);
      return false;
    }
  }

  function handleDeleteConfirm(): Promise<boolean> {
    const row = pendingDeleteRow.value;
    if (!row) return Promise.resolve(false);
    return executeDelete(row);
  }
  async function handleModalSuccess(
    result: unknown,
    context: BasicCrudTableModalSubmitContext<TableData>,
  ) {
    await handleFetchData();
    emit('modalSuccess', result, context);
  }
  async function handlePageChange(value: number) {
    current.value = value;
    await handleFetchData();
  }
  async function handlePageSizeChange(value: number) {
    pageSize.value = value;
    current.value = 1;
    await handleFetchData();
  }
  async function handleTableChange(_data: TableData[], extra: TableChangeExtra) {
    if (extra.type !== 'sorter') return;
    sorter.value =
      extra.sorter?.field && extra.sorter.direction
        ? {
            sort_by:
              extra.sorter.direction === 'descend' ? `-${extra.sorter.field}` : extra.sorter.field,
          }
        : {};
    current.value = 1;
    await handleFetchData();
  }

  defineExpose({
    fetchTableData: handleFetchData,
    search: handleSearch,
    /** 重置工具栏筛选 + 分页/排序并刷新（全量重置）。 */
    reset,
    /** 仅重置工具栏筛选项，不刷新。 */
    resetToolbar,
    /** 仅重置分页/排序并刷新，不动工具栏。 */
    resetTable: handleReset,
    create: handleCreate,
    edit: handleEdit,
    delete: executeDelete,
    tableData: computed(() => tableData.value),
    fetchData: computed(() => fetchData.value),
    isCreate: computed(() => modalRef.value?.type === 'create'),
    modalRef,
  });
</script>
