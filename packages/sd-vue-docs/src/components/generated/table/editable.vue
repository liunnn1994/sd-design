<template>
  <sd-table :columns="columns" :data="data">
    <template #name="{ rowIndex }"> <sd-input v-model="data[rowIndex].name" /> </template>
    <template #province="{ rowIndex }">
      <sd-select
        v-model="data[rowIndex].province"
        :options="Object.keys(options)"
        @change="() => handleChange(rowIndex)"
      />
    </template>
    <template #city="{ rowIndex }">
      <sd-select
        :options="options[data[rowIndex].province ?? ''] || []"
        v-model="data[rowIndex].city"
      />
    </template>
  </sd-table>
  <!-- support from v2.25.0  -->
  <sd-table :columns="columns" :data="data" class="sd:mt-5">
    <template #name="{ record, rowIndex }"> <sd-input v-model="record.name" /> </template>
    <template #province="{ record, rowIndex }">
      <sd-select
        v-model="record.province"
        :options="Object.keys(options)"
        @change="
          () => {
            record.city = '';
          }
        "
      />
    </template>
    <template #city="{ record, rowIndex }">
      <sd-select :options="options[record.province] || []" v-model="record.city" />
    </template>
  </sd-table>
</template>
<script setup lang="ts">
  import type { TableColumnData, TableData } from '@sdata/web-vue';

  import { reactive } from 'vue';
  const options: Record<string, string[]> = {
    Beijing: ['海淀区', '朝阳区', '昌平区'],
    Sichuan: ['成都', '绵阳', '阿坝'],
    Guangdong: ['广州', '深圳', '汕头'],
  };
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name', slotName: 'name' },
    { title: '薪资', dataIndex: 'salary' },
    { title: '地址', dataIndex: 'address' },
    { title: '省份', dataIndex: 'province', slotName: 'province' },
    { title: '城市', dataIndex: 'city', slotName: 'city' },
    { title: '电子邮箱', dataIndex: 'email' },
  ];
  const data = reactive<(TableData & { name: string; province?: string; city?: string })[]>([
    {
      key: '1',
      name: '王芳',
      salary: 23000,
      address: '示例路 32 号',
      province: '北京',
      city: '海淀区',
      email: 'jane.doe@example.com',
    },
    {
      key: '2',
      name: '张晓',
      salary: 25000,
      address: '示例路 35 号',
      email: 'alisa.ross@example.com',
    },
    {
      key: '3',
      name: '赵晨',
      salary: 22000,
      address: '示例路 31 号',
      province: '四川',
      city: '绵阳',
      email: 'kevin.sandra@example.com',
    },
    {
      key: '4',
      name: '李明',
      salary: 17000,
      address: '示例路 42 号',
      email: 'ed.hellen@example.com',
    },
    {
      key: '5',
      name: '陈宇',
      salary: 27000,
      address: '示例路 62 号',
      email: 'william.smith@example.com',
    },
  ]);
  const handleChange = (rowIndex: number) => {
    data[rowIndex].city = '';
  };
</script>
