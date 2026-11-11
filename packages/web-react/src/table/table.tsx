import type { CSSProperties, ReactNode } from 'react';

import { debounce } from '@sdata/web-core/_utils/debounce';
import { getSummaryData, mapRawTableData, wrapRows } from '@sdata/web-core/table/data';
import { createTableChangeFoundation } from '@sdata/web-core/table/interaction';
import {
  getGroupColumns,
  getTableFixedColumns,
  getTableGridTemplate,
  getTableOperations,
} from '@sdata/web-core/table/layout';
import { computeTableSpans } from '@sdata/web-core/table/span';
import {
  cloneElement,
  Fragment,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import type {
  TableColumnData,
  TableData,
  TableDataWithRaw,
  TableOperationColumn,
  TableProps,
} from './types.js';

import { getRenderItems } from '../_shared/children.js';
import { VirtualList, type VirtualListRef } from '../_shared/virtual-list.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { Empty } from '../empty/index.js';
import IconMinus from '../icon/icon-minus.js';
import IconPlus from '../icon/icon-plus.js';
import { Pagination } from '../pagination/index.js';
import { Scrollbar, type ScrollbarExposed } from '../scrollbar/index.js';
import { Spin } from '../spin/index.js';
import { getChildColumns } from './column.js';
import { TableContext } from './context.js';
import { OperationTd, OperationTh } from './operation.js';
import { Tbody, Thead, Tr } from './row.js';
import { Td } from './td.js';
import { Th } from './th.js';
import { useTableColumnResize } from './use-column-resize.js';
import { useTableData } from './use-data.js';
import { useTableDrag } from './use-drag.js';
import { useTableExpand } from './use-expand.js';
import { useTablePagination } from './use-pagination.js';
import { useTableFilter, useTableSorter } from './use-query.js';
import { useTableRowSelection } from './use-row-selection.js';
import { renderTableContent, tableClassName } from './utils.js';

const emptyData: TableData[] = [];
const emptyColumns: TableColumnData[] = [];
const cssSize = (value?: number | string) => (typeof value === 'number' ? `${value}px` : value);

export function Table(props: TableProps) {
  const config = useConfig();
  const prefix = usePrefix('table');
  const {
    columns = emptyColumns,
    data = emptyData,
    children,
    bordered = config.table?.bordered ?? true,
    hoverable = config.table?.hoverable ?? true,
    stripe = config.table?.stripe ?? false,
    size = config.size ?? 'large',
    tableLayoutFixed = config.table?.tableLayoutFixed ?? false,
    loading = false,
    spinProps,
    rowSelection,
    expandable,
    scroll,
    pagination = config.table?.pagination ?? true,
    pagePosition = config.table?.pagePosition ?? 'br',
    indentSize = config.table?.indentSize ?? 16,
    rowKey = 'key',
    showHeader = config.table?.showHeader ?? true,
    virtualListProps,
    spanMethod,
    spanAll = false,
    components,
    loadMore,
    filterIconAlignLeft = config.table?.filterIconAlignLeft ?? false,
    hideExpandButtonOnEmpty = config.table?.hideExpandButtonOnEmpty ?? false,
    rowClass,
    draggable,
    rowNumber: _rowNumber,
    columnResizable = config.table?.columnResizable ?? false,
    summary,
    summaryText = config.table?.summaryText ?? 'Summary',
    summarySpanMethod,
    selectedKeys,
    defaultSelectedKeys,
    expandedKeys,
    defaultExpandedKeys,
    defaultExpandAllRows = false,
    stickyHeader = config.table?.stickyHeader ?? false,
    scrollbar = config.table?.scrollbar ?? true,
    showEmptyTree = config.table?.showEmptyTree ?? false,
    onSelectedKeysChange,
    onExpandedKeysChange,
    onExpand,
    onExpandedChange,
    onSelect,
    onSelectAll,
    onSelectionChange,
    onSorterChange: _onSorterChange,
    onFilterChange: _onFilterChange,
    onPageChange,
    onPageSizeChange,
    onChange: _onChange,
    onCellMouseEnter: _onCellMouseEnter,
    onCellMouseLeave: _onCellMouseLeave,
    onCellClick,
    onRowClick,
    onHeaderClick,
    onColumnResize,
    onRowDblclick,
    onCellDblclick,
    onRowContextmenu,
    onCellContextmenu,
    renderExpandIcon,
    renderExpandRow,
    footer,
    dragHandleIcon,
    paginationLeft,
    paginationRight,
    renderSummaryCell,
    empty,
    theadComponent,
    tbodyComponent,
    trComponent,
    tdComponent,
    thComponent,
    renderContent,
    renderThead,
    renderTbody,
    renderTr,
    renderTh,
    renderTd,
    titleSlots,
    cellSlots,
    filterSlots,
    ref,
    className,
    style,
    ...attrs
  } = props;
  const elements = useRef<Record<string, HTMLElement>>(Object.create(null));
  const [dragRoot, setDragRoot] = useState<HTMLDivElement | null>(null);
  const drag = useTableDrag({
    root: dragRoot,
    draggable,
    getSortedData: (): TableDataWithRaw[] => model.getSortedData(),
    onChange: (): void => change.change('drag'),
  });
  const container = useRef<HTMLDivElement>(null);
  const headerElement = useRef<HTMLDivElement>(null);
  const summaryElement = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<ScrollbarExposed>(null);
  const nativeViewport = useRef<HTMLDivElement>(null);
  const virtualRef = useRef<VirtualListRef>(null);
  const virtualPrefix = usePrefix('virtual-list');
  const [scrollPosition, setScrollPosition] = useState('both');
  const [viewportWidth, setViewportWidth] = useState(0);
  const getViewport = () =>
    scrollbarRef.current?.elements()?.viewport ??
    nativeViewport.current ??
    container.current?.querySelector<HTMLElement>(`.${virtualPrefix}-scroller`);
  const updateScroll = (element: HTMLElement) => {
    const left = element.scrollLeft === 0;
    const right = Math.ceil(element.scrollLeft + element.offsetWidth) >= element.scrollWidth;
    setScrollPosition(left && right ? 'both' : left ? 'left' : right ? 'right' : 'middle');
    setViewportWidth(element.clientWidth);
    if (headerElement.current) headerElement.current.scrollLeft = element.scrollLeft;
    if (summaryElement.current) summaryElement.current.scrollLeft = element.scrollLeft;
  };
  const onBodyScroll = (event: Event) => {
    if (event.target instanceof HTMLElement) updateScroll(event.target);
    if (typeof scrollbar === 'object') scrollbar.onScroll?.(event);
  };
  useLayoutEffect(() => {
    const viewport = getViewport();
    if (viewport) updateScroll(viewport);
    const observer = new ResizeObserver(() => {
      const currentViewport = getViewport();
      if (currentViewport) updateScroll(currentViewport);
    });
    if (container.current) observer.observe(container.current);
    if (viewport) observer.observe(viewport);
    return () => observer.disconnect();
  });
  const resize = useTableColumnResize(elements.current, onColumnResize);
  const columnMap = new Map<string, TableColumnData>();
  const declared = getChildColumns(children);
  const manual = !!renderContent || (!declared.length && getRenderItems(children).length > 0);
  const { dataColumns, groupColumns } = getGroupColumns(
    declared.length ? declared : columns,
    columnMap,
    resize.columnWidth,
  );
  const filter = useTableFilter(dataColumns, (field, values) => change.filter(field, values));
  const sorter = useTableSorter(dataColumns, (field, direction) => change.sort(field, direction));
  const page = useTablePagination({ pagination, onPageChange, onPageSizeChange });
  const model = useTableData({
    data,
    rowKey,
    columns: columnMap,
    get filters() {
      return filter.filters;
    },
    get sorter() {
      return sorter.sorter;
    },
    get page() {
      return page.page;
    },
    get pageSize() {
      return page.pageSize;
    },
    pagination: !!pagination,
    loadMore: !!loadMore,
    hideExpandButtonOnEmpty,
    dragState: drag,
  });
  const splitTable =
    !!scroll?.y ||
    !!scroll?.maxHeight ||
    stickyHeader !== false ||
    !!virtualListProps ||
    (!!(scroll?.x || scroll?.minWidth) && !model.rows.length);
  const selection = useTableRowSelection<TableData>({
    selectedKeys,
    defaultSelectedKeys,
    rowSelection,
    currentAllRowKeys: model.currentAllRowKeys,
    currentAllEnabledRowKeys: model.currentAllEnabledRowKeys,
    onSelect,
    onSelectAll,
    onSelectionChange,
    onSelectedKeysChange,
  });
  const expansion = useTableExpand<TableData>({
    expandedKeys,
    defaultExpandedKeys,
    defaultExpandAllRows,
    expandable,
    allRowKeys: model.allRowKeys,
    onExpand,
    onExpandedChange,
    onExpandedKeysChange,
  });
  const current = useRef({ props, filter, sorter, page, model, selection });
  current.current = { props, filter, sorter, page, model, selection };
  const [hoverEvents] = useState(() => ({
    enter: debounce(
      (record: TableDataWithRaw, column: TableColumnData, event: Event) =>
        current.current.props.onCellMouseEnter?.(record.raw, column, event),
      30,
    ),
    leave: debounce(
      (record: TableDataWithRaw, column: TableColumnData, event: Event) =>
        current.current.props.onCellMouseLeave?.(record.raw, column, event),
      30,
    ),
  }));
  useLayoutEffect(
    () => () => {
      hoverEvents.enter.cancel();
      hoverEvents.leave.cancel();
    },
    [hoverEvents],
  );
  const [change] = useState(() =>
    createTableChangeFoundation<TableData, TableDataWithRaw>(
      {
        get page() {
          return current.current.page.page;
        },
        get pageSize() {
          return current.current.page.pageSize;
        },
        get sorter() {
          return current.current.sorter.sorter;
        },
        get filters() {
          return current.current.filter.filters;
        },
        get dragTarget() {
          return drag.data;
        },
        get rawData() {
          return mapRawTableData(current.current.model.getPageData());
        },
        get sortedData() {
          return current.current.model.getSortedData();
        },
        get onlyCurrent() {
          return current.current.props.rowSelection?.onlyCurrent ?? false;
        },
      },
      {
        setFilters: (value) => current.current.filter.setFilters(value),
        setSorter: (value) => current.current.sorter.setSorter(value),
        onFilterChange: (field, values) => current.current.props.onFilterChange?.(field, values),
        onSorterChange: (field, direction) =>
          current.current.props.onSorterChange?.(field, direction),
        onChange: (raw, extra, sorted) => current.current.props.onChange?.(raw, extra, sorted),
        changePage: (value) => current.current.page.handlePageChange(value),
        changePageSize: (value) => current.current.page.handlePageSizeChange(value),
        clearSelected: () => current.current.selection.clearSelected(),
      },
    ),
  );
  const previousPage = useRef(page.page);
  useLayoutEffect(() => {
    change.pageStateChanged(page.page, previousPage.current);
    previousPage.current = page.page;
  }, [page.page, change]);
  useLayoutEffect(() => {
    if (resize.resizingColumn && (!columnResizable || !columnMap.has(resize.resizingColumn)))
      resize.handleThMouseUp();
  });
  useImperativeHandle(
    ref,
    () => ({
      selectAll: selection.selectAll,
      select: selection.select,
      expandAll: expansion.expandAll,
      expand: expansion.expand,
      resetFilters: filter.resetFilters,
      clearFilters: filter.clearFilters,
      resetSorters: sorter.resetSorters,
      clearSorters: sorter.clearSorters,
      scrollIntoView: (options) => virtualRef.current?.scrollTo(options),
    }),
    [selection, expansion, filter, sorter],
  );
  const fixed = getTableFixedColumns({ rowSelection, expandable, draggable, columns: dataColumns });
  const operations = getTableOperations<ReactNode | (() => ReactNode)>({
    hasLeftFixedColumn: fixed.left,
    hasRightFixedColumn: fixed.right,
    hasLeftFixedDataColumns: fixed.leftData,
    rowSelection,
    expandable,
    draggable,
    operations: components?.operations,
  });
  const allColumns: (TableColumnData | TableOperationColumn)[] = [...operations, ...dataColumns];
  const spans = computeTableSpans(model.rows, spanAll ? allColumns : dataColumns, spanMethod);
  const summaryRows = summary
    ? wrapRows(
        typeof summary === 'function'
          ? summary({ columns: dataColumns, data: model.rawRows })
          : [getSummaryData(dataColumns, model.rows, summaryText)],
        rowKey,
      )
    : [];
  const summarySpans = computeTableSpans(summaryRows, allColumns, summarySpanMethod);
  const totalColumns = allColumns.length;
  const sortedCount = model.getSortedData().length;
  const expandContent = (record: TableDataWithRaw) =>
    record.expand
      ? renderTableContent(record.expand)
      : renderExpandRow
        ? renderExpandRow({ record: record.raw })
        : expandable?.expandedRowRender?.(record.raw);
  const expandButton = (record: TableDataWithRaw, stopPropagation = true) => {
    const expanded = expansion.expandedRowKeys.includes(record.key);
    return (
      <button
        type="button"
        className={`${prefix}-expand-btn`}
        onClick={(event) => {
          expansion.handleExpand(record.key, record.raw);
          if (stopPropagation) event.stopPropagation();
        }}
      >
        {renderExpandIcon?.({ expanded, record: record.raw }) ??
          expandable?.icon?.(expanded, record.raw) ??
          (expanded ? <IconMinus /> : <IconPlus />)}
      </button>
    );
  };
  const renderEmpty = () => (
    <Tr empty>
      <Td colSpan={totalColumns}>
        {empty ?? config.renderEmpty?.({ component: 'table' }) ?? <Empty />}
      </Td>
    </Tr>
  );
  const renderRecord = (
    record: TableDataWithRaw,
    rowIndex: number,
    indent: number,
    indexPath?: number[],
    allowDrag = true,
  ): ReactNode => {
    const content = expandContent(record);
    const expanded = expansion.expandedRowKeys.includes(record.key);
    const path = indexPath
      ? indexPath.concat(rowIndex)
      : [
          pagination && sortedCount > page.pageSize
            ? (page.page - 1) * page.pageSize + rowIndex
            : rowIndex,
        ];
    const source = drag.sourceKey === record.key;
    return (
      <Fragment key={record.key}>
        <Tr
          data-table-drag-path={draggable && allowDrag ? JSON.stringify(path) : undefined}
          component={trComponent}
          renderTr={renderTr}
          rowIndex={rowIndex}
          record={record}
          checked={!!rowSelection && selection.selectedRowKeys.includes(record.key)}
          className={tableClassName(
            {
              [`${prefix}-tr-drag`]: source,
              [`${prefix}-tr-drop-target`]:
                drag.dragging && !source && path.toString() === drag.targetPath.toString(),
            },
            typeof rowClass === 'function' ? rowClass(record.raw, rowIndex) : rowClass,
          )}
          onClick={(event) => onRowClick?.(record.raw, event.nativeEvent)}
          onDoubleClick={(event) => onRowDblclick?.(record.raw, event.nativeEvent)}
          onContextMenu={(event) => onRowContextmenu?.(record.raw, event.nativeEvent)}
        >
          {operations.map((operation, index) => {
            const id = `${rowIndex}-${index}-${record.key}`;
            if (spanAll && spans.removedCells.includes(id)) return null;
            const [rowSpan, colSpan] = spanAll ? (spans.tableSpan[id] ?? [1, 1]) : [1, 1];
            return (
              <OperationTd
                key={operation.name}
                operationColumn={operation}
                operations={operations}
                record={record}
                selectedRowKeys={selection.currentSelectedRowKeys}
                hasExpand={!!content}
                renderExpandBtn={expandButton}
                rowSpan={rowSpan}
                colSpan={colSpan}
                dragHandleIcon={dragHandleIcon}
              />
            );
          })}
          {dataColumns.map((column, index) => {
            const id = `${rowIndex}-${spanAll ? operations.length + index : index}-${record.key}`;
            if (spans.removedCells.includes(id)) return null;
            const [rowSpan, colSpan] = spans.tableSpan[id] ?? [1, 1];
            return (
              <Td
                key={column.dataIndex}
                component={tdComponent}
                renderTd={renderTd}
                record={record}
                column={column}
                rowIndex={rowIndex}
                operations={operations}
                dataColumns={dataColumns}
                rowSpan={rowSpan}
                colSpan={colSpan}
                showExpandBtn={index === 0 && record.hasSubtree}
                indentSize={index === 0 ? (record.hasSubtree ? indent - 20 : indent) : 0}
                renderExpandBtn={expandButton}
                onClick={(event) => onCellClick?.(record.raw, column, event.nativeEvent)}
                onDoubleClick={(event) => onCellDblclick?.(record.raw, column, event.nativeEvent)}
                onContextMenu={(event) =>
                  onCellContextmenu?.(record.raw, column, event.nativeEvent)
                }
                onMouseEnter={(event) => hoverEvents.enter(record, column, event.nativeEvent)}
                onMouseLeave={(event) => hoverEvents.leave(record, column, event.nativeEvent)}
              />
            );
          })}
        </Tr>
        {expanded &&
          (record.hasSubtree ? (
            record.children?.length === 0 && showEmptyTree ? (
              renderEmpty()
            ) : (
              record.children?.map((child, index) =>
                renderRecord(child, index, indent + indentSize, path, allowDrag && !source),
              )
            )
          ) : content ? (
            <Tr expand>
              <Td
                colSpan={totalColumns}
                isFixedExpand={fixed.left || fixed.right}
                containerWidth={viewportWidth}
              >
                {content}
              </Td>
            </Tr>
          ) : null)}
      </Fragment>
    );
  };
  const header = showHeader && (
    <Thead component={theadComponent} renderThead={renderThead}>
      {groupColumns.map((row, rowIndex) => (
        <Tr key={rowIndex}>
          {rowIndex === 0 &&
            operations.map((operation) => (
              <OperationTh
                key={operation.name}
                operationColumn={operation}
                operations={operations}
                rowSpan={groupColumns.length}
                selectAll={
                  operation.name === 'selection-checkbox' && !!rowSelection?.showCheckedAll
                }
              />
            ))}
          {row.map((column, index) => (
            <Th
              key={column.dataIndex ?? index}
              ref={(instance) => {
                if (!column.dataIndex) return;
                const element = instance?.getThElement();
                if (element) elements.current[column.dataIndex] = element;
                else delete elements.current[column.dataIndex];
              }}
              component={thComponent}
              renderTh={renderTh}
              column={column}
              operations={operations}
              dataColumns={dataColumns}
              resizable={columnResizable && !!column.dataIndex && index < row.length - 1}
              onClick={(event) => onHeaderClick?.(column, event.nativeEvent)}
            />
          ))}
        </Tr>
      ))}
    </Thead>
  );
  const hasSubtree = model.rows.some((record) => record.hasSubtree);
  const body = (
    <Tbody component={tbodyComponent} renderTbody={renderTbody}>
      {model.rows.length
        ? model.rows.map((record, index) => renderRecord(record, index, hasSubtree ? 20 : 0))
        : renderEmpty()}
    </Tbody>
  );
  const gridStyle = {
    '--sd-table-grid-template': getTableGridTemplate(dataColumns, operations, resize.columnWidth),
    'width': cssSize(scroll?.x),
    'minWidth': cssSize(scroll?.minWidth),
  } as CSSProperties;
  const summaryView = summaryRows.length > 0 && (
    <div
      ref={summaryElement}
      className={`${prefix}-tfoot`}
      style={splitTable ? { overflow: 'hidden' } : undefined}
    >
      <div className={`${prefix}-tfoot-content`} style={gridStyle}>
        {summaryRows.map((record, rowIndex) => (
          <Tr key={rowIndex} record={record} rowIndex={rowIndex} renderTr={renderTr}>
            {operations.map((operation, index) => {
              const id = `${rowIndex}-${index}-${record.key}`;
              if (summarySpans.removedCells.includes(id)) return null;
              const [rowSpan, colSpan] = summarySpans.tableSpan[id] ?? [1, 1];
              return (
                <OperationTd
                  key={operation.name}
                  operationColumn={operation}
                  operations={operations}
                  record={record}
                  summary
                  rowSpan={rowSpan}
                  colSpan={colSpan}
                />
              );
            })}
            {dataColumns.map((column, index) => {
              const id = `${rowIndex}-${operations.length + index}-${record.key}`;
              if (summarySpans.removedCells.includes(id)) return null;
              const [rowSpan, colSpan] = summarySpans.tableSpan[id] ?? [1, 1];
              return (
                <Td
                  key={column.dataIndex}
                  component={tdComponent}
                  renderTd={renderTd}
                  record={record}
                  column={column}
                  rowIndex={rowIndex}
                  operations={operations}
                  dataColumns={dataColumns}
                  summary
                  rowSpan={rowSpan}
                  colSpan={colSpan}
                  renderCell={renderSummaryCell}
                />
              );
            })}
          </Tr>
        ))}
      </div>
    </div>
  );
  const bodySize =
    typeof scroll?.y === 'string'
      ? { height: '100%', minHeight: 0 }
      : { maxHeight: cssSize(scroll?.y ?? scroll?.maxHeight) ?? '100%', minHeight: 0 };
  const bodyTable = (
    <div className={`${prefix}-element`} style={gridStyle}>
      {body}
    </div>
  );
  const virtualProps = { ...config.virtualListProps, ...virtualListProps };
  const table = manual ? (
    <div className={`${prefix}-element`}>{renderContent ? renderContent() : children}</div>
  ) : splitTable ? (
    <>
      {showHeader && (
        <div
          ref={headerElement}
          className={tableClassName(
            `${prefix}-header`,
            stickyHeader !== false && `${prefix}-header-sticky`,
          )}
          style={{ top: typeof stickyHeader === 'number' ? `${stickyHeader}px` : undefined }}
        >
          <div className={`${prefix}-element`} style={gridStyle}>
            {header}
          </div>
        </div>
      )}
      {virtualListProps && model.rows.length ? (
        <VirtualList
          prerender={20}
          {...virtualProps}
          ref={virtualRef}
          items={model.rows}
          keyField="key"
          listTag="div"
          itemTag="div"
          listClass={`${prefix}-element`}
          listStyle={gridStyle}
          itemClass={`${prefix}-virtual-item`}
          listAttrs={{}}
          className={tableClassName(`${prefix}-body`, virtualProps.className)}
          height={virtualProps.height ?? (typeof scroll?.y === 'number' ? scroll.y : '100%')}
          scrollbar={scrollbar}
          onScroll={(event) => {
            onBodyScroll(event);
            virtualProps.onScroll?.(event);
          }}
        >
          {({ item, index }) => renderRecord(item, index, 0)}
        </VirtualList>
      ) : scrollbar === false ? (
        <div
          ref={nativeViewport}
          className={`${prefix}-body`}
          style={{ ...bodySize, overflow: 'auto' }}
          onScroll={(event) => onBodyScroll(event.nativeEvent)}
        >
          {bodyTable}
        </div>
      ) : (
        <Scrollbar
          {...(typeof scrollbar === 'object' ? scrollbar : undefined)}
          ref={scrollbarRef}
          className={tableClassName(
            `${prefix}-body`,
            typeof scrollbar === 'object' ? scrollbar.className : undefined,
          )}
          outerStyle={{
            ...bodySize,
            ...(typeof scrollbar === 'object' ? scrollbar.outerStyle : undefined),
          }}
          style={{ ...bodySize, ...(typeof scrollbar === 'object' ? scrollbar.style : undefined) }}
          onScroll={onBodyScroll}
        >
          {bodyTable}
        </Scrollbar>
      )}
      {summaryView}
    </>
  ) : (
    <div className={`${prefix}-element`} style={gridStyle}>
      {header}
      {body}
      {summaryView}
    </div>
  );
  const paginationView = pagination !== false && model.getSortedData().length > 0 && (
    <div
      className={tableClassName(`${prefix}-pagination`, {
        [`${prefix}-pagination-left`]: pagePosition === 'tl' || pagePosition === 'bl',
        [`${prefix}-pagination-center`]: pagePosition === 'top' || pagePosition === 'bottom',
        [`${prefix}-pagination-right`]: pagePosition === 'tr' || pagePosition === 'br',
        [`${prefix}-pagination-top`]: ['tl', 'top', 'tr'].includes(pagePosition),
      })}
    >
      {paginationLeft}
      <Pagination
        total={model.getFilteredData().length}
        {...(typeof pagination === 'object' ? pagination : undefined)}
        current={page.page}
        pageSize={page.pageSize}
        onChange={(value) => {
          change.page(value);
          if (typeof pagination === 'object') pagination.onChange?.(value);
        }}
        onPageSizeChange={(value) => {
          change.pageSize(value);
          if (typeof pagination === 'object') pagination.onPageSizeChange?.(value);
        }}
      />
      {paginationRight}
    </div>
  );
  const border =
    typeof bordered === 'object' ? { wrapper: true, ...bordered } : { wrapper: bordered };
  const contentWrapper = manual ? (
    <Fragment />
  ) : (
    <Spin
      {...config.tableSpinProps}
      {...spinProps}
      {...(typeof loading === 'object' ? loading : { loading })}
    />
  );
  return (
    <TableContext.Provider
      value={{
        sorter: sorter.sorter,
        filters: filter.filters,
        filterIconAlignLeft,
        resizingColumn: resize.resizingColumn,
        checkStrictly: rowSelection?.checkStrictly ?? true,
        currentAllEnabledRowKeys: model.currentAllEnabledRowKeys,
        currentSelectedRowKeys: selection.currentSelectedRowKeys,
        onSelect: selection.handleSelect,
        onSelectAll: selection.handleSelectAll,
        onSelectAllLeafs: selection.handleSelectAllLeafs,
        onSorterChange: change.sort,
        onFilterChange: change.filter,
        onThMouseDown: resize.handleThMouseDown,
        loadMore,
        addLazyLoadData: model.addLazyLoadData,
        titleSlots,
        cellSlots,
        filterSlots,
      }}
    >
      <div
        {...attrs}
        ref={manual ? undefined : setDragRoot}
        role="table"
        className={tableClassName(
          prefix,
          `${prefix}-size-${size}`,
          {
            [`${prefix}-border`]: !!border.wrapper,
            [`${prefix}-border-cell`]: !!border.cell,
            [`${prefix}-border-header-cell`]: !border.cell && !!border.headerCell,
            [`${prefix}-border-body-cell`]: !border.cell && !!border.bodyCell,
            [`${prefix}-stripe`]: stripe,
            [`${prefix}-hover`]: hoverable,
            [`${prefix}-dragging`]: drag.dragging,
            [`${prefix}-type-selection`]: !!rowSelection,
            [`${prefix}-empty`]: !model.rows.length,
            [`${prefix}-layout-fixed`]:
              tableLayoutFixed ||
              splitTable ||
              !!scroll?.x ||
              !!scroll?.minWidth ||
              dataColumns.some((column) => column.ellipsis),
          },
          className,
        )}
        style={{
          ...(!manual && typeof scroll?.y === 'string' ? { height: scroll.y } : undefined),
          ...style,
        }}
      >
        {cloneElement(
          contentWrapper,
          undefined,
          <>
            {!manual && ['tl', 'top', 'tr'].includes(pagePosition) && paginationView}
            <div
              ref={container}
              className={tableClassName(
                `${prefix}-container`,
                {
                  [`${prefix}-scroll-y`]: splitTable,
                  [`${prefix}-has-fixed-col-left`]: fixed.left,
                  [`${prefix}-has-fixed-col-right`]: fixed.right,
                },
                !!(scroll?.x || scroll?.minWidth) && `${prefix}-scroll-position-${scrollPosition}`,
              )}
            >
              {scrollbar === false || splitTable ? (
                <div
                  ref={splitTable ? undefined : nativeViewport}
                  className={tableClassName(
                    `${prefix}-content`,
                    !splitTable && `${prefix}-content-scroll-x`,
                  )}
                  style={{
                    overflow: splitTable ? 'hidden' : 'auto',
                    maxHeight: cssSize(scroll?.maxHeight),
                  }}
                  onScroll={splitTable ? undefined : (event) => onBodyScroll(event.nativeEvent)}
                >
                  {table}
                </div>
              ) : (
                <Scrollbar
                  {...(typeof scrollbar === 'object' ? scrollbar : undefined)}
                  ref={scrollbarRef}
                  className={tableClassName(
                    `${prefix}-content`,
                    `${prefix}-content-scroll-x`,
                    typeof scrollbar === 'object' ? scrollbar.className : undefined,
                  )}
                  outerStyle={{
                    height: '100%',
                    ...(typeof scrollbar === 'object' ? scrollbar.outerStyle : undefined),
                  }}
                  style={{
                    maxHeight: cssSize(scroll?.y ?? scroll?.maxHeight),
                    ...(typeof scrollbar === 'object' ? scrollbar.style : undefined),
                  }}
                  onScroll={onBodyScroll}
                >
                  {table}
                </Scrollbar>
              )}
            </div>
            {footer !== undefined && <div className={`${prefix}-footer`}>{footer}</div>}
            {!manual && !['tl', 'top', 'tr'].includes(pagePosition) && paginationView}
          </>,
        )}
      </div>
    </TableContext.Provider>
  );
}
