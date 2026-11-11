<script setup lang="ts">
  const data = Array.from({ length: 24 }, (_, index) => ({
    value: `option${index + 1}`,
    label: `选项 ${index + 1}`,
  }));
  const columns = [{ title: '选项', dataIndex: 'label' }];
</script>

<template>
  <sd-transfer :data="data" :default-value="['option1', 'option3', 'option5']">
    <template #source="{ data: items, selectedKeys, onSelect }">
      <sd-table
        row-key="value"
        :columns="columns"
        :data="items.map((item) => ({ ...item }))"
        :pagination="{ pageSize: 5, simple: true }"
        :row-selection="{ type: 'checkbox', showCheckedAll: true }"
        :selected-keys="selectedKeys"
        @update:selected-keys="(keys) => onSelect?.(keys.map(String))"
      />
    </template>
    <template #target="{ data: items, selectedKeys, onSelect }">
      <sd-table
        row-key="value"
        :columns="columns"
        :data="items.map((item) => ({ ...item }))"
        :pagination="{ pageSize: 5, simple: true }"
        :row-selection="{ type: 'checkbox', showCheckedAll: true }"
        :selected-keys="selectedKeys"
        @update:selected-keys="(keys) => onSelect?.(keys.map(String))"
      />
    </template>
  </sd-transfer>
</template>
