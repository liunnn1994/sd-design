<template>
  <div class="sd:w-63.5 sd:mr-6 sd:mb-5">
    <sd-date-picker shortcuts-position="left" :shortcuts="shortcuts" />
  </div>
  <div class="sd:w-75 sd:mb-5">
    <sd-range-picker shortcuts-position="left" :shortcuts="rangeShortcuts" />
  </div>
  <div class="sd:w-63.5 sd:mr-6">
    <sd-date-picker shortcuts-position="right" :shortcuts="shortcuts" />
  </div>
  <div class="sd:w-75">
    <sd-range-picker shortcuts-position="right" :shortcuts="rangeShortcuts" />
  </div>
</template>
<script setup lang="ts">
  import dayjs from 'dayjs';

  const shortcuts = [
    {
      label: '昨天',
      value: () => dayjs().subtract(1, 'day').toDate(),
    },
    {
      label: '今天',
      value: () => dayjs().toDate(),
    },
    {
      label: '一周后',
      value: () => dayjs().add(1, 'week').toDate(),
    },
    {
      label: '一个月后',
      value: () => dayjs().add(1, 'month').toDate(),
    },
    {
      label: '两个月后',
      value: () => dayjs().add(2, 'month').toDate(),
    },
  ];

  const rangeShortcuts = [
    {
      label: '未来两天',
      value: () => [dayjs().toDate(), dayjs().add(2, 'day').toDate()],
    },
    {
      label: '未来七天',
      value: () => [dayjs().toDate(), dayjs().add(1, 'week').toDate()],
    },
    {
      label: '未来三十天',
      value: () => [dayjs().toDate(), dayjs().add(1, 'month').toDate()],
    },
    {
      label: '未来六个月',
      value: () => [dayjs().toDate(), dayjs().add(6, 'month').toDate()],
    },
    {
      label: '未来十二个月',
      value: () => [dayjs().toDate(), dayjs().add(1, 'year').toDate()],
    },
    {
      label: '未来十年',
      value: () => [dayjs().toDate(), dayjs().add(10, 'year').toDate()],
    },
  ];
</script>
