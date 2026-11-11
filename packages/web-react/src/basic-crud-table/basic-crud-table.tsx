import { createElement, useImperativeHandle, useRef, type MouseEvent } from 'react';

import type { BasicCrudTableProps } from './types.js';

import { Button, type ButtonProps } from '../button/index.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { Link } from '../link/index.js';
import { useI18n } from '../locale/index.js';
import { Popconfirm } from '../popconfirm/index.js';
import { Space } from '../space/index.js';
import { Spin } from '../spin/index.js';
import { Table, type TableCellData, type TableColumnData, type TableData } from '../table/index.js';
import { Toolbar, type ToolbarInstance } from '../toolbar/index.js';
import { BasicCrudModal, type CrudModalInstance } from './modal.js';
import { useCrudTable } from './use-table.js';

export function BasicCrudTable<Row extends TableData = TableData>(props: BasicCrudTableProps<Row>) {
  const { tableProps = {}, toolbarProps = {}, slots = {} } = props;
  const config = useConfig();
  const prefix = usePrefix('basic-crud-table');
  const { t } = useI18n();
  const toolbar = useRef<ToolbarInstance>(null);
  const modal = useRef<CrudModalInstance<Row>>(null);
  const state = useCrudTable(
    {
      ...props,
      pagination: tableProps.pagination,
      defaultPageSize: config.pagination?.defaultPageSize,
    },
    toolbar,
    modal,
  );
  const { foundation } = state;
  useImperativeHandle(
    props.ref,
    () => ({
      fetchTableData: foundation.handleFetchData,
      search: foundation.handleSearch,
      reset: foundation.reset,
      resetToolbar: foundation.resetToolbar,
      resetTable: foundation.handleReset,
      create: foundation.handleCreate,
      edit: foundation.handleEdit,
      delete: foundation.executeDelete,
      get tableData() {
        return state.tableData.value;
      },
      get fetchData() {
        return state.state.fetchData;
      },
      get isCreate() {
        return modal.current?.type === 'create';
      },
      get modalRef() {
        return modal.current;
      },
    }),
    [foundation, state.tableData, state.state],
  );
  const render = (name: string, data: Record<string, unknown> = {}) => slots[name]?.(data);
  const names = (family: string, exclude: string[] = []) =>
    Object.keys(slots)
      .filter(
        (name) =>
          name.startsWith(`${family}__`) && !exclude.includes(name.slice(family.length + 2)),
      )
      .map((name) => name.slice(family.length + 2));
  const createButton = createElement(
    Button,
    {
      type: 'primary',
      ...props.createBtn,
      onClick(event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
        if (props.createBtn?.href !== undefined)
          props.createBtn.onClick?.(event as MouseEvent<HTMLAnchorElement>);
        else props.createBtn?.onClick?.(event as MouseEvent<HTMLButtonElement>);
        foundation.handleCreate();
      },
    } as ButtonProps,
    t('basicCrudTable.create'),
  );
  const action = (data: TableCellData) => {
    const row = data.record as Row;
    const edit = typeof props.editBtn === 'function' ? props.editBtn(row) : props.editBtn;
    const remove = typeof props.deleteBtn === 'function' ? props.deleteBtn(row) : props.deleteBtn;
    const name = props.deleteNameKey
      ? state.state.pendingDeleteRow?.[props.deleteNameKey]
      : undefined;
    const content =
      state.state.customDeleteConfirmContent ??
      (name
        ? t('basicCrudTable.deleteNamedConfirm', String(name))
        : t('basicCrudTable.deleteConfirm'));
    return (
      <Space>
        {render('table__action_prepend', { ...data })}
        {props.showEdit !== false && (
          <Link
            ellipsis={false}
            {...edit}
            onClick={(event) => {
              edit?.onClick?.(event);
              void foundation.handleEdit(row, data);
            }}
          >
            {t('basicCrudTable.edit')}
          </Link>
        )}
        {props.showDelete !== false && (
          <Popconfirm
            content={content}
            type="warning"
            onBeforeOk={() => foundation.executeDelete(row)}
            onPopupVisibleChange={(visible) => {
              void foundation.handleDeletePopupChange(visible, row);
            }}
          >
            <Link ellipsis={false} status="danger" {...remove}>
              {t('basicCrudTable.delete')}
            </Link>
          </Popconfirm>
        )}
        {render('table__action_append', { ...data })}
      </Space>
    );
  };
  const columns: TableColumnData[] =
    props.showActionColumn === false
      ? props.columns
      : [
          ...props.columns,
          {
            title: t('basicCrudTable.actions'),
            dataIndex: '__basic_crud_action__',
            slotName: 'basic-crud-action',
            width: props.actionWidth ?? 120,
            fixed: 'right',
          },
        ];
  const pagination =
    tableProps.pagination === false
      ? false
      : {
          ...(typeof tableProps.pagination === 'object' ? tableProps.pagination : {}),
          current: state.state.current,
          pageSize: state.state.pageSize,
          total: state.state.total,
        };
  const tableNames = names('table', ['action_prepend', 'action_append']);
  return (
    <section
      className={[
        prefix,
        props.className,
        props.fullHeight && `${prefix}-full-height`,
        state.loading.value && `${prefix}-loading`,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-busy={state.loading.value}
      style={props.style}
    >
      {props.showHeader !== false && (
        <header className={`${prefix}-header`}>
          {slots.header__title ? (
            render('header__title', { title: props.title })
          ) : props.showTitle !== false && props.title ? (
            <h3 className={`${prefix}-title`}>{props.title}</h3>
          ) : null}
          {render('header__extra')}
          {props.showToolbar === false && props.showCreate !== false && (
            <div className={`${prefix}-header-actions`}>{createButton}</div>
          )}
          {props.showToolbar !== false && (
            <Toolbar
              {...toolbarProps}
              ref={toolbar}
              value={state.toolbarModel.value}
              onValueChange={(next) => {
                state.toolbarModel.value = next;
                toolbarProps.onValueChange?.(next);
              }}
              loading={state.loading.value}
              searchBtn={props.searchBtn}
              resetBtn={props.resetBtn}
              onSearch={(params) => {
                toolbarProps.onSearch?.(params);
                void foundation.handleSearch();
              }}
              onReset={() => {
                toolbarProps.onReset?.();
                void foundation.handleReset();
              }}
              slots={{
                ...toolbarProps.slots,
                ...Object.fromEntries(
                  names('toolbar', [
                    'default',
                    'action_prepend',
                    'action_middle',
                    'action_append',
                  ]).map((name) => [name, (data) => render(`toolbar__${name}`, { ...data })]),
                ),
              }}
              actionPrepend={
                slots.toolbar__action_prepend
                  ? render('toolbar__action_prepend')
                  : toolbarProps.actionPrepend
              }
              actionAppend={
                <>
                  {render('toolbar__action_middle')}
                  {props.showCreate !== false && createButton}
                  {render('toolbar__action_append')}
                </>
              }
            >
              {slots.toolbar__default ? render('toolbar__default') : toolbarProps.children}
            </Toolbar>
          )}
        </header>
      )}
      <Spin
        {...config.basicCrudTableSpinProps}
        {...props.spinProps}
        loading={state.loading.value}
        className={[
          `${prefix}-body`,
          props.spinProps?.className ?? config.basicCrudTableSpinProps?.className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Table
          {...tableProps}
          columns={columns}
          data={state.tableData.value}
          pagination={pagination}
          scroll={props.fullHeight ? { ...tableProps.scroll, y: '100%' } : tableProps.scroll}
          cellSlots={{
            ...tableProps.cellSlots,
            ...Object.fromEntries(
              tableNames.map((name) => [
                name,
                (data: TableCellData) => render(`table__${name}`, { ...data }),
              ]),
            ),
            'basic-crud-action': action,
          }}
          titleSlots={{
            ...tableProps.titleSlots,
            ...Object.fromEntries(
              tableNames.map((name) => [
                name,
                (data: { column: TableColumnData }) => render(`table__${name}`, { ...data }),
              ]),
            ),
          }}
          filterSlots={{
            ...tableProps.filterSlots,
            ...Object.fromEntries(
              tableNames.map((name) => [name, (data) => render(`table__${name}`, { ...data })]),
            ),
          }}
          empty={slots.table__empty ? render('table__empty') : tableProps.empty}
          footer={slots.table__footer ? render('table__footer') : tableProps.footer}
          onPageChange={(page) => {
            void foundation.handlePageChange(page);
          }}
          onPageSizeChange={(size) => {
            void foundation.handlePageSizeChange(size);
          }}
          onChange={(data, extra) => {
            void foundation.handleTableChange(data as Row[], extra);
          }}
        />
      </Spin>
      <BasicCrudModal
        ref={modal}
        model={props.modalModel}
        defaultModel={props.defaultModalModel}
        visible={props.modalVisible}
        onModelChange={props.onModalModelChange}
        onVisibleChange={props.onModalVisibleChange}
        modalProps={props.modalProps}
        modalFormProps={props.modalFormProps}
        createApi={props.createApi}
        updateApi={props.updateApi}
        detailApi={props.detailApi}
        valueTransformer={props.valueTransformer}
        beforeSubmit={props.beforeModalSubmit}
        onSuccess={(result, context) => {
          void foundation.handleModalSuccess(result, context);
        }}
        onClose={props.onModalClose}
        onError={props.onError}
        slots={Object.fromEntries(
          names('modal').map((name) => [name, (data) => render(`modal__${name}`, { ...data })]),
        )}
      />
    </section>
  );
}
