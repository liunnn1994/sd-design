<template>
  <section :class="cls" :aria-busy="loading">
    <header v-if="showHeader" :class="`${prefixCls}-header`">
      <slot name="header__title" :title="title">
        <h3 v-if="showTitle && title" :class="`${prefixCls}-title`">{{ title }}</h3>
      </slot>
      <slot name="header__extra" />
      <div v-if="!showToolbar && showCreate" :class="`${prefixCls}-header-actions`">
        <Button type="primary" v-bind="createBtn" @click="handleCreate">{{
          t('basicCrudTable.create')
        }}</Button>
      </div>

      <Toolbar
        v-if="showToolbar"
        ref="toolbarRef"
        v-model="toolbarModel"
        v-bind="toolbarProps"
        :loading="loading"
        :search-btn="searchBtn"
        :reset-btn="resetBtn"
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
          <slot name="toolbar__action_middle" />
          <Button v-if="showCreate" type="primary" v-bind="createBtn" @click="handleCreate">
            {{ t('basicCrudTable.create') }}
          </Button>
          <slot name="toolbar__action_append" />
        </template>
        <template v-for="name in toolbarSlotNames()" :key="name" #[name]="data">
          <slot :name="`toolbar__${name}`" v-bind="data" />
        </template>
      </Toolbar>
    </header>

    <Spin v-bind="resolvedSpinProps" :loading="loading" :class="`${prefixCls}-body`">
      <Table
        v-bind="tableProps"
        :scroll="resolvedTableScroll"
        :columns="resolvedColumns"
        :data="tableData"
        :pagination="resolvedPagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        @change="handleTableChange"
      >
        <template v-for="name in tableSlotNames()" :key="name" #[name]="data">
          <slot :name="`table__${name}`" v-bind="data" />
        </template>
        <template #basic-crud-action="data">
          <Space>
            <slot name="table__action_prepend" v-bind="data" />
            <Link
              v-if="showEdit"
              :ellipsis="false"
              v-bind="resolveRowLinkProps(editBtn, data.record)"
              @click="handleEdit(data.record, data)"
            >
              {{ t('basicCrudTable.edit') }}
            </Link>
            <Popconfirm
              v-if="showDelete"
              :content="deleteConfirmContent"
              type="warning"
              :on-before-ok="() => executeDelete(data.record)"
              @popup-visible-change="(visible) => handleDeletePopupChange(visible, data.record)"
            >
              <Link
                :ellipsis="false"
                status="danger"
                v-bind="resolveRowLinkProps(deleteBtn, data.record)"
              >
                {{ t('basicCrudTable.delete') }}
              </Link>
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
      <template v-for="name in modalSlotNames()" :key="name" #[name]="data">
        <slot :name="`modal__${name}`" v-bind="data" />
      </template>
    </BasicCrudModal>
  </section>
</template>

<script setup lang="ts">
  import type { UnknownRecord } from 'type-fest';

  import type { VNode } from 'vue';
  import {
    computed,
    inject,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    useSlots,
  } from 'vue';

  import {
    createBasicCrudTableFoundation,
    resolvePaginationNumber as resolveInitialPagination,
  } from '@sdata/web-core/basic-crud-table/foundation';
  import { isFunction } from 'es-toolkit';

  import type { TableData } from '../table';
  import type { ToolbarInstance, ToolbarModelValue } from '../toolbar';
  import type {
    BasicCrudTableActionSlotProps,
    BasicCrudTableDataResult,
    BasicCrudTableModalSubmitContext,
    BasicCrudTableProps,
    BasicCrudTableRowLinkProps,
  } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import Button from '../button';
  import { configProviderInjectionKey } from '../config-provider/context';
  import Link from '../link';
  import { useI18n } from '../locale';
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
    searchBtn,
    resetBtn,
    createBtn,
    editBtn,
    deleteBtn,
    spinProps,
    modalProps = {},
    modalFormProps = { schemas: [] },
    fullHeight = false,
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

  /**
   * @zh 表格加载状态
   * @en Table loading state
   */
  const loading = defineModel<boolean>('loading', { default: false });
  /**
   * @zh 工具栏筛选数据
   * @en Toolbar filter data
   */
  const toolbarModel = defineModel<ToolbarModelValue>('toolbarModel', { default: () => ({}) });
  /**
   * @zh 当前表格数据
   * @en Current table data
   */
  const tableData = defineModel<TableData[]>('tableData', { default: () => [] });
  /**
   * @zh 弹窗表单数据
   * @en Modal form data
   */
  const modalModel = defineModel<UnknownRecord>('modalModel', { default: () => ({}) });
  /**
   * @zh 弹窗是否可见
   * @en Whether the modal is visible
   */
  const modalVisible = defineModel<boolean>('modalVisible', { default: false });

  const slots = useSlots();
  const configProvider = inject(configProviderInjectionKey, undefined);
  const resolvedSpinProps = computed(() => ({
    ...configProvider?.basicCrudTableSpinProps,
    ...spinProps,
  }));
  const toolbarRef = shallowRef<ToolbarInstance>();
  const modalRef = shallowRef<InstanceType<typeof BasicCrudModal>>();
  const current = shallowRef(resolvePaginationNumber('current', 'defaultCurrent', 1));
  const pageSize = shallowRef(resolvePaginationNumber('pageSize', 'defaultPageSize', 10));
  const total = shallowRef(0);
  const sorter = shallowRef<UnknownRecord>({});
  const fetchData = shallowRef<unknown>();
  const { t } = useI18n();

  const prefixCls = getPrefixCls('basic-crud-table');
  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-full-height`]: fullHeight,
      [`${prefixCls}-loading`]: loading.value,
    },
  ]);
  const toolbarSlotNames = () =>
    getForwardedSlotNames('toolbar__', [
      'default',
      'action_prepend',
      'action_middle',
      'action_append',
    ]);
  const tableSlotNames = () =>
    getForwardedSlotNames('table__', ['action_prepend', 'action_append']);
  const modalSlotNames = () => getForwardedSlotNames('modal__');
  const resolvedColumns = computed(() =>
    showActionColumn
      ? [
          ...columns,
          {
            title: t('basicCrudTable.actions'),
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
  const resolvedTableScroll = computed(() =>
    fullHeight ? { ...tableProps.scroll, y: '100%' } : tableProps.scroll,
  );
  onMounted(() => {
    if (fetchTableOnMounted) void handleFetchData();
  });

  function getForwardedSlotNames(prefix: string, excluded: string[] = []) {
    return Object.keys(slots)
      .filter((name) => name.startsWith(prefix))
      .map((name) => name.slice(prefix.length))
      .filter((name) => !excluded.includes(name));
  }
  function resolveRowLinkProps(
    value: BasicCrudTableRowLinkProps<TableData> | undefined,
    row: TableData,
  ) {
    return isFunction(value) ? value(row) : value;
  }
  function resolvePaginationNumber(
    controlled: 'current' | 'pageSize',
    initial: 'defaultCurrent' | 'defaultPageSize',
    fallback: number,
  ) {
    return resolveInitialPagination(
      tableProps.pagination,
      configProvider?.pagination?.defaultPageSize,
      controlled,
      initial,
      fallback,
    );
  }
  const customDeleteConfirmContent = ref<string>();
  const pendingDeleteRow = shallowRef<TableData>();
  const deleteConfirmContent = computed(() => {
    if (customDeleteConfirmContent.value !== undefined) return customDeleteConfirmContent.value;
    const name = deleteNameKey ? pendingDeleteRow.value?.[deleteNameKey] : undefined;
    return name
      ? t('basicCrudTable.deleteNamedConfirm', String(name))
      : t('basicCrudTable.deleteConfirm');
  });
  const foundation: ReturnType<typeof createBasicCrudTableFoundation<TableData>> =
    createBasicCrudTableFoundation<TableData>(
      {
        props: {
          get fetchTableApi() {
            return fetchTableApi;
          },
          get tableDataTransformer() {
            return tableDataTransformer;
          },
          get fetchExcludeEmptyValues() {
            return fetchExcludeEmptyValues;
          },
          get openCreateModal() {
            return openCreateModal;
          },
          get deleteContent() {
            return deleteContent;
          },
          get deleteApi() {
            return deleteApi;
          },
          get beforeDelete() {
            return beforeDelete;
          },
        },
        get loading() {
          return loading.value;
        },
        set loading(value) {
          loading.value = value;
        },
        get toolbarModel() {
          return toolbarModel.value;
        },
        get params(): UnknownRecord {
          return params.value;
        },
        set toolbarModel(value) {
          toolbarModel.value = value;
        },
        get tableData() {
          return tableData.value;
        },
        set tableData(value) {
          tableData.value = value;
        },
        get current() {
          return current.value;
        },
        set current(value) {
          current.value = value;
        },
        get pageSize() {
          return pageSize.value;
        },
        set pageSize(value) {
          pageSize.value = value;
        },
        get total() {
          return total.value;
        },
        set total(value) {
          total.value = value;
        },
        get sorter() {
          return sorter.value;
        },
        set sorter(value) {
          sorter.value = value;
        },
        get fetchData() {
          return fetchData.value;
        },
        set fetchData(value) {
          fetchData.value = value;
        },
        get customDeleteConfirmContent() {
          return customDeleteConfirmContent.value;
        },
        set customDeleteConfirmContent(value) {
          customDeleteConfirmContent.value = value;
        },
        get pendingDeleteRow() {
          return pendingDeleteRow.value;
        },
        set pendingDeleteRow(value) {
          pendingDeleteRow.value = value;
        },
      },
      {
        create: () => emit('create'),
        edit: (row, context) => emit('edit', row, context),
        delete: (row, context) => emit('delete', row, context),
        reset: () => emit('reset'),
        search: (params) => emit('search', params),
        tableFetched: (rows, result) => emit('tableFetched', rows, result),
        modalSuccess: (result, context) => emit('modalSuccess', result, context),
        error: (error) => emit('error', error),
        afterRender: () => nextTick(),
        resetToolbar: () => toolbarRef.value?.reset(false),
        openModal: (row) => modalRef.value?.open(row),
      },
    );
  const params = computed(() => foundation.getParams());
  const {
    handleFetchData,
    handleSearch,
    handleReset,
    resetToolbar,
    reset,
    handleCreate,
    handleEdit,
    handleDeletePopupChange,
    executeDelete,
    handleModalSuccess,
    handlePageChange,
    handlePageSizeChange,
    handleTableChange,
  } = foundation;
  onBeforeUnmount(foundation.dispose);
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
