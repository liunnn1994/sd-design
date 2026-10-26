<template>
  <sd-tabs
    type="card-gutter"
    :editable="true"
    @add="handleAdd"
    @delete="handleDelete"
    show-add-button
    auto-switch
  >
    <sd-tab-pane
      v-for="(item, index) of data"
      :key="item.key"
      :title="item.title"
      :closable="index !== 2"
    >
      {{ item?.content }}
    </sd-tab-pane>
  </sd-tabs>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  let count = 5;

  const data = ref([
    {
      key: '1',
      title: '标签页 1',
      content: '标签页面板内容 1',
    },
    {
      key: '2',
      title: '标签页 2',
      content: '标签页面板内容 2',
    },
    {
      key: '3',
      title: '标签页 3',
      content: '标签页面板内容 3',
    },
    {
      key: '4',
      title: '标签页 4',
      content: '标签页面板内容 4',
    },
  ]);

  const handleAdd = () => {
    const number = count++;
    data.value = data.value.concat({
      key: `${number}`,
      title: `新标签页 ${number}`,
      content: `新标签页面板内容 ${number}`,
    });
  };
  const handleDelete = (key: string | number) => {
    data.value = data.value.filter((item) => item.key !== key);
  };
</script>
