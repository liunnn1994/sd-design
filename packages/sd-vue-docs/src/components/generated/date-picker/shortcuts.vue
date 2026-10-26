<template>
  <div class="sd:w-75 sd:mr-6 sd:mb-6">
    <sd-date-picker
      :shortcuts="[
        {
          label: '两小时后',
          value: () => dayjs().add(2, 'hour').toDate(),
        },
        {
          label: '一周后',
          value: () => dayjs().add(1, 'week').toDate(),
        },
        {
          label: '一个月后',
          value: () => dayjs().add(1, 'month').toDate(),
        },
      ]"
      show-time
    />
  </div>
  <div class="sd:w-75 sd:mr-6 sd:mb-6">
    <sd-month-picker
      :shortcuts="[
        {
          label: '上个月',
          value: () => dayjs().subtract(1, 'month').toDate(),
        },
        {
          label: '六个月后',
          value: () => dayjs().add(6, 'month').toDate(),
        },
        {
          label: '两年后',
          value: () => dayjs().add(2, 'year').toDate(),
        },
      ]"
    />
  </div>
  <div class="sd:w-100 sd:mr-6 sd:mb-6">
    <sd-range-picker
      :shortcuts="[
        {
          label: '未来七天',
          value: () => [dayjs().toDate(), dayjs().add(1, 'week').toDate()],
        },
        {
          label: '未来三十天',
          value: () => [dayjs().toDate(), dayjs().add(1, 'month').toDate()],
        },
        {
          label: '未来一年',
          value: () => [dayjs().toDate(), dayjs().add(1, 'year').toDate()],
        },
      ]"
    />
  </div>
  <div class="sd:w-75 sd:mb-6">
    <sd-range-picker
      mode="month"
      :shortcuts="[
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
      ]"
    />
  </div>
</template>
<script setup lang="ts">
  import dayjs from 'dayjs';
</script>
