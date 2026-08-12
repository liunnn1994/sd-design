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
      label: 'yesterday',
      value: () => dayjs().subtract(1, 'day').toDate(),
    },
    {
      label: 'today',
      value: () => dayjs().toDate(),
    },
    {
      label: 'a week later',
      value: () => dayjs().add(1, 'week').toDate(),
    },
    {
      label: 'a month later',
      value: () => dayjs().add(1, 'month').toDate(),
    },
    {
      label: '2 months later',
      value: () => dayjs().add(2, 'month').toDate(),
    },
  ];

  const rangeShortcuts = [
    {
      label: 'next 2 days',
      value: () => [dayjs().toDate(), dayjs().add(2, 'day').toDate()],
    },
    {
      label: 'next 7 days',
      value: () => [dayjs().toDate(), dayjs().add(1, 'week').toDate()],
    },
    {
      label: 'next 30 days',
      value: () => [dayjs().toDate(), dayjs().add(1, 'month').toDate()],
    },
    {
      label: 'next 6 months',
      value: () => [dayjs().toDate(), dayjs().add(6, 'month').toDate()],
    },
    {
      label: 'next 12 months',
      value: () => [dayjs().toDate(), dayjs().add(1, 'year').toDate()],
    },
    {
      label: 'next 10 years',
      value: () => [dayjs().toDate(), dayjs().add(10, 'year').toDate()],
    },
  ];
</script>
