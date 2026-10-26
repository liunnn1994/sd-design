<template>
  <sd-list
    :grid-props="{ gutter: [20, 20], sm: 24, md: 12, lg: 8, xl: 6 }"
    :data="dataSource"
    :bordered="false"
  >
    <template #item="{ item }">
      <sd-list :data="item.data">
        <template #header>{{ item.title }}</template>
        <template #item="{ item: subItem }">
          <sd-list-item>{{ subItem }}</sd-list-item>
        </template>
      </sd-list>
    </template>
  </sd-list>
</template>

<script setup lang="ts">
  const dataSource = [
    {
      title: '平台',
      data: ['iOS', 'Android', 'Web'],
    },
    {
      title: '框架',
      data: ['Angular', 'Vue', 'React'],
    },
    {
      title: '语言',
      data: ['C++', 'JavaScript', 'Python'],
    },
    {
      title: '组件',
      data: ['按钮', '面包屑', '穿梭框'],
    },
    {
      title: '设计',
      data: ['Figma', 'Sketch', 'Adobe XD'],
    },
    {
      title: '插件',
      data: ['Edu Tools', 'BashSupport', 'GitToolBox'],
    },
    {
      title: '平台',
      data: ['iOS', 'Android', 'Web'],
    },
    {
      title: '框架',
      data: ['Angular', 'Vue', 'React'],
    },
    {
      title: '语言',
      data: ['C++', 'JavaScript', 'Python'],
    },
  ];
</script>
