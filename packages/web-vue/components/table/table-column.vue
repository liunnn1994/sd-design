<template>
  <VNodeRenderer :content="getChildren()" />
</template>

<script setup lang="ts">
  import {
    getCurrentInstance,
    inject,
    onBeforeUnmount,
    provide,
    reactive,
    ref,
    toRefs,
    useSlots,
    watch,
    type CSSProperties,
    type PropType,
    type Ref,
    type VNodeChild,
  } from 'vue';

  import type { ClassName } from '../_utils/types';
  import type { TableContext } from './context';
  import type { TableColumnData, TableData, TableFilterable, TableSortable } from './interface';

  import { useChildrenComponents } from '../_hooks/use-children-components';
  import { usePureProp } from '../_hooks/use-pure-prop';
  import { tableColumnInjectionKey, tableInjectionKey } from './context';

  defineOptions({
    name: 'TableColumn',
    inheritAttrs: false,
  });

  const props = defineProps({
    /**
     * @zh 列信息的标识，对应TableData中的数据
     * @en Identifies the column information, corresponding to the data in TableData
     */
    dataIndex: String,
    /** @zh 列标题 @en Column title */
    title: String,
    /** @zh 列宽度 @en Column width */
    width: Number,
    /** @zh 最小列宽 @en Minimum column width */
    minWidth: Number,
    /** @zh 对齐方向 @en Alignment direction */
    align: String as PropType<TableColumnData['align']>,
    /** @zh 固定位置 @en Fixed position */
    fixed: String as PropType<TableColumnData['fixed']>,
    /** @zh 是否显示为省略 @en Whether to display as omitted */
    ellipsis: {
      type: Boolean,
      default: false,
    },
    /** @zh 排序相关选项 @en Sorting related options */
    sortable: {
      type: Object as PropType<TableSortable>,
      default: undefined,
    },
    /** @zh 过滤相关选项 @en Filter related options */
    filterable: {
      type: Object as PropType<TableFilterable>,
      default: undefined,
    },
    /** @zh 自定义单元格类名 @en Custom cell class @version 2.36.0 */
    cellClass: [String, Array, Object] as PropType<ClassName>,
    /** @zh 自定义表头单元格类名 @en Custom header cell class @version 2.36.0 */
    headerCellClass: [String, Array, Object] as PropType<ClassName>,
    /** @zh 自定义内容单元格类名 @en Custom body cell class @version 2.36.0 */
    bodyCellClass: [String, Array, Object, Function] as PropType<
      ClassName | ((record: TableData) => ClassName)
    >,
    /** @zh 自定义总结栏单元格类名 @en Custom summary cell class @version 2.36.0 */
    summaryCellClass: [String, Array, Object, Function] as PropType<
      ClassName | ((record: TableData) => ClassName)
    >,
    /** @zh 自定义单元格样式 @en Custom cell style @version 2.11.0 */
    cellStyle: Object as PropType<CSSProperties>,
    /** @zh 自定义表头单元格样式 @en Custom header cell style @version 2.29.0 */
    headerCellStyle: Object as PropType<CSSProperties>,
    /** @zh 自定义内容单元格样式 @en Custom body cell style @version 2.29.0 */
    bodyCellStyle: [Object, Function] as PropType<
      CSSProperties | ((record: TableData) => CSSProperties)
    >,
    /** @zh 自定义总结栏单元格样式 @en Custom summary cell style @version 2.30.0 */
    summaryCellStyle: [Object, Function] as PropType<
      CSSProperties | ((record: TableData) => CSSProperties)
    >,
    /**
     * @zh 用于手动指定选项的 index。2.26.0 版本后不再需要手动指定
     * @en Index for manually specifying option
     * @version 2.20.2
     */
    index: Number,
    /** @zh 在省略时是否显示文字提示 @en Whether to show text hints when omitted @version 2.26.0 */
    tooltip: {
      type: [Boolean, Object],
      default: false,
    },
  });

  /**
   * @zh 单元格
   * @en Cell
   * @slot cell
   * @binding {TableData} record
   * @binding {TableColumnData} column
   * @binding {number} rowIndex
   */
  /** @zh 标题 @en Title @slot title */
  /**
   * @zh 自定义筛选弹出框内容
   * @en Custom filter popup content
   * @slot filter-content
   * @version 2.23.0
   */
  /** @zh 筛选按钮图标 @en Filter button icon @slot filter-icon @version 2.23.0 */
  const slots = useSlots();
  const VNodeRenderer = ({ content }: { content: VNodeChild }) => content;
  const { dataIndex, title, width, align, fixed, ellipsis, index, minWidth } = toRefs(props);
  const sortable = usePureProp(props, 'sortable');
  const filterable = usePureProp(props, 'filterable');
  const cellClass = usePureProp(props, 'cellClass') as Ref<typeof props.cellClass>;
  const headerCellClass = usePureProp(props, 'headerCellClass') as Ref<
    typeof props.headerCellClass
  >;
  const bodyCellClass = usePureProp(props, 'bodyCellClass') as Ref<typeof props.bodyCellClass>;
  const summaryCellClass = usePureProp(props, 'summaryCellClass') as Ref<
    typeof props.summaryCellClass
  >;
  const cellStyle = usePureProp(props, 'cellStyle');
  const headerCellStyle = usePureProp(props, 'headerCellStyle');
  const bodyCellStyle = usePureProp(props, 'bodyCellStyle');
  const summaryCellStyle = usePureProp(props, 'summaryCellStyle');
  const tooltip = usePureProp(props, 'tooltip');

  const instance = getCurrentInstance();
  const tableCtx = inject<Partial<TableContext>>(tableInjectionKey, {});
  const tableColumnCtx = inject(tableColumnInjectionKey, undefined);
  const { children, components } = useChildrenComponents('TableColumn');
  const childrenColumnMap = reactive(new Map<number, TableColumnData>());

  function addChild(id: number, data: TableColumnData) {
    childrenColumnMap.set(id, data);
  }

  function removeChild(id: number) {
    childrenColumnMap.delete(id);
  }

  provide(tableColumnInjectionKey, { addChild, removeChild });

  const childrenColumns = ref<TableColumnData[]>();
  watch([components, childrenColumnMap], ([componentIds, columnMap]) => {
    if (componentIds.length > 0) {
      const columns: TableColumnData[] = [];
      componentIds.forEach((id) => {
        const column = columnMap.get(id);
        if (column) columns.push(column);
      });
      childrenColumns.value = columns;
    } else {
      childrenColumns.value = undefined;
    }
  });

  const column = reactive({
    dataIndex,
    title,
    width,
    minWidth,
    align,
    fixed,
    ellipsis,
    sortable,
    filterable,
    cellClass,
    headerCellClass,
    bodyCellClass,
    summaryCellClass,
    cellStyle,
    headerCellStyle,
    bodyCellStyle,
    summaryCellStyle,
    index,
    tooltip,
    children: childrenColumns,
    slots,
  });

  if (instance) {
    if (tableColumnCtx) {
      tableColumnCtx.addChild(instance.uid, column);
    } else {
      tableCtx.addColumn?.(instance.uid, column);
    }
  }

  onBeforeUnmount(() => {
    if (!instance) return;
    if (tableColumnCtx) {
      tableColumnCtx.removeChild(instance.uid);
    } else {
      tableCtx.removeColumn?.(instance.uid);
    }
  });

  function getChildren() {
    children.value = slots.default?.();
    return children.value;
  }
</script>
