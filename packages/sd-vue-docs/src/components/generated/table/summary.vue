<template>
  <div class="sd:grid sd:gap-4">
    <sd-table :columns="columns" :data="data" :summary="true" :summary-span-method="spanMethod" />
    <sd-table
      :columns="columns"
      :data="data"
      :scroll="scroll"
      :expandable="expandable"
      :summary="summary"
    >
      <template #summary-cell="{ column, record, rowIndex }">
        <div :class="getColorClass(column, record)">{{ getSummaryValue(column, record) }}</div>
      </template>
    </sd-table>
  </div>
</template>
<script setup lang="ts">
  import type {
    TableColumnData,
    TableData,
    TableExpandable,
    TableSpanMethod,
    TableSpanMethodContext,
    TableSummary,
    TableSummaryContext,
  } from '@sdata/web-vue';

  import type { CSSProperties } from 'vue';
  import { reactive } from 'vue';
  const expandable: TableExpandable = { title: '展开', width: 80 };
  const scroll = { x: 2000, y: 200 };
  const columns = reactive<TableColumnData[]>([
    { title: '姓名', dataIndex: 'name', fixed: 'left', width: 140 },
    {
      title: '薪资',
      dataIndex: 'salary',
      summaryCellStyle: (record): CSSProperties => {
        if (Number(record.salary) > 100000) {
          return { backgroundColor: 'rgb(var(--sdblue-6))', color: '#fff' };
        }
        return {};
      },
    },
    { title: '数据 1', dataIndex: 'data1' },
    { title: '数据 2', dataIndex: 'data2' },
  ]);
  const data = reactive<TableData[]>([
    { key: '1', name: '王芳', salary: 23000, data1: 10, data2: 8, expand: '展开内容' },
    { key: '2', name: '张晓', salary: 25000, data1: 9, data2: -12 },
    { key: '3', name: '赵晨', salary: 22000, data1: 15, data2: -2 },
    { key: '4', name: '李明', salary: 17000, data1: 2, data2: 3 },
    { key: '5', name: '陈宇', salary: 27000, data1: 11, data2: 0 },
  ]);
  const summary: TableSummary = ({ columns, data }: TableSummaryContext) => {
    let countData = { salary: 0, data1: 0, data2: 0 };
    data.forEach((record) => {
      countData.salary += Number(record.salary);
      countData.data1 += Number(record.data1);
      countData.data2 += Number(record.data2);
    });
    return [
      {
        name: '平均值',
        salary: countData.salary / data.length,
        data1: countData.data1 / data.length,
        data2: countData.data2 / data.length,
      },
      { name: '合计', salary: countData.salary, data1: countData.data1, data2: countData.data2 },
    ];
  };
  const getColorClass = (column: TableColumnData, record: TableData) => {
    const dataIndex = column.dataIndex;
    if (dataIndex && ['data1', 'data2'].includes(dataIndex)) {
      return Number(record[dataIndex]) > 0 ? 'sd:text-[red]' : 'sd:text-[green]';
    }
    return undefined;
  };
  const getSummaryValue = (column: TableColumnData, record: TableData) => {
    const dataIndex = column.dataIndex;
    return dataIndex ? record[dataIndex] : undefined;
  };
  const spanMethod: TableSpanMethod = ({ rowIndex, columnIndex }: TableSpanMethodContext) => {
    if (rowIndex === 0 && columnIndex === 1) {
      return { colspan: 2 };
    }
  };
</script>
