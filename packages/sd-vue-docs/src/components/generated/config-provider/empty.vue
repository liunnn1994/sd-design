<template>
  <sd-config-provider>
    <template #empty="scope">
      <sd-empty
        v-if="scope?.component === 'cascader'"
        description="暂无级联选项"
        in-config-provider
      >
      </sd-empty>
      <sd-empty
        v-else-if="scope?.component === 'select'"
        description="暂无选项"
        in-config-provider
      ></sd-empty>
      <sd-empty
        v-else-if="scope?.component === 'tree-select'"
        description="暂无树选项"
        in-config-provider
      ></sd-empty>
      <sd-empty
        v-else-if="scope?.component === 'list'"
        description="暂无列表数据"
        in-config-provider
      ></sd-empty>
      <sd-empty
        v-else-if="scope?.component === 'table'"
        description="暂无表格数据"
        in-config-provider
      ></sd-empty>
      <div v-else class="my-empty">
        <icon-trophy />
      </div>
    </template>
    <sd-space direction="vertical" fill>
      <sd-cascader :options="[]" placeholder="级联选择" allow-search />
      <sd-select placeholder="选择框" allow-search />
      <sd-tree-select placeholder="树选择器" />
      <sd-list>
        <template #header> 暂无列表数据 </template>
      </sd-list>
      <sd-table :columns="columns" :data="[]" />
      <sd-empty></sd-empty>
    </sd-space>
  </sd-config-provider>
</template>

<script setup lang="ts">
  import { IconTrophy } from '@sdata/web-vue/es/icon/index.js';

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '薪资',
      dataIndex: 'salary',
    },
    {
      title: '地址',
      dataIndex: 'address',
    },
    {
      title: '电子邮箱',
      dataIndex: 'email',
    },
  ];
</script>

<style>
  .my-empty {
    box-sizing: border-box;
    width: 100%;
    padding: 20px;
    text-align: center;
  }
</style>
