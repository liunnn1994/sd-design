<template>
  <a-date-picker
    style="width: 254px; margin-bottom: 20px; margin-right: 24px;"
    shortcuts-position="left"
    :shortcuts="shortcuts"
  />
  <a-range-picker
    style="width: 300px; margin-bottom: 20px;"
    shortcuts-position="left"
    :shortcuts="rangeShortcuts"
  />
  <br />
  <a-date-picker
    style="width: 254px; margin-right: 24px;"
    shortcuts-position="right"
    :shortcuts="shortcuts"
  />
  <a-range-picker style="width: 300px;" shortcuts-position="right" :shortcuts="rangeShortcuts" />
</template>
<script>
  import dayjs from 'dayjs';
  export default {
    setup() {
      return {
        dayjs,
        shortcuts: [
          {
            label: 'yesterday',
            value: () => dayjs().subtract(1, 'day'),
          },
          {
            label: 'today',
            value: () => dayjs(),
          },
          {
            label: 'a week later',
            value: () => dayjs().add(1, 'week'),
          },
          {
            label: 'a month later',
            value: () => dayjs().add(1, 'month'),
          },
          {
            label: '2 months later',
            value: () => dayjs().add(2, 'month'),
          },
        ],
        rangeShortcuts: [
          {
            label: 'next 2 days',
            value: () => [dayjs(), dayjs().add(2, 'day')],
          },
          {
            label: 'next 7 days',
            value: () => [dayjs(), dayjs().add(1, 'week')],
          },
          {
            label: 'next 30 days',
            value: () => [dayjs(), dayjs().add(1, 'month')],
          },
          {
            label: 'next 6 months',
            value: () => [dayjs(), dayjs().add(6, 'month')],
          },
          {
            label: 'next 12 months',
            value: () => [dayjs(), dayjs().add(1, 'year')],
          },
          {
            label: 'next 10 years',
            value: () => [dayjs(), dayjs().add(10, 'year')],
          },
        ],
      };
    },
  };
</script>
