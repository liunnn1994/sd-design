<template>
  <div class="sd:w-75 sd:mr-6 sd:mb-6">
    <sd-date-picker
      :shortcuts="[
        {
          label: '2 hours later',
          value: () => dayjs().add(2, 'hour').toDate(),
        },
        {
          label: 'a week later',
          value: () => dayjs().add(1, 'week').toDate(),
        },
        {
          label: 'a month later',
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
          label: 'last month',
          value: () => dayjs().subtract(1, 'month').toDate(),
        },
        {
          label: 'six months later',
          value: () => dayjs().add(6, 'month').toDate(),
        },
        {
          label: 'two years later',
          value: () => dayjs().add(2, 'year').toDate(),
        },
      ]"
    />
  </div>
  <div class="sd:w-100 sd:mr-6 sd:mb-6">
    <sd-range-picker
      :shortcuts="[
        {
          label: 'next 7 days',
          value: () => [dayjs().toDate(), dayjs().add(1, 'week').toDate()],
        },
        {
          label: 'next 30 days',
          value: () => [dayjs().toDate(), dayjs().add(1, 'month').toDate()],
        },
        {
          label: 'next 365 days',
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
      ]"
    />
  </div>
</template>
<script setup lang="ts">
  import dayjs from 'dayjs';
</script>
